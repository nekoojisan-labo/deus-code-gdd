// デウス・コード 八百万の神託 - RPGゲーム
// マップナビゲーション修正版

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ゲーム定数
const TILE_SIZE = 48;
const GRID_WIDTH = 19;
const GRID_HEIGHT = 13;
const STATUS_BAR_HEIGHT = 130;
const PLAYABLE_HEIGHT = canvas.height - STATUS_BAR_HEIGHT;

// ゲーム状態
const gameState = {
    player: {
        x: 9,
        y: 6,
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        level: 1,
        exp: 0,
        gold: 0
    },
    currentMap: 'shinjuku_central',
    showDialog: false,
    dialogText: '',
    dialogNpc: null,
    keys: {},
    lastMoveTime: 0,
    moveDelay: 150
};

// マップデータ
const maps = {
    shinjuku_central: {
        name: '新宿 - 中央区画',
        walkCount: 176,
        encounterRate: 45,
        bgColor: '#2a2a4a',
        npcs: [
            { x: 3, y: 3, name: '武器商人リョウ', color: '#90EE90', dialog: '良い武器が入ったぜ！見ていくかい？' },
            { x: 6, y: 3, name: '防具商人サクラ', color: '#FFB6C1', dialog: '防具なら私に任せて！' },
            { x: 9, y: 3, name: 'アイテム商人ユウキ', color: '#87CEEB', dialog: 'アイテムの補充はいかが？' },
            { x: 12, y: 3, name: '魔法商人ミコト', color: '#DDA0DD', dialog: '魔法の書を揃えているわ' },
            { x: 3, y: 6, name: '宿屋の主人', color: '#FFA07A', dialog: '疲れただろう？ゆっくり休んでいきな' },
            { x: 6, y: 6, name: '新宿へ長官', color: '#F0E68C', dialog: 'ようこそ新宿中央区画へ' },
            { x: 12, y: 6, name: 'ギルドマスター', color: '#98FB98', dialog: 'クエストを受けていくかい？' }
        ],
        obstacles: [
            { x: 4, y: 2, width: 3, height: 2, name: '街の住居' }
        ],
        portals: [
            {
                x: 0, y: 5, width: 2, height: 3,
                direction: 'left',
                target: 'residential_area',
                targetDir: 'right',
                label: '南へ'
            },
            {
                x: 17, y: 5, width: 2, height: 3,
                direction: 'right',
                target: 'shibuya_shopping',
                targetDir: 'left',
                label: '住宅'
            }
        ]
    },

    residential_area: {
        name: '住宅街 - 静かな路地',
        walkCount: 120,
        encounterRate: 20,
        bgColor: '#3a3a5a',
        npcs: [
            { x: 6, y: 4, name: '老人', color: '#D3D3D3', dialog: '最近は物騒でのう...' },
            { x: 10, y: 5, name: '子供', color: '#FFD700', dialog: 'ぼく、依人になりたいな！' }
        ],
        obstacles: [
            { x: 3, y: 3, width: 2, height: 2, name: '民家' },
            { x: 13, y: 3, width: 2, height: 2, name: '民家' }
        ],
        portals: [
            {
                x: 17, y: 5, width: 2, height: 3,
                direction: 'right',
                target: 'shinjuku_central',
                targetDir: 'left',
                label: '中央区画へ'
            }
        ]
    },

    shibuya_shopping: {
        name: '渋谷商業街 - ショッピングモール',
        walkCount: 270,
        encounterRate: 0,
        bgColor: '#4a3a5a',
        npcs: [
            { x: 9, y: 7, name: '腐敗を失った市民', color: '#B0C4DE', dialog: '...買い物...効率的...アーク様...' },
            { x: 10, y: 3, name: 'アカリ', color: '#FFD700', dialog: 'この街の人たち、何かおかしいわ...' }
        ],
        obstacles: [],
        portals: [
            {
                x: 0, y: 5, width: 2, height: 3,
                direction: 'left',
                target: 'shinjuku_central',
                targetDir: 'right',
                label: '新宿へ'
            },
            {
                x: 7, y: 9, width: 5, height: 2,
                direction: 'bottom',
                target: 'shibuya_street',
                targetDir: 'top',
                label: '商業街へ'
            },
            {
                x: 17, y: 5, width: 2, height: 3,
                direction: 'right',
                target: 'city_hall',
                targetDir: 'left',
                label: '都庁へ'
            }
        ]
    },

    shibuya_street: {
        name: '渋谷商業街 - 表通り',
        walkCount: 200,
        encounterRate: 15,
        bgColor: '#3a4a5a',
        npcs: [
            { x: 5, y: 5, name: '商人', color: '#FFA500', dialog: 'いらっしゃい！何か探してる？' },
            { x: 13, y: 5, name: '巡回ドローン', color: '#FF6347', dialog: '...監視中...異常なし...' }
        ],
        obstacles: [
            { x: 3, y: 3, width: 2, height: 2, name: '店舗' },
            { x: 14, y: 3, width: 2, height: 2, name: '店舗' }
        ],
        portals: [
            {
                x: 7, y: 0, width: 5, height: 2,
                direction: 'top',
                target: 'shibuya_shopping',
                targetDir: 'bottom',
                label: 'モールへ'
            },
            {
                x: 7, y: 11, width: 5, height: 2,
                direction: 'bottom',
                target: 'underground_market',
                targetDir: 'top',
                label: '闇市へ'
            }
        ]
    },

    city_hall: {
        name: '都庁 - 管理センター',
        walkCount: 150,
        encounterRate: 30,
        bgColor: '#2a3a4a',
        npcs: [
            { x: 9, y: 6, name: 'AI管理官', color: '#00CED1', dialog: 'アークの意志に従え...' },
            { x: 6, y: 4, name: 'ヤミ', color: '#9370DB', dialog: 'ここがAIの中枢か...興味深いな' }
        ],
        obstacles: [
            { x: 8, y: 3, width: 3, height: 2, name: '制御装置' }
        ],
        portals: [
            {
                x: 0, y: 5, width: 2, height: 3,
                direction: 'left',
                target: 'shibuya_shopping',
                targetDir: 'right',
                label: 'モールへ'
            }
        ]
    },

    underground_market: {
        name: '地下闇市 - 反アーク拠点',
        walkCount: 300,
        encounterRate: 0,
        bgColor: '#1a1a2a',
        npcs: [
            { x: 5, y: 5, name: 'レジスタンス', color: '#FF4500', dialog: 'アークを倒す...それが俺たちの使命だ' },
            { x: 13, y: 5, name: '情報屋', color: '#DAA520', dialog: '何か知りたいことは？' },
            { x: 9, y: 7, name: 'リク', color: '#32CD32', dialog: '外の世界...本当の自然を見てみたい' }
        ],
        obstacles: [
            { x: 3, y: 3, width: 2, height: 2, name: '武器庫' },
            { x: 14, y: 3, width: 2, height: 2, name: '物資' }
        ],
        portals: [
            {
                x: 7, y: 0, width: 5, height: 2,
                direction: 'top',
                target: 'shibuya_street',
                targetDir: 'bottom',
                label: '表通りへ'
            }
        ]
    }
};

