// app/actions/getRepos.ts (or in pages/api)
export async function getRepos(): Promise<Repo[]> {
  const res = await fetch(
    "https://api.github.com/users/alexandrearabian/repos",
  );
  if (!res.ok) return [];

  const data: unknown = await res.json();

  if (!Array.isArray(data)) return [];

  return data as Repo[];
}

// types/repo.ts
export type Repo = {
  id: number;
  name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
};
