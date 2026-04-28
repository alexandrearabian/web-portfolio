import React from "react";
import { getRepos } from "./actions/getRepos";

import HomePage from "./client-page";

export const dynamic = "force-dynamic";

export default async function page() {
  const repos = await getRepos();

  return <HomePage repos={repos} />;
}
