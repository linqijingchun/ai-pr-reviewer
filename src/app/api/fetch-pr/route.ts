import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parsePrUrl } from "@/lib/github/parse-pr-url";
import { fetchPrDetails } from "@/lib/github/fetch-pr-details";
import { fetchPrFiles } from "@/lib/github/fetch-pr-files";
import { scanAllFiles } from "@/lib/review/risk-scanner";
import { generateReview } from "@/lib/review/ai-reviewer";
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

    // AI 分析（失败时降级，仍返回 PR 数据和规则结果）
    let summary = null;
    let suggestions: unknown[] = [];
    let testSuggestions: string[] = [];
    let aiError: string | null = null;

    try {
      const aiResult = await generateReview(pr, files, risks);
      summary = aiResult.summary;
      suggestions = aiResult.suggestions;
      testSuggestions = aiResult.testSuggestions;
    } catch (err) {
      aiError =
        err instanceof Error ? err.message : "AI 分析失败";
      console.error("AI review error:", aiError);
    }

    return NextResponse.json({
      pr,
      files,
      risks,
      summary,
      suggestions,
      testSuggestions,
      aiError,
    });
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
