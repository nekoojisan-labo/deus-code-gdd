// デウス・コード 八百万の神託 - RPGゲーム
// マップ表示改善版

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 動的サイズ計算
function calculateGameSize() {
    const padding = 40;
    const maxWidth = window.innerWidth - padding;
    const maxHeight = window.innerHeight - padding;

    // 16:10のアスペクト比を維持
    const aspectRatio = 16 / 10;

    let width = maxWidth;
    let height = width / aspectRatio;

    if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
    }

    // 最小サイズ
    width = Math.max(800, Math.floor(width));
    height = Math.max(500, Math.floor(height));

    return { width, height };
}

// キャンバスサイズを設定
function resizeCanvas() {
    const size = calculateGameSize();
    canvas.width = size.width;
    canvas.height = size.height;

    // 動的な定数を再計算
    updateGameConstants();
}

// ゲーム定数（動的に更新）
let TILE_SIZE, GRID_WIDTH, GRID_HEIGHT, STATUS_BAR_HEIGHT, PLAYABLE_HEIGHT;

function updateGameConstants() {
    // タイルサイズは画面サイズに応じて調整
    TILE_SIZE = Math.floor(canvas.width / 20);
    GRID_WIDTH = Math.floor(canvas.width / TILE_SIZE);
    STATUS_BAR_HEIGHT = Math.floor(canvas.height * 0.18);
    PLAYABLE_HEIGHT = canvas.height - STATUS_BAR_HEIGHT;
    GRID_HEIGHT = Math.floor(PLAYABLE_HEIGHT / TILE_SIZE);
}

