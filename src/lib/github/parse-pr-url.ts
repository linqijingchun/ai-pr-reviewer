export type ParsedPrUrl = {
  owner: string;
  repo: string;
  pullNumber: number;
};

export function parsePrUrl(url: string): ParsedPrUrl {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("请输入合法的 URL");
  }

  if (parsed.hostname !== "github.com") {
    throw new Error("请输入 GitHub 链接");
  }

  const parts = parsed.pathname.split("/").filter(Boolean);
  if (parts.length < 4 || parts[2] !== "pull") {
    throw new Error(
      "请输入 GitHub Pull Request 链接，格式：https://github.com/owner/repo/pull/123"
    );
  }

  const [owner, repo, , pullNumberStr] = parts;
  const pullNumber = Number(pullNumberStr);

  if (!Number.isInteger(pullNumber) || pullNumber <= 0) {
    throw new Error("PR 编号不合法");
  }

  return { owner, repo, pullNumber };
}
