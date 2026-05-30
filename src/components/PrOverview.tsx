import type { PullRequestInfo } from "@/types/github";
import { GitPullRequest, User, GitBranch, FileDiff } from "lucide-react";

type Props = {
  pr: PullRequestInfo;
};

export default function PrOverview({ pr }: Props) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">PR Overview</h2>
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <GitPullRequest className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <a
              href={pr.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium break-words"
            >
              #{pr.number} {pr.title}
            </a>
            <span className="ml-2 text-sm text-gray-500">({pr.state})</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-gray-400 shrink-0" />
          <span className="text-gray-700">{pr.author}</span>
        </div>

        <div className="flex items-center gap-3">
          <GitBranch className="w-5 h-5 text-gray-400 shrink-0" />
          <span className="text-gray-700">
            {pr.headBranch} → {pr.baseBranch}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <FileDiff className="w-5 h-5 text-gray-400 shrink-0" />
          <span className="text-gray-700">
            <span className="text-green-600">+{pr.additions}</span>{" "}
            <span className="text-red-600">-{pr.deletions}</span> ·{" "}
            {pr.changedFiles} file(s) changed
          </span>
        </div>
      </div>
    </div>
  );
}
