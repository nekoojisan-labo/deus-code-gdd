// ========================================================================
// systems/menu.js — メニュー／インベントリ／そうび／ステータス／店／宿
// ========================================================================
// map シーン上のオーバーレイ。gameState.menu.open で表示・入力を切替える。
// 各ページの選択肢は menuOptions() が動的に返す（描画と入力で共用）。

function openMenu() {
    if (gameState.scene !== 'map' || gameState.showDialog) return;
    gameState.menu = { open: true, page: 'root', cursor: 0, stack: [], context: null, message: '' };
}
function closeMenu() {
    gameState.menu = { open: false, page: 'root', cursor: 0, stack: [], context: null, message: '' };
}
function pushPage(page, context) {
    const m = gameState.menu;
    m.stack.push({ page: m.page, cursor: m.cursor, context: m.context });
    m.page = page; m.cursor = 0; m.context = context || null; m.message = '';
}
function popPage() {
    const m = gameState.menu;
    if (m.stack.length) {
        const s = m.stack.pop();
        m.page = s.page; m.cursor = s.cursor; m.context = s.context; m.message = '';
    } else {
        closeMenu();
    }
}

// 店／宿を開く（world.interactNpc から）
function openShop(shopId) {
    const shop = shops[shopId];
    if (!shop) return;
    if (shop.type === 'inn') {
        gameState.menu = { open: true, page: 'inn', cursor: 0, stack: [], context: { shopId }, message: shop.line };
    } else {
        gameState.menu = { open: true, page: 'shop', cursor: 0, stack: [], context: { shopId }, message: shop.title };
    }
}

// ── 現在ページの選択肢（{label, desc?, act} の配列） ─────────────
function menuOptions() {
    const m = gameState.menu;
    const ctx = m.context || {};
    switch (m.page) {
        case 'root': {
            const root = [
                { label: 'アイテム',    act: () => pushPage('item') },
                { label: '神威',        act: () => pushPage('kamuiMember') },
                { label: 'そうび',      act: () => pushPage('equipMember') },
                { label: 'ステータス',  act: () => pushPage('statusMember') },
                { label: 'セーブ',      act: () => { saveGame(); m.message = 'セーブした（神社の印）'; } }
            ];
            if (hasFlag('game_cleared')) {
                root.push({ label: 'タイトルへ戻る', act: () => {
                    closeMenu(); newGame(); gameState.scene = 'title';
                } });
            }
            root.push({ label: 'とじる', act: closeMenu });
            return root;
        }

        case 'item': {
            const opts = gameState.inventory.map(slot => ({
                label: `${items[slot.id].name} x${slot.qty}`,
                desc: items[slot.id].desc || '',
                act: () => selectItem(slot)
            }));
            opts.push({ label: 'もどる', act: popPage });
            return opts;
        }
        case 'itemTarget': {
            const opts = gameState.party.map(mem => ({
                label: `${mem.name}  HP ${mem.hp}/${mem.maxHp}  MP ${mem.mp}/${mem.maxMp}`,
                act: () => { useFieldItem(ctx.itemId, mem); popPage(); }
            }));
            opts.push({ label: 'もどる', act: popPage });
            return opts;
        }

        case 'kamuiMember': {
            const opts = gameState.party.map(mem => ({
                label: `${mem.name}（${mem.god}）`,
                act: () => pushPage('kamuiList', { member: mem })
            }));
            opts.push({ label: 'もどる', act: popPage });
            return opts;
        }
        case 'kamuiList': {
            const opts = ctx.member.learned.map(id => ({
                label: `${skills[id].name}  MP${skills[id].mpCost || 0}`,
                desc: skills[id].desc || '',
                act: () => {}
            }));
            opts.push({ label: 'もどる', act: popPage });
            return opts;
        }

        case 'equipMember': {
            const opts = gameState.party.map(mem => ({
                label: `${mem.name}  装備: ${mem.equipped.weapon ? items[mem.equipped.weapon].name : 'なし'}`,
                act: () => pushPage('equip', { member: mem })
            }));
            opts.push({ label: 'もどる', act: popPage });
            return opts;
        }
        case 'equip': {
            const owned = ownedWeaponsFor(ctx.member);
            const opts = owned.map(wid => ({
                label: `${items[wid].name}${ctx.member.equipped.weapon === wid ? '（装備中）' : ''}`,
                desc: items[wid].desc || '',
                act: () => { equipWeapon(ctx.member, wid); m.message = `${items[wid].name}を装備`; }
            }));
            opts.push({ label: 'もどる', act: popPage });
            return opts;
        }

        case 'statusMember': {
            const opts = gameState.party.map(mem => ({
                label: `${mem.name}（Lv.${mem.level}）`,
                act: () => pushPage('status', { member: mem })
            }));
            opts.push({ label: 'もどる', act: popPage });
            return opts;
        }
        case 'status':
            return [{ label: 'もどる', act: popPage }];

        case 'shop': {
            const shop = shops[ctx.shopId];
            const opts = shop.stock.map(id => ({
                label: `${items[id].name}  ${items[id].price}G`,
                desc: items[id].desc || '',
                act: () => buyItem(id)
            }));
            opts.push({ label: '― 道具を売る ―', act: () => pushPage('shopSell', ctx) });
            opts.push({ label: 'やめる', act: closeMenu });
            return opts;
        }
        case 'shopSell': {
            const sellable = gameState.inventory.filter(s => items[s.id].type !== 'keyitem' && items[s.id].price > 0);
            const opts = sellable.map(slot => ({
                label: `${items[slot.id].name} x${slot.qty}  ${Math.floor(items[slot.id].price / 2)}G`,
                act: () => sellItem(slot)
            }));
            opts.push({ label: 'もどる', act: popPage });
            return opts;
        }

        case 'inn': {
            const shop = shops[ctx.shopId];
            return [
                { label: `泊まる（${shop.cost}G）`, act: () => innRest(shop.cost) },
                { label: 'やめる', act: closeMenu }
            ];
        }
    }
    return [];
}

