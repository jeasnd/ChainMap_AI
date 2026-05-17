---
name: master-plan
description: >-
  chainmapai.com 站点最佳实施方案：托管、品牌、数据三阶段、DNS 与每周运维。
  用户问「整体方案」「怎么做完网站」时优先读本 skill。
disable-model-invocation: true
---

# ChainMap AI · 最佳实施方案（定稿）

## 仓库与域名

| 项 | 值 |
|----|-----|
| GitHub | https://github.com/jeasnd/ChainMap_AI |
| Pages 测试地址 | https://jeasnd.github.io/ChainMap_AI/ |
| 自定义域名 | chainmapai.com |
| DNS CNAME www | jeasnd.github.io |

## 总策略

**GitHub Pages + 阿里云 DNS + 静态 JSON + 每周 Actions 刷新 meta。**

（其余章节同前：三阶段产品、数据原则、运维节奏见 project-context / product-vision。）

## 用户仍需在网页完成的 3 步

1. GitHub → Settings → Pages → Deploy from branch `main` `/ (root)`
2. Custom domain：`chainmapai.com` → Enforce HTTPS
3. 阿里云 DNS：4×A @ + CNAME www → jeasnd.github.io
