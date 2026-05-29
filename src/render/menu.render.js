// ========================================================================
// render/menu.render.js — メニュー／インベントリ／店（機能するプレースホルダ）
// ========================================================================
// gameState.menu と menuOptions() を読んで描く。詳細レイアウトはコーデックスが拡張。

const MENU_PAGE_TITLE = {
    root: 'メニュー', item: 'アイテム', itemTarget: '使う相手',
    kamuiMember: '神威 - 依人を選ぶ', kamuiList: '神威',
    equipMember: 'そうび - 依人を選ぶ', equip: 'そうび',
    statusMember: 'ステータス - 依人を選ぶ', status: 'ステータス',
    shop: '購入', shopSell: '売却', inn: '宿屋'
};

function renderMenu(ctx) {
    const m = gameState.menu;

    // 半透明オーバーレイ
    ctx.fillStyle = 'rgba(0,0,10,0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const x = 120, y = 80, w = canvas.width - 240, h = canvas.height - 220;
    drawPanelBox(x, y, w, h, '#0ff', 0.95);

    // ヘッダ
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#0ff'; ctx.font = 'bold 22px sans-serif';
    ctx.fillText(MENU_PAGE_TITLE[m.page] || 'メニュー', x + 24, y + 36);
    ctx.fillStyle = '#ffcc33'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'right';
    ctx.fillText('所持金: ' + gameState.gold + ' G', x + w - 24, y + 36);
    ctx.strokeStyle = '#055'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x + 20, y + 48); ctx.lineTo(x + w - 20, y + 48); ctx.stroke();

    // ステータス詳細ページ
    if (m.page === 'status' && m.context && m.context.member) {
        drawStatusDetail(m.context.member, x + 24, y + 80);
    }

    // 選択肢リスト
    const opts = menuOptions();
    ctx.textAlign = 'left'; ctx.font = '18px sans-serif';
    const listX = (m.page === 'status') ? x + w - 160 : x + 30;
    let ly = y + 84;
    const maxVisible = Math.floor((h - 120) / 30);
    const start = clamp(m.cursor - Math.floor(maxVisible / 2), 0, Math.max(0, opts.length - maxVisible));
    for (let i = start; i < Math.min(opts.length, start + maxVisible); i++) {
        const sel = i === m.cursor;
        ctx.fillStyle = sel ? '#0ff' : '#ddd';
        ctx.fillText((sel ? '▶ ' : '   ') + opts[i].label, listX, ly);
        ly += 30;
    }

    // 説明・メッセージ
    const sel = opts[m.cursor];
    ctx.font = '13px sans-serif'; ctx.fillStyle = '#9cf';
    if (sel && sel.desc) ctx.fillText(sel.desc, x + 30, y + h - 50);
    if (m.message) { ctx.fillStyle = '#ffcc33'; ctx.fillText(m.message, x + 30, y + h - 28); }

    ctx.fillStyle = '#888'; ctx.font = '12px sans-serif'; ctx.textAlign = 'right';
    ctx.fillText('↑↓ 選択 / SPACE 決定 / X もどる', x + w - 24, y + h - 16);
}

function drawStatusDetail(mem, x, y) {
    // 肖像（色円）
    ctx.fillStyle = mem.color;
    ctx.beginPath(); ctx.arc(x + 40, y + 30, 30, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`${mem.name}`, x + 90, y + 20);
    ctx.fillStyle = '#9cf'; ctx.font = '14px sans-serif';
    ctx.fillText(`依人 - ${mem.god}（${mem.role}）  Lv.${mem.level}`, x + 90, y + 44);

    ctx.fillStyle = '#fff'; ctx.font = '15px sans-serif';
    const rows = [
        `HP  ${mem.hp}/${mem.maxHp}`,
        `MP  ${mem.mp}/${mem.maxMp}`,
        `EXP ${mem.exp}/${mem.expNext}`,
        `ATK ${effStat(mem, 'atk')}   DEF ${effStat(mem, 'def')}`,
        `MAG ${effStat(mem, 'mag')}   SPD ${effStat(mem, 'spd')}`,
        `武器: ${mem.equipped.weapon ? items[mem.equipped.weapon].name : 'なし'}`
    ];
    let ry = y + 90;
    for (const r of rows) { ctx.fillText(r, x, ry); ry += 26; }

    // 習得神威（スキルツリー簡易表示）
    ctx.fillStyle = '#0ff'; ctx.font = 'bold 14px sans-serif';
    ctx.fillText('神威', x, ry + 6); ry += 28;
    ctx.font = '13px sans-serif';
    for (const node of mem.skillTree) {
        const learned = mem.learned.includes(node.id);
        ctx.fillStyle = learned ? '#fff' : '#555';
        ctx.fillText(`${learned ? '◆' : '◇'} ${skills[node.id].name}  (Lv.${node.level})`, x, ry);
        ry += 22;
    }
}
