import { z } from "zod";

const repoSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  html_url: z.string().url(),
  homepage: z.string().url().nullable().optional(),
  language: z.string().nullable().optional(),
  stargazers_count: z.number().optional(),
});

const reposSchema = z.array(repoSchema);

export type Repo = z.infer<typeof repoSchema> & {
  description: string | null;
  homepage?: string | null;
  language: string | null;
  stargazers_count?: number;
};

export async function getRepos(): Promise<Repo[]> {
  try {
    const res = await fetch(
      "https://api.github.com/users/alexandrearabian/starred",
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "web-portfolio",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      },
    );

    if (!res.ok) return [];

    const data: unknown = await res.json();
    const parsed = reposSchema.safeParse(data);
    if (!parsed.success) return [];

    return parsed.data.map((repo) => ({
      ...repo,
      description: repo.description ?? null,
      homepage: repo.homepage ?? null,
      language: repo.language ?? null,
    }));
  } catch {
    return [];
  }
}