// アニメーション用タイマー
let animationTime = 0;

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
        description: 'アークに管理された街の中心部',
        walkCount: 176,
        encounterRate: 45,
        bgColor: '#1a1a2e',
        accentColor: '#00ffff',
        npcs: [
            { x: 3, y: 3, name: '武器商人リョウ', color: '#90EE90', dialog: '良い武器が入ったぜ！見ていくかい？' },
            { x: 6, y: 3, name: '防具商人サクラ', color: '#FFB6C1', dialog: '防具なら私に任せて！' },
            { x: 9, y: 3, name: 'アイテム商人ユウキ', color: '#87CEEB', dialog: 'アイテムの補充はいかが？' },
            { x: 12, y: 3, name: '魔法商人ミコト', color: '#DDA0DD', dialog: '魔法の書を揃えているわ' },
            { x: 3, y: 6, name: '宿屋の主人', color: '#FFA07A', dialog: '疲れただろう？ゆっくり休んでいきな' },
            { x: 6, y: 6, name: '新宿区長', color: '#F0E68C', dialog: 'ようこそ新宿中央区画へ' },
            { x: 12, y: 6, name: 'ギルドマスター', color: '#98FB98', dialog: 'クエストを受けていくかい？' }
        ],
        obstacles: [
            { x: 4, y: 2, width: 3, height: 2, name: '街の住居', color: '#3a3a5a' }
        ],
        portals: [
            {
                x: 0, y: 4, width: 1, height: 3,
                direction: 'left',
                target: 'residential_area',
                targetDir: 'right',
                label: '住宅街へ',
                icon: '🏘️'
            },
            {
                x: 18, y: 4, width: 1, height: 3,
                direction: 'right',
                target: 'shibuya_shopping',
                targetDir: 'left',
                label: '渋谷へ',
                icon: '🏬'
            }
        ]
    },

    residential_area: {
        name: '住宅街 - 静かな路地',
        description: '古い住宅が立ち並ぶ静かなエリア',
        walkCount: 120,
        encounterRate: 20,
        bgColor: '#1e2a1e',
        accentColor: '#88ff88',
        npcs: [
            { x: 6, y: 4, name: '老人', color: '#D3D3D3', dialog: '最近は物騒でのう...' },
            { x: 10, y: 5, name: '子供', color: '#FFD700', dialog: 'ぼく、依人になりたいな！' }
        ],
        obstacles: [
            { x: 3, y: 3, width: 2, height: 2, name: '民家', color: '#4a4a3a' },
            { x: 13, y: 3, width: 2, height: 2, name: '民家', color: '#4a4a3a' }
        ],
        portals: [
            {
                x: 18, y: 4, width: 1, height: 3,
                direction: 'right',
                target: 'shinjuku_central',
                targetDir: 'left',
                label: '中央区画へ',
                icon: '🏛️'
            }
        ]
    },

    shibuya_shopping: {
        name: '渋谷商業街 - ショッピングモール',
        description: 'ネオンが輝く大型商業施設',
        walkCount: 270,
        encounterRate: 0,
        bgColor: '#2a1a2e',
        accentColor: '#ff00ff',
        npcs: [
            { x: 9, y: 7, name: '感情を失った市民', color: '#B0C4DE', dialog: '...買い物...効率的...アーク様...' },
            { x: 10, y: 3, name: 'アカリ', color: '#FFD700', dialog: 'この街の人たち、何かおかしいわ...' }
        ],
        obstacles: [],
        portals: [
            {
                x: 0, y: 4, width: 1, height: 3,
                direction: 'left',
                target: 'shinjuku_central',
                targetDir: 'right',
                label: '新宿へ',
                icon: '🏛️'
            },
            {
                x: 8, y: 9, width: 3, height: 1,
                direction: 'bottom',
                target: 'shibuya_street',
                targetDir: 'top',
                label: '表通りへ',
                icon: '🛣️'
            },
            {
                x: 18, y: 4, width: 1, height: 3,
                direction: 'right',
                target: 'city_hall',
                targetDir: 'left',
                label: '都庁へ',
                icon: '🏢'
            }
        ]
    },

    shibuya_street: {
        name: '渋谷商業街 - 表通り',
        description: '賑やかな商店街のメインストリート',
        walkCount: 200,
        encounterRate: 15,
        bgColor: '#2a2a1e',
        accentColor: '#ffff00',
        npcs: [
            { x: 5, y: 5, name: '商人', color: '#FFA500', dialog: 'いらっしゃい！何か探してる？' },
            { x: 13, y: 5, name: '巡回ドローン', color: '#FF6347', dialog: '...監視中...異常なし...' }
        ],
        obstacles: [
            { x: 3, y: 3, width: 2, height: 2, name: '店舗', color: '#5a4a3a' },
            { x: 14, y: 3, width: 2, height: 2, name: '店舗', color: '#5a4a3a' }
        ],
        portals: [
            {
                x: 8, y: 0, width: 3, height: 1,
                direction: 'top',
                target: 'shibuya_shopping',
                targetDir: 'bottom',
                label: 'モールへ',
                icon: '🏬'
            },
            {
                x: 8, y: 9, width: 3, height: 1,
                direction: 'bottom',
                target: 'underground_market',
                targetDir: 'top',
                label: '闇市へ',
                icon: '🌑'
            }
        ]
    },

    city_hall: {
        name: '都庁 - 管理センター',
        description: 'アークの制御中枢がある場所',
        walkCount: 150,
        encounterRate: 30,
        bgColor: '#1a2a3a',
        accentColor: '#00ccff',
        npcs: [
            { x: 9, y: 6, name: 'AI管理官', color: '#00CED1', dialog: 'アークの意志に従え...' },
            { x: 6, y: 4, name: 'ヤミ', color: '#9370DB', dialog: 'ここがAIの中枢か...興味深いな' }
        ],
        obstacles: [
            { x: 8, y: 3, width: 3, height: 2, name: '制御装置', color: '#2a4a5a' }
        ],
        portals: [
            {
                x: 0, y: 4, width: 1, height: 3,
                direction: 'left',
                target: 'shibuya_shopping',
                targetDir: 'right',
                label: 'モールへ',
                icon: '🏬'
            }
        ]
    },

    underground_market: {
        name: '地下闇市 - 反アーク拠点',
        description: 'レジスタンスの秘密基地',
        walkCount: 300,
        encounterRate: 0,
        bgColor: '#0a0a1a',
        accentColor: '#ff4400',
        npcs: [
            { x: 5, y: 5, name: 'レジスタンス', color: '#FF4500', dialog: 'アークを倒す...それが俺たちの使命だ' },
            { x: 13, y: 5, name: '情報屋', color: '#DAA520', dialog: '何か知りたいことは？' },
            { x: 9, y: 7, name: 'リク', color: '#32CD32', dialog: '外の世界...本当の自然を見てみたい' }
        ],
        obstacles: [
            { x: 3, y: 3, width: 2, height: 2, name: '武器庫', color: '#4a2a2a' },
            { x: 14, y: 3, width: 2, height: 2, name: '物資', color: '#3a3a2a' }
        ],
        portals: [
            {
                x: 8, y: 0, width: 3, height: 1,
                direction: 'top',
                target: 'shibuya_street',
                targetDir: 'bottom',
                label: '表通りへ',
                icon: '🛣️'
            }
        ]
    }
};

