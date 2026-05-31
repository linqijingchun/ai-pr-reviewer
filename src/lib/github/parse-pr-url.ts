import { AppError } from "@/lib/utils/errors";

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
    throw new AppError("请输入合法的 URL", "INVALID_PR_URL");
  }

  if (parsed.hostname !== "github.com") {
    throw new AppError("请输入 GitHub 链接", "INVALID_PR_URL");
  }

  const parts = parsed.pathname.split("/").filter(Boolean);
  if (parts.length < 4 || parts[2] !== "pull") {
    throw new AppError(
      "请输入 GitHub Pull Request 链接，格式：https://github.com/owner/repo/pull/123",
      "INVALID_PR_URL"
    );
  }

  const [owner, repo, , pullNumberStr] = parts;
  const pullNumber = Number(pullNumberStr);

  if (!Number.isInteger(pullNumber) || pullNumber <= 0) {
    throw new AppError("PR 编号不合法", "INVALID_PR_URL");
  }

  return { owner, repo, pullNumber };
}
