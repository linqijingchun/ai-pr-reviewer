"use client";

import { useState } from "react";
import type { PullRequestFile } from "@/types/github";
import {
  FilePlus,
  FileMinus,
  FilePen,
  ChevronDown,
  ChevronRight,
  FileCode,
} from "lucide-react";

type Props = {
  files: PullRequestFile[];
};

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "added":
      return <FilePlus className="w-4 h-4 text-green-600 shrink-0" />;
    case "removed":
      return <FileMinus className="w-4 h-4 text-red-600 shrink-0" />;
    default:
      return <FilePen className="w-4 h-4 text-yellow-600 shrink-0" />;
  }
}

function FileItem({ file }: { file: PullRequestFile }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left"
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
        )}
        <StatusIcon status={file.status} />
        <span className="flex-1 text-sm font-mono text-gray-800 truncate">
          {file.filename}
        </span>
        <span className="text-xs text-gray-500 shrink-0">
          <span className="text-green-600">+{file.additions}</span>{" "}
          <span className="text-red-600">-{file.deletions}</span>
        </span>
      </button>
      {expanded && file.patch && (
        <div className="px-4 py-3 bg-gray-900 text-gray-100 text-xs font-mono overflow-x-auto">
          <pre className="whitespace-pre-wrap">{file.patch}</pre>
        </div>
      )}
      {expanded && !file.patch && (
        <div className="px-4 py-3 bg-gray-50 text-gray-500 text-sm">
          Patch unavailable (binary file or too large)
        </div>
      )}
    </div>
  );
}

export default function FileChangeList({ files }: Props) {
  if (files.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Changed Files
        </h2>
        <div className="flex flex-col items-center py-4">
          <FileCode className="w-8 h-8 text-gray-300 mb-2" />
          <p className="text-gray-500 text-sm">没有变更文件</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Changed Files ({files.length})
      </h2>
      <div className="space-y-2">
        {files.map((file) => (
          <FileItem key={file.filename} file={file} />
        ))}
      </div>
    </div>
  );
}
