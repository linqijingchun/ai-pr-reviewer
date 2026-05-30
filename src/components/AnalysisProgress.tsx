import { Loader2, Check } from "lucide-react";
import Section from "./Section";

type Step = {
  label: string;
  status: "pending" | "active" | "done";
};

type Props = {
  steps: Step[];
};

export default function AnalysisProgress({ steps }: Props) {
  return (
    <Section title="分析进度">
      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            {step.status === "active" && (
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
            )}
            {step.status === "done" && (
              <Check className="w-4 h-4 text-green-500 shrink-0" />
            )}
            {step.status === "pending" && (
              <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
            )}
            <span
              className={`text-sm ${
                step.status === "active"
                  ? "text-blue-600 font-medium"
                  : step.status === "done"
                    ? "text-green-600"
                    : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}
