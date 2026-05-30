"use client";

import { Info, GitPullRequest } from "lucide-react";
import { usePRAnalysis } from "@/hooks/usePRAnalysis";
import PRSearchForm from "@/components/PRSearchForm";
import PrOverview from "@/components/PrOverview";
import ErrorState from "@/components/ErrorState";
import FileChangeList from "@/components/FileChangeList";
import RiskList from "@/components/RiskList";
import SummaryPanel from "@/components/SummaryPanel";
import ReviewSuggestionList from "@/components/ReviewSuggestionList";
import AnalysisProgress from "@/components/AnalysisProgress";

const PROGRESS_STEPS = [
  "获取 PR 基本信息",
  "拉取变更文件列表",
  "本地风险扫描",
  "AI 生成分析报告",
];

export default function Home() {
  const { loading, progressStep, error, result, analyze, retry } = usePRAnalysis();

  const getStepStatus = (index: number) => {
    if (progressStep === index) return "active" as const;
    if (progressStep > index) return "done" as const;
    return "pending" as const;
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* 标题区 */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            AI PR Reviewer
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            输入 GitHub PR 链接，自动生成变更总结、风险识别与 Review 建议
          </p>
        </div>

        {/* 输入区 */}
        <PRSearchForm loading={loading} onSubmit={analyze} />

        {/* 初始状态提示 */}
        {!loading && !error && !result && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 sm:p-12 text-center">
            <GitPullRequest className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm sm:text-base">
              输入 GitHub PR 链接并点击 Analyze 开始分析
            </p>
          </div>
        )}

        {/* 加载状态 */}
        {loading && (
          <AnalysisProgress
            steps={PROGRESS_STEPS.map((label, i) => ({
              label,
              status: getStepStatus(i),
            }))}
          />
        )}

        {/* 错误提示 */}
        {error && <ErrorState message={error} onRetry={retry} />}

        {/* 结果区 */}
        {!loading && !error && result && (
          <div className="space-y-6">
            <PrOverview pr={result.pr} />
            <FileChangeList files={result.files} />
            <RiskList findings={result.risks} />

            {result.summary && <SummaryPanel summary={result.summary} />}

            {result.suggestions.length > 0 && (
              <ReviewSuggestionList suggestions={result.suggestions} />
            )}

            {/* 分析限制提示 */}
            {result.meta && result.meta.limitations.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="text-sm font-medium text-blue-800">
                    分析说明
                  </span>
                </div>
                <ul className="text-sm text-blue-700 space-y-1">
                  {result.meta.limitations.map((limitation, i) => (
                    <li key={i} className="break-words">
                      • {limitation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
