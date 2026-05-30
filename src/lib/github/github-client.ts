import { Octokit } from "@octokit/rest";

let octokitInstance: Octokit | null = null;

export function getOctokit(): Octokit {
  if (!octokitInstance) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.warn(
        "GITHUB_TOKEN 未配置，将使用匿名访问（限 60 次/小时）"
      );
    }
    octokitInstance = new Octokit(
      token ? { auth: token } : undefined
    );
  }
  return octokitInstance;
}
