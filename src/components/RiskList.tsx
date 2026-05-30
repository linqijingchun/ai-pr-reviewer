import type { ReviewRisk } from "@/types/review";
import SeverityBadge from "./SeverityBadge";
import { ShieldAlert } from "lucide-react";

type Props = {
  findings: ReviewRisk[];
};

export default function RiskList({ findings }: Props) {
  if (findings.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Risk Findings
        </h2>
        <p className="text-gray-500 text-sm">未发现风险</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Risk Findings ({findings.length})
      </h2>
      <div className="space-y-3">
        {findings.map((finding, index) => (
          <div
            key={`${finding.file}-${finding.title}-${index}`}
            className="border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <ShieldAlert
                className={`w-5 h-5 mt-0.5 shrink-0 ${
                  finding.severity === "high"
                    ? "text-red-500"
                    : finding.severity === "medium"
                      ? "text-orange-500"
                      : "text-blue-500"
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <SeverityBadge
                    severity={finding.severity}
                    confidence={finding.confidence}
                  />
                  <span className="font-medium text-gray-900">
                    {finding.title}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{finding.reason}</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>
                    <span className="font-medium">文件:</span> {finding.file}
                  </p>
                  <p>
                    <span className="font-medium">证据:</span>{" "}
                    {finding.evidence}
                  </p>
                  {finding.recommendation && (
                    <p>
                      <span className="font-medium">建议:</span>{" "}
                      {finding.recommendation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
