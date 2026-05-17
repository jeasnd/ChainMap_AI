---
name: content-authoring
description: >-
  在本站新增或修改深度专题文章、更新首页卡片与导航。用户提到新文章、
  复制专题模板、改 article-*.html 时使用。
---

# 内容维护：新专题文章

##  checklist

```
- [ ] 复制 article-memory.html → article-<主题>.html
- [ ] 改 <title>、meta description、article-h1、article-kicker
- [ ] 重写 article-toc 与 article-body
- [ ] index.html：article-cards 增加链接卡片（或替换 placeholder）
- [ ] 各页 nav：如需新入口，同步 header 导航（目前三栏固定，新专题通常只加首页卡片）
- [ ] 本地浏览器打开检查锚点、移动端菜单
```

## 复制模板时注意

- 保留 `styles.css`、`script.js` 引用路径（与 html 同级）。
- 文章内链站外资源用 `rel="noopener noreferrer"`。
- 代码块、步骤列表沿用 `article-ol-steps`、`article-note` 等现有 class，不新增 CSS 除非版式确实不够。

## 首页卡片 HTML 模式

参考 `index.html` 中 `article-memory` 那张 `a.article-card`：badge、title、desc、cta 四段结构；placeholder 用 `article-card-placeholder` 区分。

## 禁止 / 谨慎

- 不写具体买卖建议、不承诺收益。
- 不删除首页 `#disclaimer` 投资风险提示区块。
