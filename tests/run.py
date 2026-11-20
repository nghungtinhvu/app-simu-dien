"""Chạy bộ kiểm thử logic từng thiết bị: python3 tests/run.py
Cần: pip install playwright && playwright install chromium"""
import asyncio, json, pathlib
from playwright.async_api import async_playwright
ROOT = pathlib.Path(__file__).resolve().parent
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto((ROOT.parent / 'index.html').as_uri())
        d = json.loads(await pg.evaluate((ROOT / 'devtest.js').read_text(encoding='utf-8')))
        fails = [r for r in d['res'] if not r[2]]
        print(f"TỔNG {len(d['res'])}  ĐẠT {len(d['res'])-len(fails)}  LỖI {len(fails)}")
        for f in fails: print('LỖI', f)
        if d['miss']: print('Chưa có kiểm thử:', d['miss'])
        if errs: print('Lỗi JS:', errs)
        await b.close()
        raise SystemExit(1 if fails or errs else 0)
asyncio.run(main())
