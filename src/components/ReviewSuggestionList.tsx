import type { ReviewSuggestion } from "@/types/review";
import { MessageSquareText, MessageSquareOff } from "lucide-react";
import SeverityBadge from "./SeverityBadge";
import CopyButton from "./CopyButton";

type Props = {
  suggestions: ReviewSuggestion[];
};

function buildAllCommentsText(suggestions: ReviewSuggestion[]): string {
  return suggestions
    .map(
      (s, i) =>
        `### ${i + 1}. ${s.title} (${s.file})\n\n${s.description}\n\n\`\`\`\n${s.reviewComment}\n\`\`\``
    )
    .join("\n\n---\n\n");
}

export default function ReviewSuggestionList({ suggestions }: Props) {
  if (suggestions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Review Suggestions
        </h2>
        <div className="flex flex-col items-center py-4">
          <MessageSquareOff className="w-8 h-8 text-gray-300 mb-2" />
          <p className="text-gray-500 text-sm">暂无 Review 建议</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Review Suggestions ({suggestions.length})
        </h2>
        <CopyButton
          text={buildAllCommentsText(suggestions)}
          label="复制全部"
        />
      </div>
      <div className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <MessageSquareText className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <SeverityBadge
                    severity={
                      suggestion.confidence === "high"
                        ? "medium"
                        : suggestion.confidence === "medium"
                          ? "low"
                          : "low"
                    }
                    confidence={suggestion.confidence}
                  />
                  <span className="font-medium text-gray-900">
                    {suggestion.title}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    {suggestion.file}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {suggestion.description}
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-3">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                    {suggestion.reviewComment}
                  </pre>
                </div>
                <CopyButton
                  text={suggestion.reviewComment}
                  label="复制 Review 评论"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