// プレイヤーの位置をポータルの方向に基づいて設定
function setPlayerPositionFromPortal(targetDir) {
    switch(targetDir) {
        case 'left':
            gameState.player.x = 2;
            gameState.player.y = Math.floor(GRID_HEIGHT / 2);
            break;
        case 'right':
            gameState.player.x = GRID_WIDTH - 3;
            gameState.player.y = Math.floor(GRID_HEIGHT / 2);
            break;
        case 'top':
            gameState.player.x = Math.floor(GRID_WIDTH / 2);
            gameState.player.y = 2;
            break;
        case 'bottom':
            gameState.player.x = Math.floor(GRID_WIDTH / 2);
            gameState.player.y = GRID_HEIGHT - 3;
            break;
        default:
            gameState.player.x = Math.floor(GRID_WIDTH / 2);
            gameState.player.y = Math.floor(GRID_HEIGHT / 2);
    }
}

// 衝突判定
function canMove(x, y) {
    const map = maps[gameState.currentMap];

    if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) {
        return false;
    }

    for (let npc of map.npcs) {
        if (npc.x === x && npc.y === y) {
            return false;
        }
    }

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
        checkPortal();
    }
}

// アクション（会話）
function doAction() {
    if (gameState.showDialog) {
        gameState.showDialog = false;
        gameState.dialogText = '';
        gameState.dialogNpc = null;
    } else {
        const npc = checkNpcInteraction();
        if (npc) {
            gameState.showDialog = true;
            gameState.dialogText = npc.dialog;
            gameState.dialogNpc = npc;
        }
    }
}

// セーブ機能
function saveGame() {
    console.log('ゲームをセーブしました');
}