// ── アイテム操作 ───────────────────────────────────────────
function selectItem(slot) {
    const it = items[slot.id];
    if (it.type === 'recovery') pushPage('itemTarget', { itemId: slot.id });
    else if (it.type === 'booster') applyBooster(slot.id);
    else gameState.menu.message = it.desc || it.name;
}
function useFieldItem(itemId, member) {
    const ef = items[itemId].effect || {};
    if (ef.hp) member.hp = clamp(member.hp + ef.hp, 0, member.maxHp);
    if (ef.mp) member.mp = clamp(member.mp + ef.mp, 0, member.maxMp);
    removeItem(itemId, 1);
    syncLeaderMirror();
}
function applyBooster(id) {
    const b = items[id].boost;
    const mem = gameState.party.find(p => p.god === b.god);
    if (!mem) { gameState.menu.message = '対象の依人がいない'; return; }
    if (b.maxHp) { mem.maxHp += b.maxHp; mem.hp += b.maxHp; }
    if (b.maxMp) { mem.maxMp += b.maxMp; mem.mp += b.maxMp; }
    if (b.atk) mem.atk += b.atk;
    if (b.mag) mem.mag += b.mag;
    removeItem(id, 1);
    syncLeaderMirror();
    gameState.menu.message = `${items[id].name}を使った`;
}

// ── そうび ─────────────────────────────────────────────────
function ownedWeaponsFor(member) {
    const list = [];
    if (member.equipped.weapon) list.push(member.equipped.weapon);
    for (const s of gameState.inventory) {
        const it = items[s.id];
        if (it.type === 'weapon' && it.ownerId === member.id && s.id !== member.equipped.weapon) {
            list.push(s.id);
        }
    }
    return list;
}
function equipWeapon(member, weaponId) {
    if (member.equipped.weapon === weaponId) return;
    const old = member.equipped.weapon;
    removeItem(weaponId, 1);
    if (old) addItem(old, 1);
    member.equipped.weapon = weaponId;
    syncLeaderMirror();
}

// ── 店／宿 ─────────────────────────────────────────────────
function buyItem(id) {
    const price = items[id].price;
    if (gameState.gold < price) { gameState.menu.message = 'お金が足りない…'; return; }
    gameState.gold -= price;
    addItem(id, 1);
    gameState.menu.message = `${items[id].name}を購入した`;
}
function sellItem(slot) {
    const price = Math.floor(items[slot.id].price / 2);
    gameState.gold += price;
    const name = items[slot.id].name;
    removeItem(slot.id, 1);
    gameState.menu.message = `${name}を${price}Gで売却`;
    gameState.menu.cursor = clamp(gameState.menu.cursor, 0, Math.max(0, menuOptions().length - 1));
}
function innRest(cost) {
    if (gameState.gold < cost) { gameState.menu.message = 'お金が足りない…'; return; }
    gameState.gold -= cost;
    closeMenu();
    startTransition({
        under: 'world',
        onBlack: () => {
            gameState.party.forEach(mem => { mem.hp = mem.maxHp; mem.mp = mem.maxMp; });
            syncLeaderMirror();
        },
        returnScene: 'map'
    });
}

// ── 更新・入力 ─────────────────────────────────────────────
function updateMenu() { /* no-op: 入力駆動 */ }

function menuKey(e) {
    const m = gameState.menu;
    const k = e.key;
    if (k === 'x' || k === 'X') { if (m.page === 'root') closeMenu(); else popPage(); return; }
    const opts = menuOptions();
    if (opts.length === 0) { if (k === ' ' || k === 'Enter') popPage(); return; }
    if (k === 'ArrowUp') m.cursor = (m.cursor + opts.length - 1) % opts.length;
    else if (k === 'ArrowDown') m.cursor = (m.cursor + 1) % opts.length;
    else if (k === ' ' || k === 'Enter') {
        const o = opts[m.cursor];
        if (o && o.act) o.act();
        m.cursor = clamp(m.cursor, 0, Math.max(0, menuOptions().length - 1));
    }
}
