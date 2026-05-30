import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  message: string;
};

export default function EmptyState({ icon, message }: Props) {
  return (
    <div className="text-center py-8 text-gray-400">
      <div className="mx-auto mb-2">{icon}</div>
      <p>{message}</p>
    </div>
  );
}
