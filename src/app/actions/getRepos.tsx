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
});

const reposSchema = z.array(repoSchema);

export type Repo = z.infer<typeof repoSchema> & {
  description: string | null;
  homepage?: string | null;
  language: string | null;
  stargazers_count?: number;
  private: boolean;
};

export async function getRepos(): Promise<Repo[]> {
  try {
    const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
    const baseHeaders: HeadersInit = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "web-portfolio",
    };

    const all: Repo[] = [];
    const perPage = 100;
    const maxPages = 10; // safety cap (up to 1000 starred repos)

    for (let page = 1; page <= maxPages; page++) {
      const url = `https://api.github.com/users/alexandrearabian/starred?per_page=${perPage}&page=${page}`;
      const attempt = async (withAuth: boolean) => {
        const headers: HeadersInit = withAuth && token
          ? { ...baseHeaders, Authorization: `token ${token}` }
          : baseHeaders;
        return await fetch(url, {
          headers,
          cache: "no-store",
          signal: AbortSignal.timeout(8000),
        });
      };

      let res = await attempt(true);
      // If token is invalid/mis-scoped or triggers restrictions, fall back to unauthenticated.
      if ((res.status === 401 || res.status === 403) && token) {
        res = await attempt(false);
      }

      if (!res.ok) break;

      const data: unknown = await res.json();
      const parsed = reposSchema.safeParse(data);
      if (!parsed.success) break;

      if (parsed.data.length === 0) break;

      for (const repo of parsed.data) {
        all.push({
          ...repo,
          private: repo.private ?? false,
          description: repo.description ?? null,
          homepage: repo.homepage ?? null,
          language: repo.language ?? null,
        });
      }
    }

    // Ensure we only return public repos.
    return all.filter((r) => !r.private);
  } catch {
    return [];
  }
}
