---
name: project-context
description: >-
  投资网站「AI投资图谱」的项目背景、三层产品能力与文件结构。在用户编辑本仓库、
  更新热点/选股数据或讨论 AI 投资站功能时使用。
---

# AI投资图谱 · 项目上下文

## 产品目标（三层）

1. **宏观热点**：AI 产业链当前最值得关注的方向，新热在上、旧热在下，带 `updatedAt` / `firstSeenAt`
2. **精选标的**：每个方向 1～3 只，美股 / A股 / 港股，按壁垒、盈利、难替代性优选
3. **数据论证**：个股页展示 thesis、metrics、evidence、risks

详见 `product-vision` skill。

## 技术栈

| 类型 | 说明 |
|------|------|
| 架构 | 静态 HTML + CSS + 原生 JS |
| 数据 | `data/hot-topics.json`、`data/stocks.json` |
| 渲染 | `js/invest-app.js`（fetch JSON 动态渲染） |
| 抓取 | 计划 `scripts/update_feed.py`（见 `data-pipeline`） |

## 文件结构

```
index.html              # 首页 + 三层能力入口
hot-topics.html         # 宏观方向列表
topic.html?id=          # 方向详情 + 优选标的
stock.html?id=          # 个股论证
data/hot-topics.json
data/stocks.json
js/invest-app.js
article-memory.html     # 深度专题（存量）
guide-hosting.html
styles.css
script.js
.cursor/skills/         # Agent 续聊与业务规则
```

## 六层资本扩散框架

L1 算力 → L2 存储 → L3 互连 → L4 基础设施 → L5 能源 → L6 应用（见 `macro-hot-topics`）

## 原则

- 简体中文对用户；不构成荐股
- 本地预览需 HTTP 服务：`python -m http.server 8080`
- 改 JSON 后同步更新 `meta.updatedAt`

## 相关 skill

`product-vision` · `macro-hot-topics` · `stock-picking` · `stock-evidence` · `data-pipeline` · `session-restore`
