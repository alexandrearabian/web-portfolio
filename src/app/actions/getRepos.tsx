import { z } from "zod";

const repoSchema = z.object({
  id: z.number(),
  name: z.string(),
  private: z.boolean().optional(),
  description: z.string().nullable().optional(),
  html_url: z.string().url(),
  // GitHub often returns "" for homepage; don't require URL here.
  homepage: z.string().nullable().optional(),
  language: z.string().nullable().optional(),
  stargazers_count: z.number().optional(),
  topics: z.array(z.string()).optional(),
  owner: z.object({ login: z.string() }),
});

export type Repo = z.infer<typeof repoSchema> & {
  description: string | null;
  homepage?: string | null;
  language: string | null;
  stargazers_count?: number;
  topics: string[];
  private: boolean;
  // The image the repo's website shows when its link is shared.
  preview: string | null;
};

// A repo's website as a full URL, or null. GitHub stores it as typed: ""
// when unset, sometimes without a protocol ("example.com"), which would be
// a relative link on the page and break `new URL()` in the Work section.
function normalizeSite(homepage: string | null | undefined): string | null {
  const site = homepage?.trim();
  if (!site) return null;
  const url = /^https?:\/\//i.test(site) ? site : `https://${site}`;
  try {
    return new URL(url).href;
  } catch {
    return null;
  }
}

// Reads og:image (or twitter:image) from a page, the way messaging apps
// build a link preview. Cached for a day; any failure just means no image.
async function sharePreview(site: string): Promise<string | null> {
  try {
    const res = await fetch(site, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; web-portfolio)" },
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const html = (await res.text()).slice(0, 300_000);
    for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
      if (
        !/(?:property|name)=["'](?:og:image|twitter:image)(?::url)?["']/i.test(
          tag,
        )
      )
        continue;
      const content = /content=["']([^"']+)["']/i.exec(tag)?.[1];
      if (!content) continue;
      const url = new URL(content.replaceAll("&amp;", "&"), res.url);
      if (url.protocol === "https:" || url.protocol === "http:")
        return url.href;
    }
  } catch {}
  return null;
}

const USER = "alexandrearabian";

// GitHub has no REST API for profile pins. The public profile lists them
// in pin order; each name is then loaded as a normal repo.
function pinnedNames(html: string): string[] {
  const block =
    /js-pinned-items-reorder-list[\s\S]*?<\/ol>/.exec(html)?.[0] ?? "";
  return [...block.matchAll(/class="repo"[^>]*>\s*([^<]+)/g)]
    .map((match) => match[1]?.trim())
    .filter((name): name is string => !!name && name !== "web-portfolio");
}

export async function getRepos(): Promise<Repo[]> {
  try {
    const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
    const headers: HeadersInit = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "web-portfolio",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    // Cached for an hour: fetching on every visit ran into GitHub's
    // rate limit and left the Work section empty.
    const profile = await fetch(`https://github.com/${USER}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; web-portfolio)" },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (!profile.ok) return [];

    const loaded = await Promise.all(
      pinnedNames(await profile.text()).map(async (name) => {
        const res = await fetch(`https://api.github.com/repos/${USER}/${name}`, {
          headers,
          next: { revalidate: 3600 },
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) return null;
        const parsed = repoSchema.safeParse(await res.json());
        if (!parsed.success || parsed.data.private) return null;
        const repo = parsed.data;
        return {
          ...repo,
          private: false as const,
          description: repo.description ?? null,
          homepage: normalizeSite(repo.homepage),
          language: repo.language ?? null,
          topics: repo.topics ?? [],
          preview: null,
        };
      }),
    );

    return Promise.all(
      loaded
        .filter((repo) => repo !== null)
        .map(async (repo) => ({
          ...repo,
          preview: repo.homepage ? await sharePreview(repo.homepage) : null,
        })),
    );
  } catch {
    return [];
  }
}
