// ========================================================================
// systems/title.js — タイトル画面（はじめから／つづきから）
// ========================================================================
// 起動時の最初のシーン。オープニングの「溜め」を作り、唐突さを和らげる。

function titleOptions() {
    const opts = [
        { label: 'はじめから', act: () => { newGame(); startOpening(); } }
    ];
    if (hasSave()) {
        opts.push({ label: 'つづきから', act: () => { loadGame(); } });
    }
    return opts;
}

function updateTitle() { /* no-op: 入力駆動 */ }

function titleKey(e) {
    const opts = titleOptions();
    const k = e.key;
    if (k === 'ArrowUp') gameState.title.cursor = (gameState.title.cursor + opts.length - 1) % opts.length;
    else if (k === 'ArrowDown') gameState.title.cursor = (gameState.title.cursor + 1) % opts.length;
    else if (k === ' ' || k === 'Enter') {
        const o = opts[clamp(gameState.title.cursor, 0, opts.length - 1)];
        if (o) o.act();
    }
}
