---
name: data-pipeline
description: >-
  从网络抓取并更新 hot-topics.json 与 stocks.json 的流程、频率与注意点。
  用户提到爬虫、实时数据、定时更新时使用。
---

# 数据管道 · 抓取与更新

## 当前架构（MVP）

```
[外部数据源] → (未来) scripts/update_feed.py → data/*.json → 静态页 fetch 渲染
```

站点为静态托管时，**不能**在浏览器里可靠爬取多数财经站（CORS、反爬）。推荐：

1. **本地/CI 定时跑脚本** 生成 JSON
2. **git commit** 后 GitHub Pages 自动发布

## 目标文件

| 文件 | 内容 |
|------|------|
| `data/hot-topics.json` | 宏观方向列表 + `meta.updatedAt` |
| `data/stocks.json` | 个股论证数据 |

## 建议更新频率

| 数据类型 | 频率 |
|----------|------|
| 宏观热度排序 | 每周 1 次，重大财报日可加更 |
| 个股 metrics | 每季财报后 48h 内 |
| 新闻 evidence | 每周补充 0～2 条高质量来源 |

## 抓取来源清单（按优先级）

**宏观叙事**

- 龙头财报电话会关键词（CapEx、HBM、DC power）
- 公开 RSS：Reuters Technology、财联社电报（需解析）
- 搜索引擎趋势（可选）：「HBM」「光模块」相对热度

**个股数据**

- 美股：SEC EDGAR、Yahoo Finance API（非官方，注意 ToS）
- A 股：巨潮资讯公告、东方财富公开页（遵守 robots）
- 港股：披露易 HKEXnews

**禁止**

- 绕过付费墙批量爬取
- 编造未披露的精确财务数字

## 脚本占位

在 `scripts/` 下新增 `update_feed.py`（待实现）时应：

1. 读现有 JSON，合并而非全量覆盖（保留 `firstSeenAt`）
2. 输出前校验 JSON schema（id 唯一、stockIds 存在）
3. 写 `meta.updatedAt` 为 ISO8601 东八区

## 前端拉取

`js/invest-app.js` 在页面加载时 `fetch('data/hot-topics.json')`；失败时显示友好错误。

本地调试需 HTTP 服务（`file://` 下 fetch 常失败）：

```bash
cd 投资网站
python -m http.server 8080
```

## GitHub Actions 草图（可选后续）

```yaml
# .github/workflows/update-data.yml
# schedule: cron 每周一 08:00 UTC
# steps: python scripts/update_feed.py → git commit data/
```

## Agent 手工更新（现在）

无脚本时：根据 `macro-hot-topics` 与 `stock-picking` 规则直接编辑两个 JSON，并跑本地 HTTP 预览。
