#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从 MP3 提取内嵌歌词和封面，保存为同名 .lrc 和 .jpg
用法：
    python extract_mp3_lyrics_cover.py ./static -r
"""

import sys
import argparse
from pathlib import Path
from mutagen.mp3 import MP3


def ms_to_lrc(ms: int) -> str:
    """毫秒转 LRC 时间标签 [mm:ss.xx]"""
    total_seconds = ms / 1000.0
    minutes = int(total_seconds // 60)
    seconds = int(total_seconds % 60)
    hundredths = int((total_seconds - int(total_seconds)) * 100)
    return f"[{minutes:02d}:{seconds:02d}.{hundredths:02d}]"


def sylt_to_lrc(sylt_frame) -> str:
    """把 ID3 SYLT 同步歌词转成 LRC 文本"""
    lines = []
    for item in sylt_frame.text:
        # mutagen 的 SYLT.text 元素通常是 (text, time_ms)
        if isinstance(item, tuple) and len(item) == 2:
            text, time_ms = item
            lines.append(f"{ms_to_lrc(time_ms)}{text}")
    return "\n".join(lines)


def extract_lyrics(tags) -> str | None:
    """从 ID3 标签中提取歌词，优先同步歌词 SYLT，其次 USLT，最后 TXXX"""
    if tags is None:
        return None

    # 1. 同步歌词 SYLT
    for sylt in tags.getall("SYLT"):
        lrc = sylt_to_lrc(sylt)
        if lrc.strip():
            return lrc

    # 2. 非同步歌词 USLT
    for uslt in tags.getall("USLT"):
        text = getattr(uslt, "text", None)
        if text and text.strip():
            return text

    # 3. 一些软件把歌词放在 TXXX 自定义帧里
    for txxx in tags.getall("TXXX"):
        desc = (txxx.desc or "").lower()
        if desc in ("lyrics", "lyric", "unsyncedlyrics", "同步歌词", "歌词"):
            text = txxx.text
            if isinstance(text, list):
                return "\n".join(text)
            if text:
                return text

    return None


def extract_cover(tags, mp3_path: Path) -> Path | None:
    """提取封面，统一保存为同名 .jpg"""
    if tags is None:
        return None

    covers = tags.getall("APIC")
    if not covers:
        return None

    # 优先 front cover（type == 3）
    front = [c for c in covers if c.type == 3]
    cover = front[0] if front else covers[0]
    data = cover.data
    mime = (cover.mime or "").lower()
    jpg_path = mp3_path.with_suffix(".jpg")

    # 如果原始封面是 PNG，尽量用 Pillow 转成 JPG
    if "png" in mime:
        try:
            from PIL import Image
            import io

            img = Image.open(io.BytesIO(data))
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            img.save(jpg_path, "JPEG", quality=90)
            return jpg_path
        except ImportError:
            # 没装 Pillow 就直接写 .jpg，浏览器通常仍能显示
            jpg_path.write_bytes(data)
            print(f"[警告] 封面为 PNG，未安装 Pillow，已直接保存为 .jpg: {jpg_path}")
            return jpg_path

    jpg_path.write_bytes(data)
    return jpg_path


def process_mp3(mp3_path: Path, overwrite: bool = False) -> None:
    try:
        audio = MP3(mp3_path)
        tags = audio.tags

        if tags is None:
            print(f"[跳过] 无 ID3 标签: {mp3_path}")
            return

        # 提取歌词
        lrc_path = mp3_path.with_suffix(".lrc")
        if lrc_path.exists() and not overwrite:
            print(f"[跳过] 歌词已存在: {lrc_path}")
        else:
            lyrics = extract_lyrics(tags)
            if lyrics:
                lrc_path.write_text(lyrics, encoding="utf-8")
                print(f"[写入] 歌词: {lrc_path}")
            else:
                print(f"[未找到] 歌词: {mp3_path}")

        # 提取封面
        cover_path = extract_cover(tags, mp3_path)
        if cover_path:
            print(f"[写入] 封面: {cover_path}")
        else:
            print(f"[未找到] 封面: {mp3_path}")

    except Exception as e:
        print(f"[错误] {mp3_path}: {e}")


def main():
    parser = argparse.ArgumentParser(
        description="从 MP3 提取内嵌歌词和封面为同名 .lrc 和 .jpg"
    )
    parser.add_argument(
        "path", nargs="?", default=".", help="MP3 文件或目录，默认当前目录"
    )
    parser.add_argument(
        "-r", "--recursive", action="store_true", help="递归处理子目录"
    )
    parser.add_argument(
        "-o", "--overwrite", action="store_true", help="覆盖已存在的 .lrc/.jpg"
    )
    args = parser.parse_args()

    target = Path(args.path)

    if target.is_file() and target.suffix.lower() == ".mp3":
        mp3_files = [target]
    elif target.is_dir():
        pattern = "**/*.mp3" if args.recursive else "*.mp3"
        mp3_files = list(target.glob(pattern))
    else:
        print("请指定 MP3 文件或目录")
        sys.exit(1)

    if not mp3_files:
        print("未找到 MP3 文件")
        return

    for mp3 in mp3_files:
        process_mp3(mp3, overwrite=args.overwrite)


if __name__ == "__main__":
    main()