// ========================================================================
// render/world.render.js — マップ＋HUD＋目的バナー（旧 drawGame を移植）
// ========================================================================
// 描画担当（コーデックス）が拡張する層。gameState / maps を読んで描くだけ。

function renderWorld(ctx) {
    const map = maps[gameState.currentMap];

    // 背景
    ctx.fillStyle = map.bgColor;
    ctx.fillRect(0, 0, canvas.width, PLAYABLE_HEIGHT);

    // 床タイル
    for (let x = 0; x < GRID_WIDTH; x++) {
        for (let y = 0; y < GRID_HEIGHT; y++) {
            const alt = (x + y) % 2 === 0;
            ctx.fillStyle = alt ? map.bgColor : adjustColor(map.bgColor, 15);
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }

    // グリッド線
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= GRID_WIDTH; x++) { ctx.beginPath(); ctx.moveTo(x * TILE_SIZE, 0); ctx.lineTo(x * TILE_SIZE, PLAYABLE_HEIGHT); ctx.stroke(); }
    for (let y = 0; y <= GRID_HEIGHT; y++) { ctx.beginPath(); ctx.moveTo(0, y * TILE_SIZE); ctx.lineTo(canvas.width, y * TILE_SIZE); ctx.stroke(); }

    // 障害物
    for (const obs of map.obstacles) {
        ctx.fillStyle = '#3a3a4a';
        ctx.fillRect(obs.x * TILE_SIZE, obs.y * TILE_SIZE, obs.width * TILE_SIZE, obs.height * TILE_SIZE);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(obs.x * TILE_SIZE + 4, obs.y * TILE_SIZE + obs.height * TILE_SIZE, obs.width * TILE_SIZE, 4);
        ctx.fillStyle = '#fff';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(obs.name, (obs.x + obs.width / 2) * TILE_SIZE, (obs.y + obs.height / 2) * TILE_SIZE + 5);
    }

    // ポータル
    const glow = Math.sin(animationTime * 0.08) * 0.3 + 0.7;
    for (const portal of map.portals) {
        const px = portal.x * TILE_SIZE, py = portal.y * TILE_SIZE, pw = portal.width * TILE_SIZE, ph = portal.height * TILE_SIZE;
        const locked = portal.requireItem && !hasItem(portal.requireItem);
        ctx.shadowColor = locked ? '#f80' : '#0ff';
        ctx.shadowBlur = 20 * glow;
        ctx.fillStyle = locked ? `rgba(255,136,0,${0.3 * glow})` : `rgba(0,255,255,${0.3 * glow})`;
        ctx.fillRect(px, py, pw, ph);
        ctx.strokeStyle = locked ? `rgba(255,136,0,${glow})` : `rgba(0,255,255,${glow})`;
        ctx.lineWidth = 3;
        ctx.strokeRect(px + 2, py + 2, pw - 4, ph - 4);
        ctx.shadowBlur = 0;

        const tx = px + pw / 2, ty = py + ph / 2;
        const label = locked ? portal.label + '🔒' : portal.label;
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const tw = ctx.measureText(label).width + 10;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(tx - tw / 2, ty - 10, tw, 20);
        ctx.fillStyle = locked ? '#fb0' : '#0ff';
        ctx.fillText(label, tx, ty);
        ctx.textBaseline = 'alphabetic';
    }

    // NPC（有効なものだけ）
    const objective = gameState.story.objective || {};
    for (const npc of activeNpcs(map)) {
        const bob = Math.sin(animationTime * 0.1 + npc.x) * 2;
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(npc.x * TILE_SIZE + TILE_SIZE / 2, npc.y * TILE_SIZE + TILE_SIZE - 5, TILE_SIZE / 3, TILE_SIZE / 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = npc.color;
        ctx.beginPath();
        ctx.arc(npc.x * TILE_SIZE + TILE_SIZE / 2, npc.y * TILE_SIZE + TILE_SIZE / 2 + bob, TILE_SIZE / 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFD700';
        ctx.font = '20px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('💬', npc.x * TILE_SIZE + TILE_SIZE / 2, npc.y * TILE_SIZE - 5 + bob);
        ctx.fillStyle = '#fff';
        ctx.font = '11px sans-serif';
        ctx.fillText(npc.name, npc.x * TILE_SIZE + TILE_SIZE / 2, npc.y * TILE_SIZE + TILE_SIZE + 12);

        // 目的マーカー（鳥居）：このマップが目的地で、対象NPCのとき
        if (objective.targetMap === gameState.currentMap && objective.targetNpc === npc.name) {
            const mp = Math.sin(animationTime * 0.12) * 4;
            ctx.font = '24px sans-serif';
            ctx.fillStyle = '#ff4d4d';
            ctx.fillText('⛩', npc.x * TILE_SIZE + TILE_SIZE / 2, npc.y * TILE_SIZE - 24 + mp);
        }
    }

    // プレイヤー
    const pBob = Math.sin(animationTime * 0.15) * 2;
    const aura = TILE_SIZE / 2 + Math.sin(animationTime * 0.1) * 5;
    ctx.fillStyle = 'rgba(0,255,100,0.2)';
    ctx.beginPath();
    ctx.arc(gameState.player.x * TILE_SIZE + TILE_SIZE / 2, gameState.player.y * TILE_SIZE + TILE_SIZE / 2, aura, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(gameState.player.x * TILE_SIZE + TILE_SIZE / 2, gameState.player.y * TILE_SIZE + TILE_SIZE - 5, TILE_SIZE / 3, TILE_SIZE / 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(gameState.player.x * TILE_SIZE + TILE_SIZE / 2, gameState.player.y * TILE_SIZE + TILE_SIZE / 2 + pBob, TILE_SIZE / 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#00ff66'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('カイト', gameState.player.x * TILE_SIZE + TILE_SIZE / 2, gameState.player.y * TILE_SIZE + TILE_SIZE + 14);

    // マップ情報ボックス
    drawPanelBox(10, 10, 300, 75);
    ctx.fillStyle = '#0ff'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(map.name, 20, 35);
    ctx.fillStyle = '#aaa'; ctx.font = '12px sans-serif';
    ctx.fillText(map.description || '', 20, 55);
    ctx.fillStyle = '#fff';
    ctx.fillText(`歩数: ${map.walkCount}  遭遇率: ${map.encounterRate}%`, 20, 75);

    // 目的バナー（ソフト誘導：常時表示）
    if (objective.text) {
        drawPanelBox(10, 95, 380, 34, '#ffcc33');
        ctx.fillStyle = '#ffcc33'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText('▶ 目的: ' + objective.text, 20, 117);
    }

    // 操作ヘルプ
    drawPanelBox(canvas.width - 220, 10, 210, 110);
    ctx.fillStyle = '#0ff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('操作方法', canvas.width - 210, 30);
    ctx.fillStyle = '#fff'; ctx.font = '12px sans-serif';
    ctx.fillText('↑←↓→: 移動', canvas.width - 210, 50);
    ctx.fillText('SPACE: 会話・決定', canvas.width - 210, 70);
    ctx.fillText('X: メニュー', canvas.width - 210, 90);
    ctx.fillText('S: セーブ', canvas.width - 210, 110);

    drawWorldStatusBar();
    drawDialogBox();
}

// 画面下のステータスバー
function drawWorldStatusBar() {
    const p = gameState.player;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, PLAYABLE_HEIGHT, canvas.width, STATUS_BAR_HEIGHT);
    const grad = ctx.createLinearGradient(0, PLAYABLE_HEIGHT, canvas.width, PLAYABLE_HEIGHT);
    grad.addColorStop(0, '#0ff'); grad.addColorStop(0.5, '#0088ff'); grad.addColorStop(1, '#0ff');
    ctx.strokeStyle = grad; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, PLAYABLE_HEIGHT); ctx.lineTo(canvas.width, PLAYABLE_HEIGHT); ctx.stroke();

    ctx.fillStyle = '#fff'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(`HP: ${p.hp}/${p.maxHp}`, 30, PLAYABLE_HEIGHT + 35);
    drawBar(30, PLAYABLE_HEIGHT + 45, 200, 25, p.hp / p.maxHp, p.hp / p.maxHp > 0.5 ? '#00ff00' : p.hp / p.maxHp > 0.25 ? '#ffff00' : '#ff0000');
    ctx.fillStyle = '#fff';
    ctx.fillText(`MP: ${p.mp}/${p.maxMp}`, 260, PLAYABLE_HEIGHT + 35);
    drawBar(260, PLAYABLE_HEIGHT + 45, 200, 25, p.mp / p.maxMp, '#0066ff');

    ctx.fillStyle = '#fff';
    ctx.fillText('Lv.' + p.level, 500, PLAYABLE_HEIGHT + 35);
    ctx.fillText('EXP: ' + p.exp, 500, PLAYABLE_HEIGHT + 60);
    ctx.fillText('ゴールド: ' + gameState.gold, 620, PLAYABLE_HEIGHT + 60);

    // パーティ簡易表示
    ctx.textAlign = 'left'; ctx.font = '12px sans-serif';
    const party = activeParty();
    let px2 = 500, py2 = PLAYABLE_HEIGHT + 95;
    ctx.fillStyle = '#888';
    ctx.fillText('パーティ:', px2, py2);
    px2 += 70;
    for (const mem of party) {
        ctx.fillStyle = mem.color;
        ctx.fillText(`${mem.name} ${mem.hp}/${mem.maxHp}`, px2, py2);
        px2 += 150;
    }

    ctx.fillStyle = '#0f0'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'right';
    ctx.fillText('カイト', canvas.width - 30, PLAYABLE_HEIGHT + 40);
    ctx.fillStyle = '#888'; ctx.font = '14px sans-serif';
    ctx.fillText('依人 - スサノオ', canvas.width - 30, PLAYABLE_HEIGHT + 65);
    ctx.fillStyle = '#666'; ctx.font = '12px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(`座標: (${gameState.player.x}, ${gameState.player.y})`, 30, PLAYABLE_HEIGHT + 95);
}
