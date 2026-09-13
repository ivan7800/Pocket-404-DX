#!/usr/bin/env python3
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
parts=['data.js','engine.js','audio.js','save.js','app.js']
out=["/* Pocket 404 DX v6.1.0 COMPLETE ADVENTURE EDITION - generated from modular sources. */","'use strict';",""]
for name in parts:
    text=(ROOT/'js'/name).read_text(encoding='utf-8')
    text=re.sub(r'^import\s+[^;]+;\s*$', '', text, flags=re.M)
    text=re.sub(r'^(\s*)export\s+(?=(?:const|let|var|function|class)\b)', r'\1', text, flags=re.M)
    out.append(f"\n/* ===== js/{name} ===== */\n{text.strip()}\n")
(ROOT/'js'/'bundle.js').write_text('\n'.join(out),encoding='utf-8')
print('built', ROOT/'js'/'bundle.js')
