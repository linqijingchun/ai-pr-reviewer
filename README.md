# AI PR Reviewer

AI PR Review 助手：输入 GitHub PR 链接，自动生成变更总结、风险识别与 Review 建议。

## Demo

> 本地运行后访问 http://localhost:3000

**使用示例：**

1. 输入一个 GitHub PR 链接，例如：
   ```
   https://github.com/facebook/react/pull/28700
   ```
2. 点击 **Analyze** 按钮
3. 等待分析完成，查看结果：
   - PR 概览（标题、作者、分支、变更统计）
   - 变更文件列表（可展开查看 diff）
   - 风险发现（按严重程度排序，含置信度标签）
   - AI 摘要（概述、关键变更、影响范围）
   - Review 建议（可一键复制评论到 GitHub）

**测试用 PR 推荐：**

| 场景 | PR 链接 |
|------|---------|
| 包含敏感信息 | 搜索包含 `password`、`api_key` 等关键词的 PR |
| 修改认证逻辑 | 搜索修改 `auth`、`login`、`session` 相关文件的 PR |
| 数据库变更 | 搜索包含 `.sql`、`migration` 文件的 PR |
| 大规模重构 | 搜索变更文件数 > 20 的 PR |

## 功能特性

- 输入 GitHub Pull Request URL，自动分析 PR 变更
- 基于 8 条本地规则扫描识别高风险代码模式（敏感信息泄露、认证逻辑、数据库操作、动态执行等）
- 接入 DeepSeek AI 模型生成结构化 Review 报告
- 风险优先级排序：高风险文件优先获得更多上下文
- AI 降级策略：AI 不可用时自动回退到规则扫描结果
- 一键复制 Review 评论到 GitHub

## 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────────┐  │
│  │ URL 输入  │→│ 进度展示   │→│ 结果展示面板          │  │
│  └──────────┘  └───────────┘  │ PR概览│文件│风险│建议 │  │
│                               └──────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │ POST /api/fetch-pr
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   API Route Handler                      │
│                                                         │
│  ① parsePrUrl()        解析 PR URL                      │
│  ② fetchPrDetails()    获取 PR 元数据  ──┐ 并行          │
│     fetchPrFiles()     获取变更文件列表 ──┘               │
│  ③ scanAllFiles()      本地规则风险扫描                   │
│  ④ generateReview()    DeepSeek AI 分析（可降级）         │
│  ⑤ buildReport()       合并报告 + 去重                   │
└─────────────────────────────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
   ┌────────────┐ ┌────────────┐ ┌────────────┐
   │ GitHub API │ │ Rule Scanner│ │ DeepSeek   │
   │ (Octokit)  │ │ (8 rules)  │ │ Chat API   │
   └────────────┘ └────────────┘ └────────────┘
```

### 目录结构

```
src/
├── app/
│   ├── api/fetch-pr/route.ts    # 核心 API 路由
│   ├── page.tsx                 # 主页面
│   └── layout.tsx               # 根布局
├── components/
│   ├── PrOverview.tsx           # PR 基本信息展示
│   ├── FileChangeList.tsx       # 变更文件列表（可展开 diff）
│   ├── RiskList.tsx             # 风险发现列表
│   ├── SummaryPanel.tsx         # AI 摘要面板
│   ├── ReviewSuggestionList.tsx # Review 建议列表
│   ├── SeverityBadge.tsx        # 严重程度 + 置信度标签
│   ├── CopyButton.tsx           # 复制按钮组件
│   ├── AnalysisProgress.tsx     # 分析进度指示器
│   ├── ErrorState.tsx           # 错误状态展示
│   ├── PRSearchForm.tsx         # PR URL 输入表单
│   ├── Section.tsx              # 通用卡片区块容器
│   └── EmptyState.tsx           # 空状态占位组件
├── hooks/
│   └── usePRAnalysis.ts         # PR 分析状态管理 hook
├── lib/
│   ├── github/
│   │   ├── parse-pr-url.ts      # PR URL 解析
│   │   ├── github-client.ts     # Octokit 单例
│   │   ├── fetch-pr-details.ts  # 获取 PR 详情
│   │   └── fetch-pr-files.ts    # 获取变更文件（含分页）
│   ├── review/
│   │   ├── risk-rules.ts        # 8 条风险规则定义
│   │   ├── risk-scanner.ts      # 规则扫描引擎
│   │   ├── context-builder.ts   # AI 上下文构建（风险优先排序）
│   │   ├── prompt-builder.ts    # Prompt 模板构建
│   │   ├── ai-reviewer.ts       # DeepSeek API 调用 + JSON 提取
│   │   └── report-builder.ts    # 报告合并 + 去重
│   ├── model/
│   │   └── deepseek-client.ts   # DeepSeek API 客户端
│   └── utils/
│       ├── errors.ts            # 错误类型定义
│       └── truncate.ts          # Diff 截断工具
└── types/
    ├── github.ts                # GitHub 相关类型
    └── review.ts                # Review 相关类型
