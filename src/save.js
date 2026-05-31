// ========================================================================
// save.js — localStorage によるセーブ／ロード
// ========================================================================
// file:// でも多くのブラウザで localStorage は使えるが、拒否される環境も
// あるため try/catch + メモリfallback で安全に劣化させる。

let _memorySave = null; // localStorage 不可時のフォールバック

// セーブ対象のスナップショット（transient な状態は除外）
function buildSnapshot() {
    return {
        v: 1,
        party: gameState.party,
        inventory: gameState.inventory,
        gold: gameState.gold,
        story: gameState.story,
        currentMap: gameState.currentMap,
        player: { x: gameState.player.x, y: gameState.player.y }
    };
}

function saveGame() {
    const snap = JSON.stringify(buildSnapshot());
    try {
        localStorage.setItem(SAVE_KEY, snap);
    } catch (e) {
        _memorySave = snap; // フォールバック
    }
    return true;
}

function hasSave() {
    try {
        if (localStorage.getItem(SAVE_KEY)) return true;
    } catch (e) { /* ignore */ }
    return !!_memorySave;
}

function readSaveRaw() {
    try {
        const s = localStorage.getItem(SAVE_KEY);
        if (s) return s;
    } catch (e) { /* ignore */ }
    return _memorySave;
}

// セーブを読み込み、gameState を復元して map シーンへ。成功時 true。
function loadGame() {
    const raw = readSaveRaw();
    if (!raw) return false;
    let snap;
    try {
        snap = JSON.parse(raw);
    } catch (e) {
        return false;
    }
    if (!snap || snap.v !== 1) return false;

    newGame(); // ベースを初期化してから上書き（欠損フィールドを埋める）
    gameState.party = snap.party || gameState.party;
    gameState.inventory = snap.inventory || gameState.inventory;
    gameState.gold = (typeof snap.gold === 'number') ? snap.gold : gameState.gold;
    gameState.story = snap.story || gameState.story;
    gameState.currentMap = snap.currentMap || gameState.currentMap;
    if (snap.player) { gameState.player.x = snap.player.x; gameState.player.y = snap.player.y; }

    syncLeaderMirror();
    gameState.scene = 'map';
    gameState.showDialog = false;
    return true;
}
