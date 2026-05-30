"use client";

import { useState, useRef } from "react";
import { Search, Loader2, Info, GitPullRequest } from "lucide-react";
import type { PullRequestInfo, PullRequestFile } from "@/types/github";
import type { ReviewRisk, ReviewSuggestion } from "@/types/review";
import PrOverview from "@/components/PrOverview";
import ErrorState from "@/components/ErrorState";
import FileChangeList from "@/components/FileChangeList";
import RiskList from "@/components/RiskList";
import SummaryPanel from "@/components/SummaryPanel";
import ReviewSuggestionList from "@/components/ReviewSuggestionList";
import AnalysisProgress from "@/components/AnalysisProgress";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const progressTimer = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pr, setPr] = useState<PullRequestInfo | null>(null);
  const [files, setFiles] = useState<PullRequestFile[]>([]);
  const [risks, setRisks] = useState<ReviewRisk[]>([]);
  const [summary, setSummary] = useState<{
    overview: string;
    keyChanges: string[];
    impactAreas: string[];
  } | null>(null);
  const [suggestions, setSuggestions] = useState<ReviewSuggestion[]>([]);
  const [meta, setMeta] = useState<{
    analyzedAt: string;
    model: string;
    truncated: boolean;
    limitations: string[];
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setError(null);
    setPr(null);
    setFiles([]);
    setRisks([]);
    setSummary(null);
    setSuggestions([]);
    setMeta(null);
    setLoading(true);
    setProgressStep(0);

    // 模拟进度步骤
    progressTimer.current.forEach(clearTimeout);
    progressTimer.current = [];
    progressTimer.current.push(
      setTimeout(() => setProgressStep(1), 800),
      setTimeout(() => setProgressStep(2), 2000),
      setTimeout(() => setProgressStep(3), 4000)
    );

    try {
      const res = await fetch("/api/fetch-pr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message ?? "请求失败");
        return;
      }

      setPr(data.pr);
      setFiles(data.files ?? []);
      setRisks(data.risks ?? []);
      setSummary(data.summary ?? null);
      setSuggestions(data.suggestions ?? []);
      setMeta(data.meta ?? null);
    } catch {
      setError("网络请求失败，请检查网络连接");
    } finally {
      progressTimer.current.forEach(clearTimeout);
      setLoading(false);
    }
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
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/owner/repo/pull/123"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm sm:text-base"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Analyze
            </button>
          </div>
        </form>

        {/* 初始状态提示 */}
        {!loading && !error && !pr && (
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
            steps={[
              {
                label: "获取 PR 基本信息",
                status:
                  progressStep === 0
                    ? "active"
                    : progressStep > 0
                      ? "done"
                      : "pending",
              },
              {
                label: "拉取变更文件列表",
                status:
                  progressStep === 1
                    ? "active"
                    : progressStep > 1
                      ? "done"
                      : "pending",
              },
              {
                label: "本地风险扫描",
                status:
                  progressStep === 2
                    ? "active"
                    : progressStep > 2
                      ? "done"
                      : "pending",
              },
              {
                label: "AI 生成分析报告",
                status: progressStep === 3 ? "active" : "pending",
              },
            ]}
          />
        )}

        {/* 错误提示 */}
        {error && (
          <ErrorState
            message={error}
            onRetry={() =>
              handleSubmit(new Event("submit") as React.FormEvent)
            }
          />
        )}

        {/* 结果区 */}
        {!loading && !error && pr && (
          <div className="space-y-6">
            <PrOverview pr={pr} />
            <FileChangeList files={files} />
            <RiskList findings={risks} />

            {summary && <SummaryPanel summary={summary} />}

            {suggestions.length > 0 && (
              <ReviewSuggestionList suggestions={suggestions} />
            )}

            {/* 分析限制提示 */}
            {meta && meta.limitations.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="text-sm font-medium text-blue-800">
                    分析说明
                  </span>
                </div>
                <ul className="text-sm text-blue-700 space-y-1">
                  {meta.limitations.map((limitation, i) => (
                    <li key={i} className="break-words">• {limitation}</li>
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