// プレイヤーの位置をポータルの方向に基づいて設定
function setPlayerPositionFromPortal(targetDir) {
    const map = maps[gameState.currentMap];

    switch(targetDir) {
        case 'left':
            gameState.player.x = 2;
            gameState.player.y = 6;
            break;
        case 'right':
            gameState.player.x = GRID_WIDTH - 3;
            gameState.player.y = 6;
            break;
        case 'top':
            gameState.player.x = 9;
            gameState.player.y = 2;
            break;
        case 'bottom':
            gameState.player.x = 9;
            gameState.player.y = 9;
            break;
        default:
            gameState.player.x = 9;
            gameState.player.y = 6;
    }
}

// 衝突判定
function canMove(x, y) {
    const map = maps[gameState.currentMap];

    // マップ境界チェック
    if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) {
        return false;
    }

    // ステータスバーとの干渉チェック（Y座標が下部に行きすぎないように）
    const pixelY = y * TILE_SIZE;
    if (pixelY > PLAYABLE_HEIGHT - TILE_SIZE * 2) {
        return false;
    }

    // NPCとの衝突チェック
    for (let npc of map.npcs) {
        if (npc.x === x && npc.y === y) {
            return false;
        }
    }

    // 障害物との衝突チェック
    for (let obs of map.obstacles) {
        if (x >= obs.x && x < obs.x + obs.width &&
            y >= obs.y && y < obs.y + obs.height) {
            return false;
        }
    }

    return true;
}

