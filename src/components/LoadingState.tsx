import { Loader2 } from "lucide-react";

type Props = {
  message?: string;
};

export default function LoadingState({ message = "分析中..." }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
      <p className="text-gray-600">{message}</p>
    </div>
  );
}
