---
name: session-restore
description: >-
  恢复上次对话的工作上下文。当用户说「继续上次」「恢复会话」「读一下 session」
  或新开对话要接上进度时使用；必须先读取 current-session.md。
disable-model-invocation: true
---

# 会话恢复

## 使用方式（给用户）

1. 每次结束工作前，编辑同目录下的 **`current-session.md`**（填日期、目标、进度、待办）。
2. 新对话开始时发送例如：
   - `@.cursor/skills/session-restore` 继续上次
   - 或：`请按 session-restore skill 读取 current-session.md 并接着做`

## Agent 执行步骤

1. **立即阅读** [current-session.md](current-session.md)，不要凭记忆猜测进度。
2. 若需要项目背景，再读 `project-context` skill。
3. 向用户用 2～3 句话确认：当前目标、上次停在哪、下一步打算做什么。
4. 按 `current-session.md` 的「待办」执行；完成后帮用户更新该文件里的进度与待办。

## 更新 current-session.md 的时机

- 完成一个可交付小目标后
- 用户说「先到这里」或即将换对话前
- 做出重要技术/产品决策后（记入「决策记录」）
