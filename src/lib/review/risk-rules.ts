import type { SeverityLevel } from "@/types/review";

export type RuleDefinition = {
  ruleId: string;
  severity: SeverityLevel;
  title: string;
  reason: string;
  matchType: "filename" | "content" | "meta";
  patterns: string[];
};

export const riskRules: RuleDefinition[] = [
  {
    ruleId: "sensitive-info",
    severity: "high",
    title: "敏感信息变更",
    reason: "可能泄露密钥、token 或凭据信息",
    matchType: "content",
    patterns: [
      "secret",
      "token",
      "password",
      "apiKey",
      "api_key",
      "privateKey",
      "private_key",
      "credential",
      ".env",
      "AUTH_",
    ],
  },
  {
    ruleId: "auth-permission",
    severity: "high",
    title: "鉴权权限变更",
    reason: "可能影响登录、权限控制或访问边界",
    matchType: "content",
    patterns: [
      "auth",
      "permission",
      "role",
      "jwt",
      "session",
      "cookie",
      "login",
      "logout",
      "middleware",
    ],
  },
  {
    ruleId: "database",
    severity: "high",
    title: "数据库操作变更",
    reason: "可能引入 SQL 注入、误删数据或事务问题",
    matchType: "content",
    patterns: [
      "SELECT ",
      "INSERT ",
      "UPDATE ",
      "DELETE ",
      "DROP ",
      "WHERE ",
      "query",
      "sql",
      "migration",
      "schema",
    ],
  },
  {
    ruleId: "dynamic-exec",
    severity: "high",
    title: "动态执行变更",
    reason: "可能引入命令执行或代码注入风险",
    matchType: "content",
    patterns: [
      "eval(",
      "Function(",
      "exec(",
      "spawn(",
      "child_process",
      "execSync",
      "execFile",
      "dangerouslySetInnerHTML",
    ],
  },
  {
    ruleId: "error-handling",
    severity: "medium",
    title: "错误处理变更",
    reason: "可能导致异常被吞掉或错误不可观测",
    matchType: "content",
    patterns: [
      "-  try",
      "-  catch",
      "-  throw",
      "-  Error",
      "-  console.error",
      "-  finally",
    ],
  },
  {
    ruleId: "test-change",
    severity: "medium",
    title: "测试文件变更",
    reason: "测试被删除或修改，可能影响回归验证",
    matchType: "filename",
    patterns: [
      ".test.",
      ".spec.",
      "__tests__",
      "/tests/",
      "/test/",
    ],
  },
  {
    ruleId: "config-dependency",
    severity: "medium",
    title: "配置与依赖变更",
    reason: "可能影响构建、部署或供应链安全",
    matchType: "filename",
    patterns: [
      "package.json",
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      "Dockerfile",
      "docker-compose",
      ".github/workflows",
      ".gitlab-ci",
      "tsconfig.json",
      "next.config",
      "webpack.config",
      "vite.config",
      ".eslintrc",
      ".prettierrc",
      "Makefile",
    ],
  },
  {
    ruleId: "large-diff",
    severity: "low",
    title: "大文件变更",
    reason: "Review 成本高，容易漏看问题",
    matchType: "meta",
    patterns: [],
  },
];

export const LARGE_DIFF_THRESHOLD = 100;
