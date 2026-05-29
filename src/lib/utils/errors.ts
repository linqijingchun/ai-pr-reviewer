export class AppError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = "AppError";
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return error.message;
  return "未知错误";
}

export function getErrorCode(error: unknown): string {
  if (error instanceof AppError) return error.code;
  return "UNKNOWN_ERROR";
}