// 床タイルを描画
function drawFloorTiles() {
    const map = maps[gameState.currentMap];

    for (let x = 0; x < GRID_WIDTH; x++) {
        for (let y = 0; y < GRID_HEIGHT; y++) {
            const px = x * TILE_SIZE;
            const py = y * TILE_SIZE;

            // 基本の床色
            const isAlternate = (x + y) % 2 === 0;
            const baseColor = map.bgColor;

            // わずかに色を変えてタイル感を出す
            ctx.fillStyle = isAlternate ? baseColor : adjustBrightness(baseColor, 10);
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

            // タイルの縁
            ctx.strokeStyle = adjustBrightness(baseColor, 20);
            ctx.lineWidth = 1;
            ctx.strokeRect(px + 0.5, py + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
        }
    }
}

// 色の明るさを調整
function adjustBrightness(hexColor, amount) {
    const hex = hexColor.replace('#', '');
    const r = Math.min(255, Math.max(0, parseInt(hex.substring(0, 2), 16) + amount));
    const g = Math.min(255, Math.max(0, parseInt(hex.substring(2, 4), 16) + amount));
    const b = Math.min(255, Math.max(0, parseInt(hex.substring(4, 6), 16) + amount));
    return `rgb(${r}, ${g}, ${b})`;
}

// ポータルを描画（改善版）
function drawPortals() {
    const map = maps[gameState.currentMap];
    const glowIntensity = Math.sin(animationTime * 0.05) * 0.3 + 0.7;

    for (let portal of map.portals) {
        const px = portal.x * TILE_SIZE;
        const py = portal.y * TILE_SIZE;
        const pw = portal.width * TILE_SIZE;
        const ph = portal.height * TILE_SIZE;
        const centerX = px + pw / 2;
        const centerY = py + ph / 2;

        // グロー効果（外側）
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, Math.max(pw, ph)
        );
        gradient.addColorStop(0, `rgba(0, 255, 255, ${0.4 * glowIntensity})`);
        gradient.addColorStop(0.5, `rgba(0, 200, 255, ${0.2 * glowIntensity})`);
        gradient.addColorStop(1, 'rgba(0, 100, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(px - 20, py - 20, pw + 40, ph + 40);

        // ポータル本体（パルスするボーダー）
        ctx.fillStyle = `rgba(0, 50, 100, ${0.7 + glowIntensity * 0.3})`;
        ctx.fillRect(px, py, pw, ph);

        // アニメーションするボーダー
        ctx.strokeStyle = `rgba(0, 255, 255, ${glowIntensity})`;
        ctx.lineWidth = 3;
        ctx.strokeRect(px + 2, py + 2, pw - 4, ph - 4);

        // 内側のボーダー
        ctx.strokeStyle = `rgba(255, 255, 255, ${glowIntensity * 0.5})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 5, py + 5, pw - 10, ph - 10);

        // アイコン
        ctx.font = `${Math.min(TILE_SIZE * 0.8, 32)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(portal.icon || '🚪', centerX, centerY - 10);

        // ラベル
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${Math.max(12, TILE_SIZE * 0.3)}px sans-serif`;
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.fillText(portal.label, centerX, centerY + 15);
        ctx.shadowBlur = 0;

        // 方向を示す矢印（アニメーション）
        const arrowOffset = Math.sin(animationTime * 0.1) * 5;
        ctx.fillStyle = `rgba(0, 255, 255, ${glowIntensity})`;
        ctx.font = `${Math.min(TILE_SIZE * 0.5, 24)}px sans-serif`;

        switch(portal.direction) {
            case 'left':
                ctx.fillText('◀', px - 15 - arrowOffset, centerY);
                break;
            case 'right':
                ctx.fillText('▶', px + pw + 15 + arrowOffset, centerY);
                break;
            case 'top':
                ctx.fillText('▲', centerX, py - 15 - arrowOffset);
                break;
            case 'bottom':
                ctx.fillText('▼', centerX, py + ph + 15 + arrowOffset);
                break;
        }
    }
}

// 障害物を描画
function drawObstacles() {
    const map = maps[gameState.currentMap];

    for (let obs of map.obstacles) {
        const px = obs.x * TILE_SIZE;
        const py = obs.y * TILE_SIZE;
        const pw = obs.width * TILE_SIZE;
        const ph = obs.height * TILE_SIZE;

        // 建物本体
        ctx.fillStyle = obs.color || '#3a3a4a';
        ctx.fillRect(px, py, pw, ph);

        // 3D効果（上部）
        ctx.fillStyle = adjustBrightness(obs.color || '#3a3a4a', 30);
        ctx.fillRect(px, py, pw, 5);

        // 影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(px + 5, py + ph, pw, 5);

        // ボーダー
        ctx.strokeStyle = adjustBrightness(obs.color || '#3a3a4a', 40);
        ctx.lineWidth = 2;
        ctx.strokeRect(px, py, pw, ph);

        // ラベル
        ctx.fillStyle = '#fff';
        ctx.font = `${Math.max(10, TILE_SIZE * 0.25)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(obs.name, px + pw / 2, py + ph / 2);
    }
}

// NPCを描画
function drawNPCs() {
    const map = maps[gameState.currentMap];
    const bobOffset = Math.sin(animationTime * 0.08) * 2;

    for (let npc of map.npcs) {
        const px = npc.x * TILE_SIZE + TILE_SIZE / 2;
        const py = npc.y * TILE_SIZE + TILE_SIZE / 2 + bobOffset;
        const radius = TILE_SIZE / 3;

        // 影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(px, py + radius + 5, radius * 0.8, radius * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // NPC本体
        ctx.fillStyle = npc.color;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();

        // ハイライト
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(px - radius * 0.3, py - radius * 0.3, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // 会話アイコン
        ctx.font = `${Math.max(16, TILE_SIZE * 0.4)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('💬', px, py - radius - 10);

        // 名前
        ctx.fillStyle = '#fff';
        ctx.font = `${Math.max(10, TILE_SIZE * 0.22)}px sans-serif`;
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 3;
        ctx.fillText(npc.name, px, py + radius + 18);
        ctx.shadowBlur = 0;
    }
}

// プレイヤーを描画
function drawPlayer() {
    const px = gameState.player.x * TILE_SIZE + TILE_SIZE / 2;
    const py = gameState.player.y * TILE_SIZE + TILE_SIZE / 2;
    const radius = TILE_SIZE / 2.5;
    const pulseRadius = radius + Math.sin(animationTime * 0.1) * 3;

    // オーラ
    const auraGradient = ctx.createRadialGradient(px, py, radius, px, py, pulseRadius + 10);
    auraGradient.addColorStop(0, 'rgba(0, 255, 100, 0.5)');
    auraGradient.addColorStop(1, 'rgba(0, 255, 100, 0)');
    ctx.fillStyle = auraGradient;
    ctx.beginPath();
    ctx.arc(px, py, pulseRadius + 10, 0, Math.PI * 2);
    ctx.fill();

    // 影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(px, py + radius + 5, radius * 0.8, radius * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // プレイヤー本体
    ctx.fillStyle = '#00ff66';
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();

    // ハイライト
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(px - radius * 0.3, py - radius * 0.3, radius * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // ボーダー
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.stroke();

    // 名前
    ctx.fillStyle = '#0f0';
    ctx.font = `bold ${Math.max(12, TILE_SIZE * 0.28)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    ctx.fillText('カイト', px, py + radius + 18);
    ctx.shadowBlur = 0;
}

// マップ情報パネル
function drawMapInfo() {
    const map = maps[gameState.currentMap];
    const panelWidth = Math.min(280, canvas.width * 0.3);
    const panelHeight = 80;

    // パネル背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(10, 10, panelWidth, panelHeight);

    // ボーダー
    ctx.strokeStyle = map.accentColor || '#0ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, panelWidth, panelHeight);

    // マップ名
    ctx.fillStyle = map.accentColor || '#0ff';
    ctx.font = `bold ${Math.max(14, panelWidth * 0.055)}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(map.name, 20, 35);

    // 説明
    ctx.fillStyle = '#aaa';
    ctx.font = `${Math.max(11, panelWidth * 0.04)}px sans-serif`;
    ctx.fillText(map.description || '', 20, 55);

    // 情報
    ctx.fillStyle = '#fff';
    ctx.font = `${Math.max(11, panelWidth * 0.04)}px sans-serif`;
    ctx.fillText(`歩数: ${map.walkCount}  遭遇率: ${map.encounterRate}%`, 20, 75);
}

// 操作説明パネル
function drawControlsPanel() {
    const panelWidth = Math.min(220, canvas.width * 0.22);
    const panelHeight = 100;
    const panelX = canvas.width - panelWidth - 10;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(panelX, 10, panelWidth, panelHeight);

    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX, 10, panelWidth, panelHeight);

    ctx.fillStyle = '#0ff';
    ctx.font = `bold ${Math.max(12, panelWidth * 0.055)}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('操作方法', panelX + 10, 30);

    ctx.fillStyle = '#fff';
    ctx.font = `${Math.max(10, panelWidth * 0.045)}px sans-serif`;
    const controls = [
        '↑←↓→: 移動',
        'SPACE: アクション',
        'Z: 神威発動',
        'X: メニュー'
    ];
    controls.forEach((text, i) => {
        ctx.fillText(text, panelX + 10, 50 + i * 15);
    });
}

// ステータスバー
function drawStatusBar() {
    const barY = PLAYABLE_HEIGHT;
    const barHeight = STATUS_BAR_HEIGHT;

    // 背景
    ctx.fillStyle = '#000';
    ctx.fillRect(0, barY, canvas.width, barHeight);

    // 上部ボーダー
    const gradient = ctx.createLinearGradient(0, barY, canvas.width, barY);
    gradient.addColorStop(0, '#0ff');
    gradient.addColorStop(0.5, '#0088ff');
    gradient.addColorStop(1, '#0ff');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, barY);
    ctx.lineTo(canvas.width, barY);
    ctx.stroke();

    const fontSize = Math.max(12, barHeight * 0.12);
    const barWidth = Math.min(150, canvas.width * 0.15);
    const barHeightInner = Math.max(16, barHeight * 0.15);
    const startY = barY + 15;

    // HP
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(`HP: ${gameState.player.hp}/${gameState.player.maxHp}`, 20, startY + 5);

    const hpPercent = gameState.player.hp / gameState.player.maxHp;
    ctx.fillStyle = '#333';
    ctx.fillRect(20, startY + 12, barWidth, barHeightInner);
    ctx.fillStyle = hpPercent > 0.5 ? '#00ff00' : hpPercent > 0.25 ? '#ffff00' : '#ff0000';
    ctx.fillRect(20, startY + 12, barWidth * hpPercent, barHeightInner);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, startY + 12, barWidth, barHeightInner);

    // MP
    const mpX = 30 + barWidth + 20;
    ctx.fillStyle = '#fff';
    ctx.fillText(`MP: ${gameState.player.mp}/${gameState.player.maxMp}`, mpX, startY + 5);

    const mpPercent = gameState.player.mp / gameState.player.maxMp;
    ctx.fillStyle = '#333';
    ctx.fillRect(mpX, startY + 12, barWidth, barHeightInner);
    ctx.fillStyle = '#0088ff';
    ctx.fillRect(mpX, startY + 12, barWidth * mpPercent, barHeightInner);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(mpX, startY + 12, barWidth, barHeightInner);

    // レベル・経験値・ゴールド
    const statsX = mpX + barWidth + 40;
    ctx.fillStyle = '#fff';
    ctx.fillText(`Lv.${gameState.player.level}`, statsX, startY + 5);
    ctx.fillText(`EXP: ${gameState.player.exp}`, statsX, startY + 25);
    ctx.fillText(`G: ${gameState.player.gold}`, statsX + 100, startY + 25);

    // キャラクター名
    const nameX = canvas.width - 150;
    ctx.fillStyle = '#0f0';
    ctx.font = `bold ${fontSize * 1.2}px sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText('カイト', canvas.width - 20, startY + 15);
    ctx.fillStyle = '#888';
    ctx.font = `${fontSize * 0.9}px sans-serif`;
    ctx.fillText('依人 - スサノオ', canvas.width - 20, startY + 35);
}

// 会話ダイアログ
function drawDialog() {
    if (!gameState.showDialog) return;

    const dialogHeight = 120;
    const dialogY = PLAYABLE_HEIGHT - dialogHeight - 20;
    const dialogX = 40;
    const dialogWidth = canvas.width - 80;

    // 背景
    ctx.fillStyle = 'rgba(0, 0, 20, 0.95)';
    ctx.fillRect(dialogX, dialogY, dialogWidth, dialogHeight);

    // ボーダー
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 3;
    ctx.strokeRect(dialogX, dialogY, dialogWidth, dialogHeight);

    // NPCアイコン
    if (gameState.dialogNpc) {
        ctx.fillStyle = gameState.dialogNpc.color;
        ctx.beginPath();
        ctx.arc(dialogX + 40, dialogY + 50, 25, 0, Math.PI * 2);
        ctx.fill();

        // NPC名
        ctx.fillStyle = '#0ff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(gameState.dialogNpc.name, dialogX + 40, dialogY + 90);
    }

    // テキスト
    ctx.fillStyle = '#fff';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'left';

    const maxWidth = dialogWidth - 120;
    const words = gameState.dialogText.split('');
    let line = '';
    let y = dialogY + 40;

    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i];
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxWidth && i > 0) {
            ctx.fillText(line, dialogX + 90, y);
            line = words[i];
            y += 25;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, dialogX + 90, y);

    // 続きインジケーター
    const indicatorPulse = Math.sin(animationTime * 0.15) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(0, 255, 255, ${indicatorPulse})`;
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('▼ SPACE', dialogX + dialogWidth - 15, dialogY + dialogHeight - 15);
}

// メイン描画
function drawGame() {
    const map = maps[gameState.currentMap];

    // 背景クリア
    ctx.fillStyle = map.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // プレイエリアのみに描画
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, PLAYABLE_HEIGHT);
    ctx.clip();

    // 床タイル
    drawFloorTiles();

    // 障害物
    drawObstacles();

    // ポータル
    drawPortals();

    // NPC
    drawNPCs();

    // プレイヤー
    drawPlayer();

    // マップ情報
    drawMapInfo();

    // 操作説明
    drawControlsPanel();

    // ダイアログ
    drawDialog();

    ctx.restore();

    // ステータスバー
    drawStatusBar();
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

// ウィンドウリサイズ対応
window.addEventListener('resize', () => {
    resizeCanvas();
});

// ゲームループ
function gameLoop() {
    animationTime++;
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
    resizeCanvas();
    // 初期位置をグリッドの中央に設定
    gameState.player.x = Math.floor(GRID_WIDTH / 2);
    gameState.player.y = Math.floor(GRID_HEIGHT / 2);
    setTimeout(startGame, 100);
});
