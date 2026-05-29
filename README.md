# AI PR Reviewer

AI PR Review 助手：输入 GitHub PR 链接，自动生成变更总结、风险识别与 Review 建议。

## 功能特性

- 输入 GitHub Pull Request URL，自动分析 PR 变更
- 基于本地规则扫描识别高风险代码模式
- 接入 AI 模型生成结构化 Review 报告
- 一键复制 Review 评论到 GitHub

## 环境要求

- Windows 10/11
- Node.js LTS (推荐 v20+)
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
| GITHUB_TOKEN | GitHub Personal Access Token，提高 API 请求频率限制 | 可选 |
| DEEPSEEK_API_KEY | DeepSeek API 密钥 | 是 |
| DEEPSEEK_BASE_URL | DeepSeek API 地址 | 是 |
| DEEPSEEK_MODEL | 使用的模型名称 | 是 |

## 技术栈

- **框架**: Next.js + TypeScript
- **样式**: Tailwind CSS
- **图标**: lucide-react
- **GitHub API**: @octokit/rest
- **AI**: DeepSeek Chat Completions API

## 第三方依赖说明

| 依赖 | 用途 |
|------|------|
| next | 全栈 Web 框架 |
| react / react-dom | 前端视图框架 |
| @octokit/rest | 调用 GitHub REST API |
| lucide-react | 前端图标组件 |
| zod | 校验 API 输入和 AI JSON 输出 |
| tailwindcss | 样式框架 |
| typescript | 类型系统 |
| eslint | 代码检查 |

## 开发过程与 PR 记录

（后续补充）

## License

MIT
