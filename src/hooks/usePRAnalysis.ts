"use client";

import { useState, useRef, useCallback } from "react";
import type { PullRequestInfo, PullRequestFile } from "@/types/github";
import type {
  ReviewRisk,
  ReviewSuggestion,
  ReviewSummary,
  ReviewMeta,
} from "@/types/review";

type AnalysisResult = {
  pr: PullRequestInfo;
  files: PullRequestFile[];
  risks: ReviewRisk[];
  summary: ReviewSummary | null;
  suggestions: ReviewSuggestion[];
  meta: ReviewMeta | null;
};

type AnalysisState = {
  loading: boolean;
  progressStep: number;
  error: string | null;
  result: AnalysisResult | null;
};

const PROGRESS_TIMING = [800, 2000, 4000];

export function usePRAnalysis() {
  const [state, setState] = useState<AnalysisState>({
    loading: false,
    progressStep: 0,
    error: null,
    result: null,
  });

  const progressTimer = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastUrl = useRef<string>("");

  const analyze = useCallback(async (url: string) => {
    lastUrl.current = url;
    if (!url.trim()) return;

    setState({
      loading: true,
      progressStep: 0,
      error: null,
      result: null,
    });

    // 模拟进度步骤
    progressTimer.current.forEach(clearTimeout);
    progressTimer.current = [];
    PROGRESS_TIMING.forEach((delay, step) => {
      progressTimer.current.push(
        setTimeout(() => {
          setState((prev) => ({ ...prev, progressStep: step + 1 }));
        }, delay)
      );
    });

    try {
      const res = await fetch("/api/fetch-pr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: data.error?.message ?? "请求失败",
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        result: {
          pr: data.pr,
          files: data.files ?? [],
          risks: data.risks ?? [],
          summary: data.summary ?? null,
          suggestions: data.suggestions ?? [],
          meta: data.meta ?? null,
        },
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "网络请求失败，请检查网络连接",
      }));
    } finally {
      progressTimer.current.forEach(clearTimeout);
    }
  }, []);

  const retry = useCallback(() => {
    if (lastUrl.current) {
      analyze(lastUrl.current);
    }
  }, [analyze]);

  return {
    loading: state.loading,
    progressStep: state.progressStep,
    error: state.error,
    result: state.result,
    analyze,
    retry,
  };
}
