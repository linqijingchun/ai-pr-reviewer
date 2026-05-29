import { getOctokit } from "./github-client";
import type { PullRequestInfo } from "@/types/github";

export async function fetchPrDetails(
  owner: string,
  repo: string,
  pullNumber: number
): Promise<PullRequestInfo> {
  const octokit = getOctokit();

  const { data } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: pullNumber,
  });

  return {
    owner,
    repo,
    number: data.number,
    title: data.title,
    body: data.body,
    author: data.user?.login ?? "unknown",
    state: data.state,
    baseBranch: data.base.ref,
    headBranch: data.head.ref,
    additions: data.additions,
    deletions: data.deletions,
    changedFiles: data.changed_files,
    htmlUrl: data.html_url,
  };
}
