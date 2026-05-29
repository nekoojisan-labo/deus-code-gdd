// ========================================================================
// render/battle.render.js — 戦闘画面（機能するプレースホルダ）
// ========================================================================
// gameState.battle を読んで描く。図形ベースなので外部画像不要。
// 見た目の作り込み（敵スプライト・神威エフェクト等）はコーデックスが担当。

const BATTLE_COMMANDS = ['たたかう', '神威', 'どうぐ', 'にげる'];

function renderBattle(ctx) {
    const b = gameState.battle;
    // 背景
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    g.addColorStop(0, '#0a0a1a'); g.addColorStop(1, '#1a0a1a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (!b) return;

    const highlight = (b.phase === 'target') ? b.targetPool[b.targetCursor] : null;

    // ── 敵（上段） ─────────────────────────────
    const ec = b.enemies.length;
    for (let i = 0; i < ec; i++) {
        const e = b.enemies[i];
        const x = canvas.width * (i + 1) / (ec + 1);
        const y = 200;
        const r = e.boss ? 70 : 44;
        ctx.globalAlpha = cAlive(e) ? 1 : 0.25;
        ctx.fillStyle = e.color;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = (highlight === e) ? '#ffea00' : '#000';
        ctx.lineWidth = (highlight === e) ? 5 : 2;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(e.name, x, y + r + 20);
        // HPバー
        drawBar(x - 50, y + r + 28, 100, 8, cHp(e) / cMaxHp(e), '#ff4444');
        if (highlight === e) { ctx.fillStyle = '#ffea00'; ctx.fillText('▼', x, y - r - 8); }
    }

    // ── 味方（下段パネル） ──────────────────────
    const panelY = canvas.height - 210;
    drawPanelBox(20, panelY, 540, 190);
    ctx.textAlign = 'left';
    let yy = panelY + 30;
    for (const a of b.allies) {
        const isCurrent = (b.current === a && (b.phase === 'command' || b.phase === 'skill' || b.phase === 'item'));
        const isTarget = (highlight === a);
        ctx.fillStyle = isCurrent ? '#0ff' : (cAlive(a) ? a.member.color : '#666');
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText((isCurrent ? '▶ ' : '') + (isTarget ? '☞ ' : '') + a.member.name + (cAlive(a) ? '' : '（戦闘不能）'), 36, yy);
        ctx.font = '12px sans-serif'; ctx.fillStyle = '#fff';
        ctx.fillText(`HP ${a.member.hp}/${a.member.maxHp}`, 220, yy);
        drawBar(310, yy - 12, 100, 10, a.member.hp / a.member.maxHp, '#00ff66');
        ctx.fillText(`MP ${a.member.mp}/${a.member.maxMp}`, 430, yy);
        if (a.shield > 0) { ctx.fillStyle = '#8cf'; ctx.fillText(`🛡${a.shield}`, 520, yy); }
        yy += 40;
    }

    // ── コマンド／サブメニュー ───────────────────
    if (b.phase === 'command') {
        drawPanelBox(580, panelY, canvas.width - 600, 190);
        ctx.textAlign = 'left';
        for (let i = 0; i < BATTLE_COMMANDS.length; i++) {
            const sel = i === b.menuCursor;
            ctx.fillStyle = sel ? '#0ff' : '#ccc';
            ctx.font = 'bold 20px sans-serif';
            ctx.fillText((sel ? '▶ ' : '   ') + BATTLE_COMMANDS[i], 600, panelY + 40 + i * 40);
        }
    } else if (b.phase === 'skill') {
        const list = getLearnedSkills(b.current.member);
        drawListPanel('神威', list.map(s => `${s.name}  MP${s.mpCost || 0}`), b.subCursor);
    } else if (b.phase === 'item') {
        const list = usableBattleItems();
        drawListPanel('どうぐ', list.length ? list.map(s => `${items[s.id].name} x${s.qty}`) : ['(なし)'], b.subCursor);
    } else if (b.phase === 'target') {
        drawPanelBox(580, panelY, canvas.width - 600, 190);
        ctx.fillStyle = '#0ff'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText('対象を選択', 600, panelY + 36);
        ctx.fillStyle = '#aaa'; ctx.font = '12px sans-serif';
        ctx.fillText('←→/↑↓で選択 SPACE決定 Xもどる', 600, panelY + 60);
    }

    // ── メッセージ／勝敗 ────────────────────────
    if (b.phase === 'message') drawBattleMessage(b.message);
    else if (b.phase === 'victory') drawVictory(b.rewards);
    else if (b.phase === 'defeat') drawBattleMessage('全滅した… SPACEで再開');
}

function drawListPanel(title, lines, cursor) {
    const panelY = canvas.height - 210;
    drawPanelBox(580, panelY, canvas.width - 600, 190);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0ff'; ctx.font = 'bold 16px sans-serif';
    ctx.fillText(title, 600, panelY + 28);
    ctx.font = '16px sans-serif';
    for (let i = 0; i < lines.length; i++) {
        const sel = i === cursor;
        ctx.fillStyle = sel ? '#0ff' : '#ccc';
        ctx.fillText((sel ? '▶ ' : '   ') + lines[i], 600, panelY + 56 + i * 26);
    }
    ctx.fillStyle = '#888'; ctx.font = '11px sans-serif';
    ctx.fillText('Xでもどる', canvas.width - 90, panelY + 182);
}

function drawBattleMessage(text) {
    const y = canvas.height - 70;
    drawPanelBox(20, y, canvas.width - 40, 56, '#0ff', 0.92);
    ctx.fillStyle = '#fff'; ctx.font = '18px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(text || '', 40, y + 34);
    const pulse = Math.sin(animationTime * 0.15) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(0,255,255,${pulse})`; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'right';
    ctx.fillText('▼ SPACE', canvas.width - 50, y + 36);
}

function drawVictory(rewards) {
    drawPanelBox(canvas.width / 2 - 220, 320, 440, 180, '#ffcc33', 0.95);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffcc33'; ctx.font = 'bold 28px sans-serif';
    ctx.fillText('勝利！', canvas.width / 2, 360);
    ctx.fillStyle = '#fff'; ctx.font = '18px sans-serif';
    if (rewards) {
        ctx.fillText(`EXP +${rewards.exp}   ゴールド +${rewards.gold}`, canvas.width / 2, 400);
        if (rewards.drops && rewards.drops.length) {
            const names = rewards.drops.map(id => items[id].name).join('、');
            ctx.fillText(`入手: ${names}`, canvas.width / 2, 428);
        }
        if (rewards.levelUps && rewards.levelUps.length) {
            ctx.fillStyle = '#0ff';
            ctx.fillText(`レベルアップ！ ${rewards.levelUps.join('、')}`, canvas.width / 2, 456);
        }
    }
    const pulse = Math.sin(animationTime * 0.15) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(0,255,255,${pulse})`; ctx.font = 'bold 14px sans-serif';
    ctx.fillText('▼ SPACE で続ける', canvas.width / 2, 486);
}
