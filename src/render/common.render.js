// ========================================================================
// render/common.render.js — 共通描画部品 / タイトル / トランジション
// ========================================================================
// ※このディレクトリ（render/*）は「描画担当（コーデックス）」が中身を
//   差し替える層。ロジックには触れず、gameState を読んで描くだけ。

// 角丸風パネル枠（bg + シアン系ボーダー）
function drawPanelBox(x, y, w, h, accent, fillAlpha) {
    ctx.fillStyle = `rgba(0, 0, 20, ${fillAlpha === undefined ? 0.85 : fillAlpha})`;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = accent || '#0ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
}

// HP/MPバー等の汎用バー
function drawBar(x, y, w, h, pct, color) {
    pct = clamp(pct, 0, 1);
    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w * pct, h);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
}

// 会話ダイアログ（map / transition で共用）
function drawDialogBox() {
    if (!gameState.showDialog) return;
    const boxY = PLAYABLE_HEIGHT - 140;
    ctx.fillStyle = 'rgba(0, 0, 20, 0.95)';
    ctx.fillRect(50, boxY, canvas.width - 100, 130);
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 3;
    ctx.strokeRect(50, boxY, canvas.width - 100, 130);

    if (gameState.dialogNpc) {
        ctx.fillStyle = gameState.dialogNpc.color || '#0ff';
        ctx.beginPath();
        ctx.arc(100, PLAYABLE_HEIGHT - 80, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0ff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(gameState.dialogNpc.name || '', 100, PLAYABLE_HEIGHT - 30);
    }

    ctx.fillStyle = '#fff';
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'left';
    const lines = wrapText(ctx, gameState.dialogText, canvas.width - 250);
    let y = PLAYABLE_HEIGHT - 110;
    for (const line of lines) { ctx.fillText(line, 160, y); y += 28; }

    const pulse = Math.sin(animationTime * 0.15) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(0, 255, 255, ${pulse})`;
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('▼ SPACE で閉じる', canvas.width - 70, PLAYABLE_HEIGHT - 20);
}

// ── トランジション（暗転オーバーレイ） ───────────────────────
function renderTransition(ctx) {
    const under = gameState._transUnder || 'world';
    if (gameState.transitionDirection === 'in' && under === 'cutscene') renderCutscene(ctx);
    else renderWorld(ctx);
    ctx.fillStyle = `rgba(0, 0, 0, ${gameState.transitionAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// ── タイトル画面（プレースホルダ：コーデックスが本実装） ──────
function renderTitle(ctx) {
    // 背景
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    g.addColorStop(0, '#05050f'); g.addColorStop(0.5, '#0a0a20'); g.addColorStop(1, '#020208');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ロゴ
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#0ff'; ctx.shadowBlur = 24;
    ctx.fillStyle = '#0ff';
    ctx.font = 'bold 72px sans-serif';
    ctx.fillText('デウス・コード', canvas.width / 2, 230);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('八百万の神託', canvas.width / 2, 300);

    // メニュー
    const opts = titleOptions();
    const cur = clamp(gameState.title.cursor, 0, opts.length - 1);
    ctx.font = 'bold 26px sans-serif';
    for (let i = 0; i < opts.length; i++) {
        const y = 440 + i * 50;
        const sel = i === cur;
        ctx.fillStyle = sel ? '#0ff' : '#888';
        ctx.fillText((sel ? '▶ ' : '') + opts[i].label, canvas.width / 2, y);
    }

    const pulse = Math.sin(animationTime * 0.08) * 0.4 + 0.6;
    ctx.fillStyle = `rgba(0,255,255,${pulse})`;
    ctx.font = '16px sans-serif';
    ctx.fillText('↑↓ で選択 / SPACE で決定', canvas.width / 2, canvas.height - 60);
    ctx.textBaseline = 'alphabetic';
}
