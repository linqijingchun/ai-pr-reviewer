export type PullRequestInfo = {
  owner: string;
  repo: string;
  number: number;
  title: string;
  body: string | null;
  author: string;
  state: string;
  baseBranch: string;
  headBranch: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  htmlUrl: string;
};

export type PullRequestFile = {
  filename: string;
  status: "added" | "removed" | "modified" | "renamed" | string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
};