```

## 模型选择与上下文策略

### 为什么选择 DeepSeek

| 对比维度 | DeepSeek | GPT-4 | Claude |
|---------|----------|-------|--------|
| 中文理解 | 优秀 | 良好 | 良好 |
| JSON 输出稳定性 | 高 | 高 | 高 |
| 价格 | 极低 | 高 | 中 |
| 响应速度 | 快 | 中 | 中 |
| 兼容格式 | OpenAI | OpenAI | 自有 |

DeepSeek 提供 OpenAI 兼容的 API 格式，迁移成本低，且在中文代码审查场景下表现优异。

### 上下文构建策略

AI 模型的上下文窗口有限，因此采用**风险优先级排序 + 分级截断**策略：

1. **风险评分**：根据规则扫描结果为每个文件计算风险分数（high +3, medium +2, low +1）
2. **优先级排序**：高风险文件排在前面，优先获得上下文配额
3. **分级截断**：
   - 高风险文件：最多 200 行 patch
   - 低风险文件：最多 30 行 patch
   - 总量限制：800 行 patch
4. **降级处理**：超出限制的文件标记为"已达到上下文长度限制"

```
上下文分配示意：
┌─────────────────────────────────────────────┐
│              总上下文预算: 800 行              │
├─────────────────────────────────────────────┤
│ ██████████████ 高风险文件 1 (200行)           │
│ ██████████████ 高风险文件 2 (200行)           │
│ ████████ 中风险文件 (200行上限)               │
│ ███ 低风险文件 1 (30行)                      │
│ ███ 低风险文件 2 (30行)                      │
│ ███ 低风险文件 3 (30行)                      │
│ ... 剩余文件跳过或极简截断                    │
└─────────────────────────────────────────────┘
```

### 风险规则体系

| 规则 ID | 严重程度 | 检测内容 |
|---------|---------|---------|
| sensitive-info | high | 密码、API Key、Token 等敏感信息硬编码 |
| auth | high | 认证/授权逻辑修改 |
| database | medium | 数据库 schema 变更、迁移文件 |
| dynamic-exec | high | eval()、new Function() 等动态执行 |
| error-handling | medium | try/catch 删除、错误处理减弱 |
| test-change | medium | 测试文件删除、测试覆盖率下降 |
| config-dependency | low | 配置文件、依赖变更 |
| large-diff | low | 单文件变更超过 100 行 |

## 环境要求

- Windows 10/11（也支持 macOS / Linux）
- Node.js LTS（推荐 v20+）
- npm

## 快速开始

```powershell
# 克隆仓库
git clone https://github.com/linqijingchun/ai-pr-reviewer.git
cd ai-pr-reviewer

# 安装依赖
npm install

# 配置环境变量
Copy-Item .env.example .env.local
# 编辑 .env.local，填入你的 API Key

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000 即可使用。

## 环境变量

| 变量名 | 说明 | 是否必须 |
|--------|------|----------|
| GITHUB_TOKEN | GitHub Personal Access Token，提高 API 请求频率限制（未认证限 60 次/小时） | 可选 |
| DEEPSEEK_API_KEY | DeepSeek API 密钥 | 是 |
| DEEPSEEK_BASE_URL | DeepSeek API 地址，默认 `https://api.deepseek.com` | 是 |
| DEEPSEEK_MODEL | 使用的模型名称，默认 `deepseek-v4-flash` | 是 |

> **安全提示**：`.env.local` 已被 `.gitignore` 忽略，不会被提交到仓库。其他开发者需要自行创建此文件。

## 技术栈

