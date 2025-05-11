// app/actions/getRepos.ts (or in pages/api)
export async function getRepos() {
  const res = await fetch(
    "https://api.github.com/users/alexandrearabian/repos",
  );
  const data = await res.json();
  return data;
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
