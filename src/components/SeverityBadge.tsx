type Props = {
  severity: "high" | "medium" | "low";
};

const config = {
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

export default function SeverityBadge({ severity }: Props) {
  const c = config[severity];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${c.bg} ${c.text} ${c.border}`}
    >
      {c.label}
    </span>
  );
}