| 类别 | 技术 | 用途 |
|------|------|------|
| 框架 | Next.js 15 (App Router) | 全栈 Web 框架，API Routes + SSR |
| 语言 | TypeScript | 类型安全 |
| 样式 | Tailwind CSS | 原子化 CSS 框架 |
| 图标 | lucide-react | 轻量图标组件 |
| GitHub | @octokit/rest | GitHub REST API 客户端 |
| AI | DeepSeek Chat API | OpenAI 兼容格式的 LLM |
| 校验 | zod | API 输入校验 + AI 输出 schema 校验 |

## 降级策略

系统采用多层降级策略确保可用性：

```
AI 分析成功 → 完整报告（规则 + AI 建议）
     │
     ▼ AI 失败
规则扫描结果 → 基础报告（仅规则发现，标注 AI 不可用）
     │
     ▼ GitHub API 失败
错误提示 → 引导用户检查 URL 或网络
```

- AI 分析失败不阻断整体流程，自动回退到规则扫描结果
- GitHub Token 可选，未配置时使用匿名访问（有频率限制）
- JSON 提取支持多种 AI 响应格式（纯 JSON、代码块、混合文本）

## 开发过程与 PR 记录

| PR | 分支 | 标题 | 状态 |
|----|------|------|------|
| PR 1 | feat/initial-scaffold | 项目初始化脚手架 | 已合并 |
| PR 2 | feat/parse-pr-url | PR URL 解析工具函数 | 已合并 |
| PR 3 | feat/github-client | Octokit 客户端封装 | 已合并 |
| PR 4 | feat/fetch-pr-details | 获取 PR 详情 | 已合并 |
| PR 5 | feat/fetch-pr-files | 获取变更文件列表（含分页） | 已合并 |
| PR 6 | feat/error-utils | 错误处理工具类 | 已合并 |
| PR 7 | feat/truncate-utils | Diff 截断工具函数 | 已合并 |
| PR 8 | feat/risk-rules | 风险规则定义（8 条规则） | 已合并 |
| PR 9 | feat/risk-scanner | 规则扫描引擎 | 已合并 |
| PR 10 | feat/context-builder | AI 上下文构建（风险优先排序） | 已合并 |
| PR 11 | feat/deepseek-client | DeepSeek API 客户端 | 已合并 |
| PR 12 | feat/prompt-builder | Prompt 模板构建 | 已合并 |
| PR 13 | feat/ai-reviewer | AI 分析 + JSON 提取 + Zod 校验 | 已合并 |
| PR 14 | feat/report-builder | 报告合并 + 去重 + 降级 | 已合并 |
| PR 15 | feat/api-route | 核心 API 路由 | 已合并 |
| PR 16 | feat/pr-overview | PR 概览组件 | 已合并 |
| PR 17 | feat/file-change-list | 变更文件列表组件 | 已合并 |
| PR 18 | feat/risk-list | 风险列表组件 | 已合并 |
| PR 19 | feat/summary-panel | AI 摘要面板组件 | 已合并 |
| PR 20 | feat/review-suggestions | Review 建议列表组件 | 已合并 |
| PR 21 | feat/copy-button | 复制按钮组件 | 已合并 |
| PR 22 | feat/analysis-progress | 分析进度指示器 | 已合并 |
| PR 23 | feat/error-state | 错误状态组件 | 已合并 |
| PR 24 | feat/progress-animation | 进度步骤动画 | 已合并 |
| PR 25 | feat/severity-confidence | 风险等级颜色和置信度标签 | 已合并 |
| PR 26 | feat/copy-improve | 复制功能改进（复制全部） | 已合并 |
| PR 27 | feat/responsive-empty | 响应式布局和空状态优化 | 已合并 |
| PR 28 | feat/readme-docs | 完善 README 文档 | 已合并 |
| PR 29 | feat/demo-log | 添加 Demo 链接和 PR 开发日志 | 已合并 |
| PR 30 | refactor/type-consistency | 类型统一与去冗余 | 已合并 |
| PR 31 | refactor/context-architecture | 上下文架构修正（消除重复 buildContext） | 已合并 |
| PR 32 | refactor/page-decomposition | 页面逻辑拆分（hook + 组件） | 已合并 |
| PR 33 | fix/defensive-coding | 防御性编程补全 | 已合并 |
| PR 34 | refactor/ui-consistency | 组件抽象 + 样式统一 + 文档同步 | 当前 |

## License

MIT
