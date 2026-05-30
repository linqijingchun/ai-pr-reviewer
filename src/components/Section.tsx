import type { ReactNode } from "react";

type Props = {
  title: string;
  count?: number;
  action?: ReactNode;
  children: ReactNode;
};

export default function Section({ title, count, action, children }: Props) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {action ? (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {title}
            {count !== undefined && (
              <span className="text-gray-500 font-normal ml-1">({count})</span>
            )}
          </h2>
          {action}
        </div>
      ) : (
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {title}
          {count !== undefined && (
            <span className="text-gray-500 font-normal ml-1">({count})</span>
          )}
        </h2>
      )}
      {children}
    </div>
  );
}
