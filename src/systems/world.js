// ========================================================================
// systems/world.js — マップ移動・衝突・ポータル・会話・エンカウント
// ========================================================================

// 現在マップの「有効な」NPC（hideWhenFlag が立っていれば非表示・無効）
function activeNpcs(map) {
    return map.npcs.filter(n => !(n.hideWhenFlag && hasFlag(n.hideWhenFlag)));
}

// ポータルの targetDir に基づき入場位置を設定
function setPlayerPositionFromPortal(targetDir) {
    const p = gameState.player;
    switch (targetDir) {
        case 'left':   p.x = 2;               p.y = 6; break;
        case 'right':  p.x = GRID_WIDTH - 3;  p.y = 6; break;
        case 'top':    p.x = 12;              p.y = 2; break;
        case 'bottom': p.x = 12;              p.y = GRID_HEIGHT - 3; break;
        default:       p.x = 12;              p.y = 6;
    }
}

// 衝突判定
function canMove(x, y) {
    const map = maps[gameState.currentMap];
    if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return false;
    for (const npc of activeNpcs(map)) {
        if (npc.x === x && npc.y === y) return false;
    }
    for (const obs of map.obstacles) {
        if (x >= obs.x && x < obs.x + obs.width && y >= obs.y && y < obs.y + obs.height) return false;
    }
    return true;
}

// ポータル判定（マップ移動）。移動したら true。
// requireItem 指定があり未所持ならソフトゲート（移動せず助言を表示）。
function checkPortal() {
    const map = maps[gameState.currentMap];
    const px = gameState.player.x;
    const py = gameState.player.y;

    for (const portal of map.portals) {
        if (px >= portal.x && px < portal.x + portal.width &&
            py >= portal.y && py < portal.y + portal.height) {

            if (portal.requireItem && !hasItem(portal.requireItem)) {
                const itemName = items[portal.requireItem] ? items[portal.requireItem].name : portal.requireItem;
                gameState.showDialog = true;
                gameState.dialogText = `（${itemName}が必要だ。先に手に入れなければ、この先へは進めない。）`;
                gameState.dialogNpc = { name: 'カイト（独白）', color: '#00ff66' };
                return false;
            }

            gameState.currentMap = portal.target;
            setPlayerPositionFromPortal(portal.targetDir);
            onMapEnter(portal.target);   // 入場トリガー
            return true;
        }
    }
    return false;
}

// 隣接NPCを返す
function checkNpcInteraction() {
    const map = maps[gameState.currentMap];
    const px = gameState.player.x;
    const py = gameState.player.y;
    for (const npc of activeNpcs(map)) {
        const dx = Math.abs(npc.x - px);
        const dy = Math.abs(npc.y - py);
        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) return npc;
    }
    return null;
}

// プレイヤー移動（成功時にエンカウント判定）
function movePlayer(dx, dy) {
    const now = Date.now();
    if (now - gameState.lastMoveTime < gameState.moveDelay) return;
    if (gameState.showDialog) return;
    if (gameState.scene !== 'map') return;

    const nx = gameState.player.x + dx;
    const ny = gameState.player.y + dy;
    if (!canMove(nx, ny)) return;

    gameState.player.x = nx;
    gameState.player.y = ny;
    gameState.lastMoveTime = now;

    const warped = checkPortal();
    if (!warped) rollEncounter();
}

// ランダムエンカウント判定（第1章は乱戦なし）
function rollEncounter() {
    if (gameState.scene !== 'map') return;       // ポータル/会話発火後に抑制
    const map = maps[gameState.currentMap];
    const chapter = gameState.story.chapter;
    if (chapter <= 1) return;
    if (!map.encounterRate || map.encounterRate <= 0) return;
    const table = encounterTables[chapter];
    if (!table || table.length === 0) return;

    if (rng(100) < map.encounterRate / ENCOUNTER_DIVISOR) {
        const group = rollEncounterGroup(table);
        if (group.length) {
            gameState.pendingReturnScene = 'map';
            startBattle(group, null);
        }
    }
}

// エンカウント表から1〜3体を抽選
function rollEncounterGroup(table) {
    const count = rngRange(1, 3);
    const group = [];
    for (let i = 0; i < count; i++) {
        const pick = weightedPick(table);
        if (pick) group.push(pick.e);
    }
    return group;
}

// アクション（会話の開始／クローズ）
function doAction() {
    if (gameState.showDialog) {
        gameState.showDialog = false;
        gameState.dialogText = '';
        gameState.dialogNpc = null;
        return;
    }
    const npc = checkNpcInteraction();
    if (npc) interactNpc(npc);
}

// map シーンの毎フレーム更新（描画アニメは animationTime 任せ）
function updateWorld() { /* no-op: 入力駆動 */ }
