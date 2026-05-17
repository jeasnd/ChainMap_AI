#!/usr/bin/env python3
"""
占位脚本：从外部源更新 data/hot-topics.json 与 data/stocks.json。
实现前请阅读 .cursor/skills/data-pipeline/SKILL.md

用法（将来）:
  python scripts/update_feed.py
"""
from __future__ import annotations

import json
from datetime import datetime, timezone, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"


def now_cst() -> str:
    tz = timezone(timedelta(hours=8))
    return datetime.now(tz).strftime("%Y-%m-%dT%H:%M:%S+08:00")


def touch_meta(path: Path) -> None:
    if not path.exists():
        print(f"skip: {path} not found")
        return
    data = json.loads(path.read_text(encoding="utf-8"))
    data.setdefault("meta", {})["updatedAt"] = now_cst()
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"updated meta.updatedAt -> {path.name}")


def main() -> None:
    print("update_feed: MVP 占位，仅刷新 meta.updatedAt。接入爬虫后在此实现抓取逻辑。")
    touch_meta(DATA / "hot-topics.json")
    touch_meta(DATA / "stocks.json")


if __name__ == "__main__":
    main()
