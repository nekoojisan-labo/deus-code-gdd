// ========================================================================
// state.js — gameState（拡張） / newGame() / ステータス同期
// ========================================================================
// data/* と util.js の後に読み込む（characterTemplates, chapters, deepClone 依存）。

let animationTime = 0;
let gameState = null;

// 新規ゲームの初期状態を構築して gameState に設定
function newGame() {
    gameState = {
        // 盤上アバター（リーダーの座標）。hp/mp/level/exp は party[0] のミラー
        player: { x: 12, y: 6, hp: 100, maxHp: 100, mp: 50, maxMp: 50, level: 1, exp: 0 },

        currentMap: 'shinjuku_central',
        showDialog: false, dialogText: '', dialogNpc: null,
        keys: {}, lastMoveTime: 0, moveDelay: 150,

        // シーン状態機械
        scene: 'map',                 // 起動時は bootstrap が 'title' へ上書き

        // 汎用カットシーン
        cutscene: { panels: [], index: 0, onComplete: null, lastInputTime: 0, charReveal: 0, panelStart: 0 },

        // トランジション（オープニング→マップの暗転。既存仕様を踏襲）
        transitionAlpha: 0, transitionDirection: 'in', introDialogShown: false,
        transitionOnDone: null,

        // パーティ／所持品／所持金
        party: [deepClone(characterTemplates.kaito)],
        inventory: [{ id: 'onigiri', qty: 3 }, { id: 'energy_drink', qty: 2 }],
        gold: 100,

        // ストーリー進行
        story: {
            chapter: 1,
            flags: { kaito_joined: true },
            objective: deepClone(chapters[0].objective)
        },

        // イベントキュー（章イベントの逐次実行）
        eventQueue: [], eventOnDone: null, eventRunning: false,

        // バトル／メニュー
        battle: null,
        menu: { open: false, page: 'root', cursor: 0, stack: [], context: null, message: '' },

        // タイトル
        title: { cursor: 0 },

        // 戻り先シーン（バトル／メニューを閉じた後）
        pendingReturnScene: 'map'
    };
    syncLeaderMirror();
    return gameState;
}

// party[0]（リーダー＝カイト）の生ステータスを gameState.player ミラーへ同期。
// HUD(renderWorld) は player.* を参照するため、戦闘/アイテム/レベルアップ後に呼ぶ。
function syncLeaderMirror() {
    if (!gameState || !gameState.party[0]) return;
    const m = gameState.party[0];
    const p = gameState.player;
    p.hp = m.hp; p.maxHp = m.maxHp;
    p.mp = m.mp; p.maxMp = m.maxMp;
    p.level = m.level; p.exp = m.exp;
}

// 現在パーティ（inParty な戦闘メンバー）
function activeParty() {
    return gameState.party.filter(m => m.inParty);
}

// フラグ判定ヘルパー
function hasFlag(name) {
    return !!(gameState && gameState.story.flags[name]);
}
function setFlag(name, value = true) {
    gameState.story.flags[name] = value;
}

// 所持品操作
function addItem(id, qty = 1) {
    if (!items[id]) return;
    const slot = gameState.inventory.find(s => s.id === id);
    if (slot) slot.qty += qty;
    else gameState.inventory.push({ id, qty });
}
function removeItem(id, qty = 1) {
    const slot = gameState.inventory.find(s => s.id === id);
    if (!slot) return false;
    slot.qty -= qty;
    if (slot.qty <= 0) {
        gameState.inventory = gameState.inventory.filter(s => s !== slot);
    }
    return true;
}
function hasItem(id) {
    return gameState.inventory.some(s => s.id === id && s.qty > 0);
}
