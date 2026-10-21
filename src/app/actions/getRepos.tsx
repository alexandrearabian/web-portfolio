import { z } from "zod";

const USER = "alexandrearabian";

// The profile's pinned repos, in pin order. Pins are only in GitHub's
// GraphQL API, which needs a token (any token that can read public repos).
const QUERY = `query($login: String!) {
  user(login: $login) {
    pinnedItems(first: 6, types: REPOSITORY) {
      nodes {
        ... on Repository {
          databaseId
          name
          url
          homepageUrl
          isPrivate
          primaryLanguage { name }
          openGraphImageUrl
          repositoryTopics(first: 4) { nodes { topic { name } } }
        }
      }
    }
  }
}`;

const responseSchema = z.object({
  data: z.object({
    user: z.object({
      pinnedItems: z.object({
        nodes: z.array(
          z.object({
            databaseId: z.number(),
            name: z.string(),
            url: z.string().url(),
            homepageUrl: z.string().nullable(),
            isPrivate: z.boolean(),
            primaryLanguage: z.object({ name: z.string() }).nullable(),
            // The repo's social preview: an uploaded image, or GitHub's
            // generated card.
            openGraphImageUrl: z.string().url(),
            repositoryTopics: z.object({
              nodes: z.array(z.object({ topic: z.object({ name: z.string() }) })),
            }),
          }),
        ),
      }),
    }),
  }),
});

export type Repo = {
  id: number;
  name: string;
  url: string;
  // The repo's website as a full URL, or null.
  homepage: string | null;
  language: string | null;
  topics: string[];
  image: string;
};

// GitHub stores the website as typed: "" when unset, sometimes without a
// protocol ("example.com"), which would be a relative link on the page and
// break `new URL()` in the Work section.
function normalizeSite(homepage: string | null): string | null {
  const site = homepage?.trim();
  if (!site) return null;
  const url = /^https?:\/\//i.test(site) ? site : `https://${site}`;
  try {
    return new URL(url).href;
  } catch {
    return null;
  }
}

export async function getRepos(): Promise<Repo[]> {
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  if (!token) {
    console.error("getRepos: GITHUB_TOKEN is not set, Work will be empty");
    return [];
  }
  try {
    // Cached for an hour: fetching on every visit ran into GitHub's
    // rate limit and left the Work section empty.
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "web-portfolio",
      },
      body: JSON.stringify({ query: QUERY, variables: { login: USER } }),
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`GitHub responded ${res.status}`);
    const parsed = responseSchema.parse(await res.json());

    return parsed.data.user.pinnedItems.nodes
      .filter((repo) => !repo.isPrivate && repo.name !== "web-portfolio")
      .map((repo) => ({
        id: repo.databaseId,
        name: repo.name,
        url: repo.url,
        homepage: normalizeSite(repo.homepageUrl),
        language: repo.primaryLanguage?.name ?? null,
        topics: repo.repositoryTopics.nodes.map((node) => node.topic.name),
        image: repo.openGraphImageUrl,
      }));
  } catch (error) {
    console.error("getRepos:", error);
    return [];
  }
}
