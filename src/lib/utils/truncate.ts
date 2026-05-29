export function truncatePatch(patch: string, maxLines: number = 100): string {
  const lines = patch.split("\n");
  if (lines.length <= maxLines) return patch;
  return lines.slice(0, maxLines).join("\n") + "\n\n... (truncated)";
}
