# 当前会话快照

**最后更新**：2026-05-17

## 当前目标

搭建「专注 AI 投资」三层站点：宏观热点 → 优选股票 → 数据论证；并完成对应 Cursor skills。

## 已完成

- [x] 5 个业务 skill：product-vision, macro-hot-topics, stock-picking, stock-evidence, data-pipeline
- [x] 数据层 `data/hot-topics.json`（6 个方向种子，含参考图六层框架）
- [x] 数据层 `data/stocks.json`（跨 US/A/HK/KR 示例标的 + 论证字段）
- [x] 页面：hot-topics.html、topic.html、stock.html + js/invest-app.js
- [x] 首页三层能力入口与导航更新

## 待办

1. 接入真实抓取（`scripts/update_feed.py` 扩展）
2. 财报后手工/自动填充 `metrics` 具体数值
3. 用户确认是否要深色 hero 下 `btn-outline` 样式微调

## 决策记录

| 日期 | 决策 | 原因 |
|------|------|------|
| 2026-05-17 | 静态 JSON + fetch，非后端 | 与现有 GitHub Pages 静态站一致 |
| 2026-05-17 | 六层资本扩散为宏观 taxonomy | 用户提供 ARK 类参考图 |

## 本地预览

```bash
cd 投资网站
python -m http.server 8080
# 打开 http://localhost:8080/hot-topics.html
```
