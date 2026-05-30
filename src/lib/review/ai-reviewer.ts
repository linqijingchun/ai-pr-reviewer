import { z } from "zod";
import type { PullRequestInfo } from "@/types/github";
import type { RuleFinding } from "@/types/review";
import type { ReviewContext } from "./context-builder";
import { chatCompletion } from "@/lib/model/deepseek-client";
import { buildReviewMessages } from "./prompt-builder";

const ReviewRiskSchema = z.object({
  severity: z.enum(["high", "medium", "low"]),
  confidence: z.enum(["high", "medium", "low"]),
  file: z.string(),
  title: z.string(),
  reason: z.string(),
  evidence: z.string(),
  recommendation: z.string(),
});

const ReviewSuggestionSchema = z.object({
  file: z.string(),
  title: z.string(),
  description: z.string(),
  reviewComment: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
});

const AiReviewResultSchema = z.object({
  summary: z.object({
    overview: z.string(),
    keyChanges: z.array(z.string()),
    impactAreas: z.array(z.string()),
  }),
  risks: z.array(ReviewRiskSchema),
  suggestions: z.array(ReviewSuggestionSchema),
  testSuggestions: z.array(z.string()),
});

export type AiReviewResult = z.infer<typeof AiReviewResultSchema>;

function extractJson(text: string): string {
  // 尝试直接解析
  try {
    JSON.parse(text);
    return text;
  } catch {
    // ignore
  }

  // 尝试提取 ```json ... ``` 代码块
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  // 尝试提取第一个 { ... } 块
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    return braceMatch[0];
  }

  throw new Error("无法从 AI 返回内容中提取 JSON");
}

export async function generateReview(
  pr: PullRequestInfo,
  context: ReviewContext,
  ruleFindings: RuleFinding[]
): Promise<AiReviewResult> {
  const messages = buildReviewMessages(pr, context, ruleFindings);

  const rawContent = await chatCompletion(messages, {
    temperature: 0.2,
  });

  const jsonStr = extractJson(rawContent);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error("AI 返回的 JSON 格式不合法");
  }

  const result = AiReviewResultSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      `AI 返回结构不符合预期: ${result.error.issues.map((i) => i.message).join(", ")}`
    );
  }

  return result.data;
}
