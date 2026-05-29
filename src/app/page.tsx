"use client";

import { useState } from "react";
import { Search, Loader2, AlertCircle } from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setError("功能尚未接入，敬请期待");
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* 标题区 */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI PR Reviewer
          </h1>
          <p className="text-gray-600">
            输入 GitHub PR 链接，自动生成变更总结、风险识别与 Review 建议
          </p>
        </div>

        {/* 输入区 */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/owner/repo/pull/123"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* 占位结果区 */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              PR Overview
            </h2>
            <p className="text-gray-500 text-sm">
              分析后将在此展示 PR 基本信息
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Summary
            </h2>
            <p className="text-gray-500 text-sm">
              分析后将在此展示变更总结
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Risk Findings
            </h2>
            <p className="text-gray-500 text-sm">
              分析后将在此展示风险发现
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Review Suggestions
            </h2>
            <p className="text-gray-500 text-sm">
              分析后将在此展示 Review 建议
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
