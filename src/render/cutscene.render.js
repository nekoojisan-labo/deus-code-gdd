// ========================================================================
// render/cutscene.render.js — カットシーン描画（旧 drawOpening を汎用化）
// ========================================================================
// gameState.cutscene.panels[index] を読んで描く。type ごとに演出を分ける
// 余地を残してある（awakening の放射グロー等）。コーデックスが拡張可能。

function drawCutsceneBackground(scene) {
    const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bg.addColorStop(0, '#05050f');
    bg.addColorStop(0.5, '#0a0a20');
    bg.addColorStop(1, '#020208');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 縦に流れるスキャンライン
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    const spacing = 4;
    const offset = (animationTime * 0.5) % spacing;
    for (let y = -offset; y < canvas.height; y += spacing) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // 上下の装飾バー
    ctx.fillStyle = scene.accentColor;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(0, 0, canvas.width, 6);
    ctx.fillRect(0, canvas.height - 6, canvas.width, 6);
    ctx.globalAlpha = 1;

    // コーナー装飾
    ctx.strokeStyle = scene.accentColor;
    ctx.lineWidth = 2;
    const cs = 40, mg = 30;
    const corners = [
        [mg, mg + cs, mg, mg, mg + cs, mg],
        [canvas.width - mg - cs, mg, canvas.width - mg, mg, canvas.width - mg, mg + cs],
        [mg, canvas.height - mg - cs, mg, canvas.height - mg, mg + cs, canvas.height - mg],
        [canvas.width - mg - cs, canvas.height - mg, canvas.width - mg, canvas.height - mg, canvas.width - mg, canvas.height - mg - cs]
    ];
    for (const c of corners) {
        ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(c[2], c[3]); ctx.lineTo(c[4], c[5]); ctx.stroke();
    }

    // 覚醒：放射状グロー
    if (scene.type === 'awakening') {
        const pulse = Math.sin(animationTime * 0.07) * 0.15 + 0.35;
        const glow = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 50, canvas.width / 2, canvas.height / 2, canvas.width / 1.5);
        glow.addColorStop(0, hexToRgba(scene.accentColor, pulse));
        glow.addColorStop(0.45, hexToRgba(scene.accentColor, pulse * 0.25));
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    // 事件：赤いフリッカー
    if (scene.type === 'processing') {
        const flick = (Math.sin(animationTime * 0.4) > 0.7) ? 0.06 : 0.02;
        ctx.fillStyle = `rgba(255,0,0,${flick})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

// #rrggbb → rgba（透過つき）
function hexToRgba(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${n >> 16}, ${(n >> 8) & 0xff}, ${n & 0xff}, ${a})`;
}

function renderCutscene(ctx) {
    const cs = gameState.cutscene;
    const panel = cs.panels[cs.index];
    if (!panel) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height); return; }

    drawCutsceneBackground(panel);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // タイトル
    ctx.shadowColor = panel.accentColor; ctx.shadowBlur = 18;
    ctx.fillStyle = panel.accentColor;
    const titleSize = panel.type === 'title' ? 64 : 44;
    ctx.font = `bold ${titleSize}px sans-serif`;
    const titleY = panel.type === 'title' ? 230 : 175;
    ctx.fillText(panel.title || '', canvas.width / 2, titleY);
    ctx.shadowBlur = 0;
    if (panel.subtitle) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 34px sans-serif';
        ctx.fillText(panel.subtitle, canvas.width / 2, titleY + 62);
    }

    // 本文（タイプライター）
    const totalChars = panelCharCount(panel);
    const fully = !panel.typewriter || cs.charReveal >= totalChars;
    ctx.fillStyle = '#f0f0f0';
    ctx.font = '24px sans-serif';
    const lineHeight = 38;
    const body = panel.body || [];
    let revealLeft = Math.floor(cs.charReveal);
    let y = panel.type === 'title' ? 405 : canvas.height / 2 - 30;
    for (const line of body) {
        let text = line;
        if (panel.typewriter) { text = line.slice(0, Math.max(0, revealLeft)); revealLeft -= line.length; }
        ctx.fillText(text, canvas.width / 2, y);
        y += lineHeight;
    }

    // ページ表示・ドット
    const total = cs.panels.length;
    ctx.fillStyle = '#555';
    ctx.font = '14px sans-serif';
    ctx.fillText(`${cs.index + 1} / ${total}`, canvas.width / 2, canvas.height - 40);
    const dotSpacing = 18, dw = (total - 1) * dotSpacing, sx = canvas.width / 2 - dw / 2;
    for (let i = 0; i < total; i++) {
        ctx.fillStyle = i === cs.index ? panel.accentColor : '#333';
        ctx.beginPath(); ctx.arc(sx + i * dotSpacing, canvas.height - 65, 4, 0, Math.PI * 2); ctx.fill();
    }

    // プロンプト
    const pulse = Math.sin(animationTime * 0.08) * 0.4 + 0.6;
    ctx.fillStyle = `rgba(0,255,255,${pulse})`;
    ctx.font = 'bold 18px sans-serif';
    const last = cs.index === total - 1;
    const prompt = !fully ? '▼ SPACE で全文表示' : (last ? '▼ SPACE で続ける' : '▼ SPACE で進む');
    ctx.fillText(prompt, canvas.width / 2, canvas.height - 95);

    ctx.textBaseline = 'alphabetic';
}
