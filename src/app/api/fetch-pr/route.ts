import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parsePrUrl } from "@/lib/github/parse-pr-url";
import { fetchPrDetails } from "@/lib/github/fetch-pr-details";
import { fetchPrFiles } from "@/lib/github/fetch-pr-files";
import { scanAllFiles } from "@/lib/review/risk-scanner";
import { AppError } from "@/lib/utils/errors";

const RequestSchema = z.object({
  url: z.string().url("请输入合法的 URL"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_INPUT",
            message: parsed.error.issues[0].message,
          },
        },
        { status: 400 }
      );
    }

    const prUrl = parsePrUrl(parsed.data.url);
    const [pr, files] = await Promise.all([
      fetchPrDetails(prUrl.owner, prUrl.repo, prUrl.pullNumber),
      fetchPrFiles(prUrl.owner, prUrl.repo, prUrl.pullNumber),
    ]);

    const risks = scanAllFiles(files);

    return NextResponse.json({ pr, files, risks });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: 400 }
      );
    }

    console.error("fetch-pr error:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "获取 PR 信息失败，请稍后重试",
        },
      },
      { status: 500 }
    );
  }
}
