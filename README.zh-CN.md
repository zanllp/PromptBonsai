# PromptBonsai

一款基于无限画布的 AI 提示词本地管理桌面应用。如同盆景——每条提示词都可以分叉出精炼的变体，一览无余。

![Electron](https://img.shields.io/badge/Electron-28-blue)
![Vue 3](https://img.shields.io/badge/Vue-3.5-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

**[English](README.md)**

---

## 为什么做 PromptBonsai？

用 AI 工作时，通常会写几十条提示词变体——调措辞、换风格、改参数、迭代优化……然后就不记得哪条效果好了。PromptBonsai 用**无限画布上的树状结构**来管理所有提示词变体，一目了然。

![画布总览](imgs/canvas-overview.png)

## 核心功能

### 智能挂载 ⭐

> 这可能是 PromptBonsai 最实用的功能——粘贴一条提示词，AI 自动帮你找到最合适的父节点，不用再纠结"这条该挂到哪里"。

粘贴任意提示词文本，Smart Mount 自动分析内容并计算与所有已有节点的相似度，推荐最匹配的节点作为父节点。它会展示相似度排名和具体对比，你只需一键确认——**再也没有手动翻找的痛苦**。

![智能挂载](imgs/smart-mount.png)

### 无限画布

整个提示词库存在于一个无边界的工作区中。缩小查看全局，放大聚焦单个分支。节点可以自由拖拽——画布没有边界。

### 树状变体管理

每条提示词都可以分叉出子变体。比如一条基础人像提示词，可以分叉出*伦勃朗布光*、*电影胶片感*、*水彩插画*、*动画 KV*——每个变体都是对原版的一次精准偏离。树状结构让同级对比变得非常直观。

### AI 驱动的 Diff 与智能检测

- **字符级内联 Diff** — 当子节点与父节点有差异时，PromptBonsai 会高亮显示具体哪些字符被添加（绿色）或删除（红色），一眼看清改了什么。
- **相似度警告** — 粘贴一条与已有同级节点过于相似的提示词？保存前会弹出对比弹窗，避免重复。
- **AI 自动生成** — 一键让 AI 根据提示词内容自动生成标题、描述和标签。创建子变体时，AI 会生成感知差异的标题（如"变体3：青橙色调 + 城市光斑散景"）。

### 节点详情侧边栏

选中任意节点即可打开侧边面板，查看和编辑提示词内容、标题、描述、标签、评分等。所有信息一目了然，支持实时编辑。

![侧边面板](imgs/side-panel.png)

### 根节点快速索引

同时管理多棵独立的提示词树？右上角的折叠式索引面板列出所有根节点，点击任意条目即可**飞行动画定位**，附带 3 秒高亮闪烁，绝不丢失。

### 本地优先，JSON 存储

所有数据以 `.json` 文件存储在你的电脑上。无需账号、无需云端。你的提示词，你做主。

## AI 配置

AI 自动生成功能（标题、描述、标签、差异感知标题）使用 OpenAI 兼容 API。在**启动页**配置：

| 字段 | 说明 | 示例 |
|------|------|------|
| **API Base URL** | OpenAI 兼容的接口地址 | `https://api.openai.com/v1` |
| **API Key** | 你的 API Key | `sk-…` |
| **模型** | 模型名称 | `gpt-4o`、`deepseek-v3.2-exp` 等 |

配置保存在 `localStorage` 中，重启后保留。

**兼容的 API 服务商**（任何 OpenAI 兼容接口）：

| 服务商 | Base URL |
|--------|-----------|
| OpenAI | `https://api.openai.com/v1` |
| DeepSeek | `https://api.deepseek.com/v1` |
| Ollama（本地） | `http://localhost:11434/v1` |
| Azure OpenAI | `https://<resource>.openai.azure.com/openai/deployments/<deployment>` |

> **隐私说明**：API 请求直接从你的机器发送到配置的接口地址，PromptBonsai 不会代理或记录任何请求内容。

## 使用流程

```
1. 写一条基础提示词（如 "人像，柔和自然光，85mm"）
2. 分叉出风格变体（伦勃朗布光、电影感、水彩风…）
3. 每个变体可以继续分叉（暖色调、冷色调、高对比度…）
4. 给每个节点评分、打标签、写备注
5. AI 自动生成标题和差异对比
6. 导出为 .json — 你的提示词树可移植、可分享
```

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) >= 18
- [Yarn](https://yarnpkg.com/)（或 npm）

```bash
git clone <repo-url>
cd prompt-mgr
yarn install
yarn dev
```

首次启动后，点击**"打开示例"**即可加载预置的提示词库，包含 4 棵图像生成树（人像、产品、风景、角色设计）和 18 个变体。

### 构建

```bash
yarn build:win     # Windows 安装包
yarn build:unpack  # 免安装便携版
```

## 文件格式

PromptBonsai 将数据保存为 `.json` 文件：

```json
{
  "version": 1,
  "name": "我的提示词",
  "nodes": {
    "node-abc": {
      "id": "node-abc",
      "parentId": null,
      "childrenIds": ["node-def"],
      "title": "人像 — 基础提示词",
      "promptText": "一位年轻女性，柔和自然光，85mm...",
      "description": "人像变体的基础提示词",
      "rating": 4,
      "tags": [{ "name": "人像", "color": "#1856FF" }],
      "position": { "x": 0, "y": 0 },
      "createdAt": "2026-05-05T10:00:00.000Z",
      "updatedAt": "2026-05-05T10:00:00.000Z"
    }
  },
  "rootIds": ["node-abc"]
}
```

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Electron 28 |
| 前端 | Vue 3 (Composition API) + TypeScript |
| 构建 | Electron Vite |
| 状态管理 | Pinia |
| 画布 | Vue Flow |
| 国际化 | vue-i18n（中/英） |

## 快捷键

| 快捷键 | 操作 |
|--------|------|
| `Ctrl+N` | 新建项目 |
| `Ctrl+O` | 打开文件 |
| `Ctrl+S` | 保存 |
| `Ctrl+Shift+S` | 另存为 |
| `Esc` | 关闭编辑面板 |

## 许可证

MIT