// ポータルチェック
function checkPortal() {
    const map = maps[gameState.currentMap];
    const px = gameState.player.x;
    const py = gameState.player.y;

    for (let portal of map.portals) {
        if (px >= portal.x && px < portal.x + portal.width &&
            py >= portal.y && py < portal.y + portal.height) {
            // マップ移動
            gameState.currentMap = portal.target;
            setPlayerPositionFromPortal(portal.targetDir);
            return true;
        }
    }
    return false;
}

// NPCとの会話チェック
function checkNpcInteraction() {
    const map = maps[gameState.currentMap];
    const px = gameState.player.x;
    const py = gameState.player.y;

    // 隣接するNPCをチェック
    for (let npc of map.npcs) {
        const dx = Math.abs(npc.x - px);
        const dy = Math.abs(npc.y - py);

        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
            return npc;
        }
    }
    return null;
}

// プレイヤー移動
function movePlayer(dx, dy) {
    const now = Date.now();
    if (now - gameState.lastMoveTime < gameState.moveDelay) {
        return;
    }

    if (gameState.showDialog) {
        return;
    }

    const newX = gameState.player.x + dx;
    const newY = gameState.player.y + dy;

    if (canMove(newX, newY)) {
        gameState.player.x = newX;
        gameState.player.y = newY;
        gameState.lastMoveTime = now;

        // ポータルチェック
        checkPortal();
    }
}

// アクション（会話）
function doAction() {
    if (gameState.showDialog) {
        // ダイアログを閉じる
        gameState.showDialog = false;
        gameState.dialogText = '';
        gameState.dialogNpc = null;
    } else {
        // NPCとの会話を開始
        const npc = checkNpcInteraction();
        if (npc) {
            gameState.showDialog = true;
            gameState.dialogText = npc.dialog;
            gameState.dialogNpc = npc;
        }
    }
}

// セーブ機能（プレースホルダー）
function saveGame() {
    console.log('ゲームをセーブしました');
}

