import { getOctokit } from "./github-client";
import type { PullRequestFile } from "@/types/github";

export async function fetchPrFiles(
  owner: string,
  repo: string,
  pullNumber: number
): Promise<PullRequestFile[]> {
  const octokit = getOctokit();

  const files: PullRequestFile[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const { data } = await octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: pullNumber,
      per_page: perPage,
      page,
    });

    for (const file of data) {
      files.push({
        filename: file.filename,
        status: file.status as PullRequestFile["status"],
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes,
        patch: file.patch,
      });
    }

    if (data.length < perPage) break;
    page++;
  }

  return files;
}
