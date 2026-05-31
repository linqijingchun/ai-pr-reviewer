import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parsePrUrl } from "@/lib/github/parse-pr-url";
import { fetchPrDetails } from "@/lib/github/fetch-pr-details";
import { fetchPrFiles } from "@/lib/github/fetch-pr-files";
import { scanAllFiles } from "@/lib/review/risk-scanner";
import { buildContext } from "@/lib/review/context-builder";
import { generateReview } from "@/lib/review/ai-reviewer";
import { buildReport } from "@/lib/review/report-builder";
import { AppError } from "@/lib/utils/errors";

const RequestSchema = z.object({
  url: z.string().url("请输入合法的 URL"),
});

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: "请求格式不合法" } },
        { status: 400 }
      );
    }

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

    const ruleFindings = scanAllFiles(files);

    // 构建上下文（按风险优先级截断，供 AI 和报告共用）
    const context = buildContext(files, ruleFindings);

    // AI 分析（失败时降级）
    let aiResult = null;
    let aiError: string | null = null;

    try {
      aiResult = await generateReview(pr, context, ruleFindings);
    } catch (err) {
      // 脱敏：不暴露内部 URL、状态码等细节
      if (err instanceof Error) {
        if (err.message.includes("API Key")) {
          aiError = "AI 服务配置错误，请联系管理员";
        } else if (err.message.includes("超时")) {
          aiError = "AI 分析超时，请稍后重试";
        } else if (err.message.includes("频率")) {
          aiError = "AI 服务繁忙，请稍后重试";
        } else {
          aiError = "AI 分析失败，已回退到规则扫描结果";
        }
      } else {
        aiError = "AI 分析失败";
      }
      console.error("AI review error:", err);
    }

    // 合并报告
    const report = buildReport(pr, files, ruleFindings, context, aiResult, aiError);

    return NextResponse.json(report);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: 400 }
      );
    }

    // GitHub API 404
    if (
      error instanceof Error &&
      "status" in error &&
      (error as { status: number }).status === 404
    ) {
      return NextResponse.json(
        {
          error: {
            code: "PR_NOT_FOUND",
            message: "PR 不存在或无权限访问",
          },
        },
        { status: 404 }
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
