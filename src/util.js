// ========================================================================
// util.js — 汎用ヘルパー（描画にもロジックにも依存しない純関数）
// ========================================================================

// 0..maxExclusive-1 の整数乱数
function rng(maxExclusive) {
    return Math.floor(Math.random() * maxExclusive);
}

// min..max（両端含む）の整数乱数
function rngRange(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
}

// 既存の色調整ヘルパー（明度を amount 分ずらす）
function adjustColor(hex, amount) {
    const num = parseInt(hex.slice(1), 16);
    const r = clamp((num >> 16) + amount, 0, 255);
    const g = clamp(((num >> 8) & 0x00FF) + amount, 0, 255);
    const b = clamp((num & 0x0000FF) + amount, 0, 255);
    return `rgb(${r}, ${g}, ${b})`;
}

// 文字列を maxWidth(px) で折り返して行配列に。'\n' は強制改行。
// （日本語は単語境界が無いため1文字ずつ判定する）
function wrapText(context, text, maxWidth) {
    const lines = [];
    let line = '';
    for (const ch of String(text)) {
        if (ch === '\n') { lines.push(line); line = ''; continue; }
        const test = line + ch;
        if (context.measureText(test).width > maxWidth && line) {
            lines.push(line);
            line = ch;
        } else {
            line = test;
        }
    }
    if (line) lines.push(line);
    return lines;
}

// 重み付き抽選。list = [{ ...payload, w:重み }, ...] → 1要素を返す
function weightedPick(list) {
    const pool = list.filter(e => e.w > 0);
    if (pool.length === 0) return null;
    const total = pool.reduce((s, e) => s + e.w, 0);
    let r = Math.random() * total;
    for (const e of pool) {
        r -= e.w;
        if (r <= 0) return e;
    }
    return pool[pool.length - 1];
}

// ディープクローン（テンプレ複製用。関数を含まない素のデータ専用）
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
