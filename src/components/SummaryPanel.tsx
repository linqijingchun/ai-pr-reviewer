import { FileText, Target, Layers } from "lucide-react";

type Props = {
  summary: {
    overview: string;
    keyChanges: string[];
    impactAreas: string[];
  };
};

export default function SummaryPanel({ summary }: Props) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">概述</span>
        </div>
        <p className="text-gray-800 text-sm leading-relaxed pl-6">
          {summary.overview}
        </p>
      </div>

      {summary.keyChanges.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              关键变更
            </span>
          </div>
          <ul className="list-disc list-inside pl-6 space-y-1">
            {summary.keyChanges.map((change, i) => (
              <li key={i} className="text-sm text-gray-800">
                {change}
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary.impactAreas.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              影响范围
            </span>
          </div>
          <div className="flex flex-wrap gap-2 pl-6">
            {summary.impactAreas.map((area, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