// 描画関数
function drawGame() {
    const map = maps[gameState.currentMap];

    // 背景
    ctx.fillStyle = map.bgColor;
    ctx.fillRect(0, 0, canvas.width, PLAYABLE_HEIGHT);

    // グリッド（デバッグ用、オプション）
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= GRID_WIDTH; x++) {
        ctx.beginPath();
        ctx.moveTo(x * TILE_SIZE, 0);
        ctx.lineTo(x * TILE_SIZE, PLAYABLE_HEIGHT);
        ctx.stroke();
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * TILE_SIZE);
        ctx.lineTo(canvas.width, y * TILE_SIZE);
        ctx.stroke();
    }

    // 障害物
    ctx.fillStyle = '#555';
    for (let obs of map.obstacles) {
        ctx.fillRect(
            obs.x * TILE_SIZE,
            obs.y * TILE_SIZE,
            obs.width * TILE_SIZE,
            obs.height * TILE_SIZE
        );
        ctx.fillStyle = '#fff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(obs.name, (obs.x + obs.width/2) * TILE_SIZE, (obs.y + obs.height/2) * TILE_SIZE);
        ctx.fillStyle = '#555';
    }

    // ポータル
    for (let portal of map.portals) {
        // ポータルエリアの背景
        ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
        ctx.fillRect(
            portal.x * TILE_SIZE,
            portal.y * TILE_SIZE,
            portal.width * TILE_SIZE,
            portal.height * TILE_SIZE
        );

        // ポータルラベル
        ctx.fillStyle = '#0ff';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(
            portal.label,
            (portal.x + portal.width/2) * TILE_SIZE,
            (portal.y + portal.height/2) * TILE_SIZE
        );

        // 方向矢印
        const centerX = (portal.x + portal.width/2) * TILE_SIZE;
        const centerY = (portal.y + portal.height/2) * TILE_SIZE;
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 3;

        switch(portal.direction) {
            case 'left':
                ctx.beginPath();
                ctx.moveTo(centerX + 20, centerY);
                ctx.lineTo(centerX - 20, centerY);
                ctx.lineTo(centerX - 10, centerY - 10);
                ctx.moveTo(centerX - 20, centerY);
                ctx.lineTo(centerX - 10, centerY + 10);
                ctx.stroke();
                break;
            case 'right':
                ctx.beginPath();
                ctx.moveTo(centerX - 20, centerY);
                ctx.lineTo(centerX + 20, centerY);
                ctx.lineTo(centerX + 10, centerY - 10);
                ctx.moveTo(centerX + 20, centerY);
                ctx.lineTo(centerX + 10, centerY + 10);
                ctx.stroke();
                break;
            case 'top':
                ctx.beginPath();
                ctx.moveTo(centerX, centerY + 20);
                ctx.lineTo(centerX, centerY - 20);
                ctx.lineTo(centerX - 10, centerY - 10);
                ctx.moveTo(centerX, centerY - 20);
                ctx.lineTo(centerX + 10, centerY - 10);
                ctx.stroke();
                break;
            case 'bottom':
                ctx.beginPath();
                ctx.moveTo(centerX, centerY - 20);
                ctx.lineTo(centerX, centerY + 20);
                ctx.lineTo(centerX - 10, centerY + 10);
                ctx.moveTo(centerX, centerY + 20);
                ctx.lineTo(centerX + 10, centerY + 10);
                ctx.stroke();
                break;
        }
    }

    // NPC
    for (let npc of map.npcs) {
        // NPC本体
        ctx.fillStyle = npc.color;
        ctx.beginPath();
        ctx.arc(
            npc.x * TILE_SIZE + TILE_SIZE/2,
            npc.y * TILE_SIZE + TILE_SIZE/2,
            TILE_SIZE/3,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // NPCの頭上にアイコン
        ctx.fillStyle = '#FFD700';
        ctx.font = '20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('💬', npc.x * TILE_SIZE + TILE_SIZE/2, npc.y * TILE_SIZE - 5);

        // NPC名
        ctx.fillStyle = '#fff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(npc.name, npc.x * TILE_SIZE + TILE_SIZE/2, npc.y * TILE_SIZE + TILE_SIZE + 10);
    }

    // プレイヤー
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(
        gameState.player.x * TILE_SIZE + TILE_SIZE/2,
        gameState.player.y * TILE_SIZE + TILE_SIZE/2,
        TILE_SIZE/2.5,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // プレイヤーラベル
    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('カイト', gameState.player.x * TILE_SIZE + TILE_SIZE/2, gameState.player.y * TILE_SIZE + TILE_SIZE + 12);

    // マップ名と座標表示
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(5, 5, 250, 70);
    ctx.strokeStyle = '#0ff';
    ctx.strokeRect(5, 5, 250, 70);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(map.name, 15, 25);
    ctx.font = '12px monospace';
    ctx.fillText(`歩数: ${map.walkCount}`, 15, 45);
    ctx.fillText(`遭遇率: ${map.encounterRate}`, 15, 65);

    // 操作方法表示
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(canvas.width - 255, 5, 250, 135);
    ctx.strokeStyle = '#0ff';
    ctx.strokeRect(canvas.width - 255, 5, 250, 135);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('操作方法:', canvas.width - 245, 25);
    ctx.font = '12px monospace';
    ctx.fillText('↑←↓→: 移動', canvas.width - 245, 45);
    ctx.fillText('SPACE: アクション', canvas.width - 245, 65);
    ctx.fillText('Z: 神威発動', canvas.width - 245, 85);
    ctx.fillText('X: メニュー', canvas.width - 245, 105);
    ctx.fillText('S: セーブ（セーブポイント）', canvas.width - 245, 125);

    // ステータスバー
    ctx.fillStyle = '#000';
    ctx.fillRect(0, PLAYABLE_HEIGHT, canvas.width, STATUS_BAR_HEIGHT);
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, PLAYABLE_HEIGHT, canvas.width, STATUS_BAR_HEIGHT);

    // HP
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('HP: ' + gameState.player.hp + '/' + gameState.player.maxHp, 20, PLAYABLE_HEIGHT + 25);

    // HPバー
    const hpBarWidth = 150;
    const hpPercent = gameState.player.hp / gameState.player.maxHp;
    ctx.fillStyle = '#333';
    ctx.fillRect(20, PLAYABLE_HEIGHT + 35, hpBarWidth, 20);
    ctx.fillStyle = hpPercent > 0.5 ? '#f00' : hpPercent > 0.25 ? '#ff0' : '#f00';
    ctx.fillRect(20, PLAYABLE_HEIGHT + 35, hpBarWidth * hpPercent, 20);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(20, PLAYABLE_HEIGHT + 35, hpBarWidth, 20);

    // MP
    ctx.fillStyle = '#fff';
    ctx.fillText('MP: ' + gameState.player.mp + '/' + gameState.player.maxMp, 200, PLAYABLE_HEIGHT + 25);

    // MPバー
    const mpBarWidth = 150;
    const mpPercent = gameState.player.mp / gameState.player.maxMp;
    ctx.fillStyle = '#333';
    ctx.fillRect(200, PLAYABLE_HEIGHT + 35, mpBarWidth, 20);
    ctx.fillStyle = '#00f';
    ctx.fillRect(200, PLAYABLE_HEIGHT + 35, mpBarWidth * mpPercent, 20);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(200, PLAYABLE_HEIGHT + 35, mpBarWidth, 20);

    // レベル、経験値、ゴールド
    ctx.fillStyle = '#fff';
    ctx.fillText('レベル: ' + gameState.player.level, 380, PLAYABLE_HEIGHT + 25);
    ctx.fillText('経験値: ' + gameState.player.exp, 380, PLAYABLE_HEIGHT + 45);
    ctx.fillText('ゴールド: ' + gameState.player.gold, 380, PLAYABLE_HEIGHT + 65);

    // 会話ダイアログ
    if (gameState.showDialog) {
        // 半透明の背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(50, PLAYABLE_HEIGHT - 150, canvas.width - 100, 120);
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 3;
        ctx.strokeRect(50, PLAYABLE_HEIGHT - 150, canvas.width - 100, 120);

        // NPCアイコン
        if (gameState.dialogNpc) {
            ctx.fillStyle = gameState.dialogNpc.color;
            ctx.beginPath();
            ctx.arc(80, PLAYABLE_HEIGHT - 100, 25, 0, Math.PI * 2);
            ctx.fill();
        }

        // テキスト
        ctx.fillStyle = '#fff';
        ctx.font = '16px monospace';
        ctx.textAlign = 'left';

        // テキストを折り返し
        const maxWidth = canvas.width - 200;
        const words = gameState.dialogText.split('');
        let line = '';
        let y = PLAYABLE_HEIGHT - 125;

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i];
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && i > 0) {
                ctx.fillText(line, 120, y);
                line = words[i];
                y += 25;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, 120, y);

        // 続きのインジケーター
        ctx.fillStyle = '#0ff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'right';
        ctx.fillText('▼ SPACE', canvas.width - 70, PLAYABLE_HEIGHT - 40);
    }
}

// キーボード入力
document.addEventListener('keydown', (e) => {
    gameState.keys[e.key] = true;

    if (e.key === 'ArrowUp') {
        movePlayer(0, -1);
        e.preventDefault();
    } else if (e.key === 'ArrowDown') {
        movePlayer(0, 1);
        e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
        movePlayer(-1, 0);
        e.preventDefault();
    } else if (e.key === 'ArrowRight') {
        movePlayer(1, 0);
        e.preventDefault();
    } else if (e.key === ' ') {
        doAction();
        e.preventDefault();
    } else if (e.key === 's' || e.key === 'S') {
        saveGame();
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    gameState.keys[e.key] = false;
});

// ゲームループ
function gameLoop() {
    drawGame();
    requestAnimationFrame(gameLoop);
}

// ゲーム開始
function startGame() {
    document.getElementById('loading').classList.add('hidden');
    gameLoop();
}

// 初期化
window.addEventListener('load', () => {
    setTimeout(startGame, 100);
});
