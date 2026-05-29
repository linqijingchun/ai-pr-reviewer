import { AlertCircle } from "lucide-react";

type Props = {
  message: string;
  onRetry?: () => void;
};

export default function ErrorState({ message, onRetry }: Props) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-red-700">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-sm text-red-600 underline hover:text-red-800"
          >
            重试
          </button>
        )}
      </div>
    </div>
  );
}
