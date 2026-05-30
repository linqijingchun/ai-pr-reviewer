type Props = {
  severity: "high" | "medium" | "low";
  confidence?: "high" | "medium" | "low";
};

const severityConfig = {
  high: {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-300",
    label: "HIGH",
  },
  medium: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-300",
    label: "MEDIUM",
  },
  low: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-300",
    label: "LOW",
  },
};

const confidenceConfig = {
  high: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-300",
    label: "高置信",
  },
  medium: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-300",
    label: "中置信",
  },
  low: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    border: "border-gray-300",
    label: "低置信",
  },
};

export default function SeverityBadge({ severity, confidence }: Props) {
  const s = severityConfig[severity];

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${s.bg} ${s.text} ${s.border}`}
      >
        {s.label}
      </span>
      {confidence && (
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs border ${confidenceConfig[confidence].bg} ${confidenceConfig[confidence].text} ${confidenceConfig[confidence].border}`}
        >
          {confidenceConfig[confidence].label}
        </span>
      )}
    </span>
  );
}
