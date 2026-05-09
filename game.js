// デウス・コード 八百万の神託 - RPGゲーム
// マップ表示改善版

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ゲーム定数（大画面対応）
const TILE_SIZE = 50;
const GRID_WIDTH = 24;
const GRID_HEIGHT = 12;
const STATUS_BAR_HEIGHT = 150;
const PLAYABLE_HEIGHT = canvas.height - STATUS_BAR_HEIGHT;

// アニメーション用
let animationTime = 0;

// ゲーム状態
const gameState = {
    player: {
        x: 12,
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
    moveDelay: 150,
    // シーン管理：'opening' | 'transition' | 'map'
    scene: 'opening',
    openingIndex: 0,
    lastOpeningInputTime: 0,
    openingInputDelay: 220,
    transitionAlpha: 0,
    transitionDirection: 'in', // 'in' = 黒へフェード, 'out' = 黒から戻す
    introDialogShown: false
};

// オープニングシナリオ（シナリオデータに準拠）
const openingScenes = [
    {
        type: 'title',
        title: 'デウス・コード',
        subtitle: '八百万の神託',
        body: [
            '神々の力をその身に降ろし、',
            'AIが支配する無機質な世界に、',
            '人の心を取り戻せ。'
        ],
        accentColor: '#0ff'
    },
    {
        type: 'narration',
        title: '西暦 20XX 年 ─ シンジュク',
        body: [
            '全知統制システムAI『アーク』が、',
            'この街の全てを管理していた。',
            '',
            '犯罪も、貧困も、争いも消えた。',
            '同時に、人々から "感情" も奪われた。'
        ],
        accentColor: '#88aaff'
    },
    {
        type: 'narration',
        title: '俺の名は ─ カイト',
        body: [
            'ごく普通の高校生だった。',
            '──昨日までは。',
            '',
            '目の前で親友が "処理" された。',
            '"非効率な感情を持っている" という、',
            'ただ、それだけの理由で。'
        ],
        accentColor: '#ff5566'
    },
    {
        type: 'awakening',
        title: '── 覚 醒 ──',
        body: [
            '胸の奥で、何かが咆哮した。',
            '',
            '『叫べ。怒れ。',
            '  儂はスサノオ ──',
            '  お前の怒りに応えよう。』',
            '',
            '俺の中に、神が宿った。'
        ],
        accentColor: '#ffcc33'
    },
    {
        type: 'finale',
        title: '物語の、はじまり',
        body: [
            'シンジュク中央区画。',
            'アークの監視網の、ど真ん中。',
            '',
            'ここから、俺の戦いが始まる。'
        ],
        accentColor: '#00ff88'
    }
];

// マップデータ（大画面用に調整）
const maps = {
    shinjuku_central: {
        name: '新宿 - 中央区画',
        description: 'アークに管理された街の中心部',
        walkCount: 176,
        encounterRate: 45,
        bgColor: '#1a1a2e',
        npcs: [
            { x: 4, y: 3, name: '武器商人リョウ', color: '#90EE90', dialog: '良い武器が入ったぜ！見ていくかい？' },
            { x: 8, y: 3, name: '防具商人サクラ', color: '#FFB6C1', dialog: '防具なら私に任せて！' },
            { x: 12, y: 3, name: 'アイテム商人ユウキ', color: '#87CEEB', dialog: 'アイテムの補充はいかが？' },
            { x: 16, y: 3, name: '魔法商人ミコト', color: '#DDA0DD', dialog: '魔法の書を揃えているわ' },
            { x: 6, y: 7, name: '宿屋の主人', color: '#FFA07A', dialog: '疲れただろう？ゆっくり休んでいきな' },
            { x: 10, y: 7, name: '新宿区長', color: '#F0E68C', dialog: 'ようこそ新宿中央区画へ' },
            { x: 18, y: 7, name: 'ギルドマスター', color: '#98FB98', dialog: 'クエストを受けていくかい？' }
        ],
        obstacles: [
            { x: 5, y: 5, width: 3, height: 2, name: '街の住居' }
        ],
        portals: [
            {
                x: 0, y: 4, width: 1, height: 4,
                direction: 'left',
                target: 'residential_area',
                targetDir: 'right',
                label: '← 住宅街へ'
            },
            {
                x: 23, y: 4, width: 1, height: 4,
                direction: 'right',
                target: 'shibuya_shopping',
                targetDir: 'left',
                label: '渋谷へ →'
            }
        ]
    },

    residential_area: {
        name: '住宅街 - 静かな路地',
        description: '古い住宅が立ち並ぶ静かなエリア',
        walkCount: 120,
        encounterRate: 20,
        bgColor: '#1e2a1e',
        npcs: [
            { x: 8, y: 5, name: '老人', color: '#D3D3D3', dialog: '最近は物騒でのう...' },
            { x: 14, y: 6, name: '子供', color: '#FFD700', dialog: 'ぼく、依人になりたいな！' }
        ],
        obstacles: [
            { x: 4, y: 3, width: 3, height: 2, name: '民家' },
            { x: 17, y: 3, width: 3, height: 2, name: '民家' }
        ],
        portals: [
            {
                x: 23, y: 4, width: 1, height: 4,
                direction: 'right',
                target: 'shinjuku_central',
                targetDir: 'left',
                label: '中央区画へ →'
            }
        ]
    },

    shibuya_shopping: {
        name: '渋谷商業街 - ショッピングモール',
        description: 'ネオンが輝く大型商業施設',
        walkCount: 270,
        encounterRate: 0,
        bgColor: '#2a1a2e',
        npcs: [
            { x: 12, y: 8, name: '感情を失った市民', color: '#B0C4DE', dialog: '...買い物...効率的...アーク様...' },
            { x: 14, y: 4, name: 'アカリ', color: '#FFD700', dialog: 'この街の人たち、何かおかしいわ...' }
        ],
        obstacles: [],
        portals: [
            {
                x: 0, y: 4, width: 1, height: 4,
                direction: 'left',
                target: 'shinjuku_central',
                targetDir: 'right',
                label: '← 新宿へ'
            },
            {
                x: 10, y: 11, width: 4, height: 1,
                direction: 'bottom',
                target: 'shibuya_street',
                targetDir: 'top',
                label: '↓ 表通りへ'
            },
            {
                x: 23, y: 4, width: 1, height: 4,
                direction: 'right',
                target: 'city_hall',
                targetDir: 'left',
                label: '都庁へ →'
            }
        ]
    },

    shibuya_street: {
        name: '渋谷商業街 - 表通り',
        description: '賑やかな商店街のメインストリート',
        walkCount: 200,
        encounterRate: 15,
        bgColor: '#2a2a1e',
        npcs: [
            { x: 7, y: 6, name: '商人', color: '#FFA500', dialog: 'いらっしゃい！何か探してる？' },
            { x: 17, y: 6, name: '巡回ドローン', color: '#FF6347', dialog: '...監視中...異常なし...' }
        ],
        obstacles: [
            { x: 4, y: 4, width: 3, height: 2, name: '店舗' },
            { x: 17, y: 4, width: 3, height: 2, name: '店舗' }
        ],
        portals: [
            {
                x: 10, y: 0, width: 4, height: 1,
                direction: 'top',
                target: 'shibuya_shopping',
                targetDir: 'bottom',
                label: '↑ モールへ'
            },
            {
                x: 10, y: 11, width: 4, height: 1,
                direction: 'bottom',
                target: 'underground_market',
                targetDir: 'top',
                label: '↓ 闇市へ'
            }
        ]
    },

    city_hall: {
        name: '都庁 - 管理センター',
        description: 'アークの制御中枢がある場所',
        walkCount: 150,
        encounterRate: 30,
        bgColor: '#1a2a3a',
        npcs: [
            { x: 12, y: 7, name: 'AI管理官', color: '#00CED1', dialog: 'アークの意志に従え...' },
            { x: 8, y: 5, name: 'ヤミ', color: '#9370DB', dialog: 'ここがAIの中枢か...興味深いな' }
        ],
        obstacles: [
            { x: 10, y: 3, width: 4, height: 2, name: '制御装置' }
        ],
        portals: [
            {
                x: 0, y: 4, width: 1, height: 4,
                direction: 'left',
                target: 'shibuya_shopping',
                targetDir: 'right',
                label: '← モールへ'
            }
        ]
    },

    underground_market: {
        name: '地下闇市 - 反アーク拠点',
        description: 'レジスタンスの秘密基地',
        walkCount: 300,
        encounterRate: 0,
        bgColor: '#0a0a1a',
        npcs: [
            { x: 7, y: 6, name: 'レジスタンス', color: '#FF4500', dialog: 'アークを倒す...それが俺たちの使命だ' },
            { x: 17, y: 6, name: '情報屋', color: '#DAA520', dialog: '何か知りたいことは？' },
            { x: 12, y: 8, name: 'リク', color: '#32CD32', dialog: '外の世界...本当の自然を見てみたい' }
        ],
        obstacles: [
            { x: 4, y: 3, width: 3, height: 2, name: '武器庫' },
            { x: 17, y: 3, width: 3, height: 2, name: '物資' }
        ],
        portals: [
            {
                x: 10, y: 0, width: 4, height: 1,
                direction: 'top',
                target: 'shibuya_street',
                targetDir: 'bottom',
                label: '↑ 表通りへ'
            }
        ]
    }
};

// プレイヤーの位置をポータルの方向に基づいて設定
function setPlayerPositionFromPortal(targetDir) {
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
            gameState.player.x = 12;
            gameState.player.y = 2;
            break;
        case 'bottom':
            gameState.player.x = 12;
            gameState.player.y = GRID_HEIGHT - 3;
            break;
        default:
            gameState.player.x = 12;
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

// セーブ機能
function saveGame() {
    console.log('ゲームをセーブしました');
}

// 描画関数
function drawGame() {
    const map = maps[gameState.currentMap];

    // 背景
    ctx.fillStyle = map.bgColor;
    ctx.fillRect(0, 0, canvas.width, PLAYABLE_HEIGHT);

    // グリッド（床タイル風）
    for (let x = 0; x < GRID_WIDTH; x++) {
        for (let y = 0; y < GRID_HEIGHT; y++) {
            const isAlt = (x + y) % 2 === 0;
            ctx.fillStyle = isAlt ? map.bgColor : adjustColor(map.bgColor, 15);
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }

    // グリッド線
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
    for (let obs of map.obstacles) {
        ctx.fillStyle = '#3a3a4a';
        ctx.fillRect(
            obs.x * TILE_SIZE,
            obs.y * TILE_SIZE,
            obs.width * TILE_SIZE,
            obs.height * TILE_SIZE
        );
        // 建物の影
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(
            obs.x * TILE_SIZE + 4,
            obs.y * TILE_SIZE + obs.height * TILE_SIZE,
            obs.width * TILE_SIZE,
            4
        );
        ctx.fillStyle = '#fff';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(obs.name, (obs.x + obs.width/2) * TILE_SIZE, (obs.y + obs.height/2) * TILE_SIZE + 5);
    }

    // ポータル（目立つように）
    const glowIntensity = Math.sin(animationTime * 0.08) * 0.3 + 0.7;
    for (let portal of map.portals) {
        const px = portal.x * TILE_SIZE;
        const py = portal.y * TILE_SIZE;
        const pw = portal.width * TILE_SIZE;
        const ph = portal.height * TILE_SIZE;

        // グロー効果
        ctx.shadowColor = '#0ff';
        ctx.shadowBlur = 20 * glowIntensity;

        // ポータルエリア
        ctx.fillStyle = `rgba(0, 255, 255, ${0.3 * glowIntensity})`;
        ctx.fillRect(px, py, pw, ph);

        // ボーダー
        ctx.strokeStyle = `rgba(0, 255, 255, ${glowIntensity})`;
        ctx.lineWidth = 3;
        ctx.strokeRect(px + 2, py + 2, pw - 4, ph - 4);

        ctx.shadowBlur = 0;

        // ラベル
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // テキストの背景
        const textX = px + pw/2;
        const textY = py + ph/2;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        const textWidth = ctx.measureText(portal.label).width + 10;
        ctx.fillRect(textX - textWidth/2, textY - 10, textWidth, 20);

        ctx.fillStyle = '#0ff';
        ctx.fillText(portal.label, textX, textY);
    }

    // NPC
    for (let npc of map.npcs) {
        const bobOffset = Math.sin(animationTime * 0.1 + npc.x) * 2;

        // 影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(
            npc.x * TILE_SIZE + TILE_SIZE/2,
            npc.y * TILE_SIZE + TILE_SIZE - 5,
            TILE_SIZE/3,
            TILE_SIZE/6,
            0, 0, Math.PI * 2
        );
        ctx.fill();

        // NPC本体
        ctx.fillStyle = npc.color;
        ctx.beginPath();
        ctx.arc(
            npc.x * TILE_SIZE + TILE_SIZE/2,
            npc.y * TILE_SIZE + TILE_SIZE/2 + bobOffset,
            TILE_SIZE/3,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // 会話アイコン
        ctx.fillStyle = '#FFD700';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💬', npc.x * TILE_SIZE + TILE_SIZE/2, npc.y * TILE_SIZE - 5 + bobOffset);

        // NPC名
        ctx.fillStyle = '#fff';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(npc.name, npc.x * TILE_SIZE + TILE_SIZE/2, npc.y * TILE_SIZE + TILE_SIZE + 12);
    }

    // プレイヤー
    const playerBob = Math.sin(animationTime * 0.15) * 2;

    // プレイヤーオーラ
    const auraSize = TILE_SIZE/2 + Math.sin(animationTime * 0.1) * 5;
    ctx.fillStyle = 'rgba(0, 255, 100, 0.2)';
    ctx.beginPath();
    ctx.arc(
        gameState.player.x * TILE_SIZE + TILE_SIZE/2,
        gameState.player.y * TILE_SIZE + TILE_SIZE/2,
        auraSize,
        0, Math.PI * 2
    );
    ctx.fill();

    // 影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(
        gameState.player.x * TILE_SIZE + TILE_SIZE/2,
        gameState.player.y * TILE_SIZE + TILE_SIZE - 5,
        TILE_SIZE/3,
        TILE_SIZE/6,
        0, 0, Math.PI * 2
    );
    ctx.fill();

    // プレイヤー本体
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(
        gameState.player.x * TILE_SIZE + TILE_SIZE/2,
        gameState.player.y * TILE_SIZE + TILE_SIZE/2 + playerBob,
        TILE_SIZE/2.5,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // プレイヤーボーダー
    ctx.strokeStyle = '#00ff66';
    ctx.lineWidth = 2;
    ctx.stroke();

    // プレイヤーラベル
    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('カイト', gameState.player.x * TILE_SIZE + TILE_SIZE/2, gameState.player.y * TILE_SIZE + TILE_SIZE + 14);

    // マップ名と情報表示
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(10, 10, 300, 75);
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 300, 75);

    ctx.fillStyle = '#0ff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(map.name, 20, 35);

    ctx.fillStyle = '#aaa';
    ctx.font = '12px sans-serif';
    ctx.fillText(map.description || '', 20, 55);

    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.fillText(`歩数: ${map.walkCount}  遭遇率: ${map.encounterRate}%`, 20, 75);

    // 操作方法表示
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(canvas.width - 220, 10, 210, 110);
    ctx.strokeStyle = '#0ff';
    ctx.strokeRect(canvas.width - 220, 10, 210, 110);

    ctx.fillStyle = '#0ff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('操作方法', canvas.width - 210, 30);
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.fillText('↑←↓→: 移動', canvas.width - 210, 50);
    ctx.fillText('SPACE: アクション（会話）', canvas.width - 210, 70);
    ctx.fillText('Z: 神威発動', canvas.width - 210, 90);
    ctx.fillText('X: メニュー', canvas.width - 210, 110);

    // ステータスバー
    ctx.fillStyle = '#000';
    ctx.fillRect(0, PLAYABLE_HEIGHT, canvas.width, STATUS_BAR_HEIGHT);

    // 上部ライン
    const gradient = ctx.createLinearGradient(0, PLAYABLE_HEIGHT, canvas.width, PLAYABLE_HEIGHT);
    gradient.addColorStop(0, '#0ff');
    gradient.addColorStop(0.5, '#0088ff');
    gradient.addColorStop(1, '#0ff');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, PLAYABLE_HEIGHT);
    ctx.lineTo(canvas.width, PLAYABLE_HEIGHT);
    ctx.stroke();

    // HP
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('HP: ' + gameState.player.hp + '/' + gameState.player.maxHp, 30, PLAYABLE_HEIGHT + 35);

    // HPバー
    const hpBarWidth = 200;
    const hpPercent = gameState.player.hp / gameState.player.maxHp;
    ctx.fillStyle = '#333';
    ctx.fillRect(30, PLAYABLE_HEIGHT + 45, hpBarWidth, 25);
    ctx.fillStyle = hpPercent > 0.5 ? '#00ff00' : hpPercent > 0.25 ? '#ffff00' : '#ff0000';
    ctx.fillRect(30, PLAYABLE_HEIGHT + 45, hpBarWidth * hpPercent, 25);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, PLAYABLE_HEIGHT + 45, hpBarWidth, 25);

    // MP
    ctx.fillStyle = '#fff';
    ctx.fillText('MP: ' + gameState.player.mp + '/' + gameState.player.maxMp, 260, PLAYABLE_HEIGHT + 35);

    // MPバー
    const mpBarWidth = 200;
    const mpPercent = gameState.player.mp / gameState.player.maxMp;
    ctx.fillStyle = '#333';
    ctx.fillRect(260, PLAYABLE_HEIGHT + 45, mpBarWidth, 25);
    ctx.fillStyle = '#0066ff';
    ctx.fillRect(260, PLAYABLE_HEIGHT + 45, mpBarWidth * mpPercent, 25);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(260, PLAYABLE_HEIGHT + 45, mpBarWidth, 25);

    // レベル、経験値、ゴールド
    ctx.fillStyle = '#fff';
    ctx.fillText('Lv.' + gameState.player.level, 500, PLAYABLE_HEIGHT + 35);
    ctx.fillText('EXP: ' + gameState.player.exp, 500, PLAYABLE_HEIGHT + 60);
    ctx.fillText('ゴールド: ' + gameState.player.gold, 620, PLAYABLE_HEIGHT + 60);

    // キャラクター情報
    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('カイト', canvas.width - 30, PLAYABLE_HEIGHT + 40);
    ctx.fillStyle = '#888';
    ctx.font = '14px sans-serif';
    ctx.fillText('依人 - スサノオ', canvas.width - 30, PLAYABLE_HEIGHT + 65);

    // 現在地表示
    ctx.fillStyle = '#666';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`座標: (${gameState.player.x}, ${gameState.player.y})`, 30, PLAYABLE_HEIGHT + 95);

    // 会話ダイアログ
    if (gameState.showDialog) {
        // 半透明の背景
        ctx.fillStyle = 'rgba(0, 0, 20, 0.95)';
        ctx.fillRect(50, PLAYABLE_HEIGHT - 140, canvas.width - 100, 130);
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 3;
        ctx.strokeRect(50, PLAYABLE_HEIGHT - 140, canvas.width - 100, 130);

        // NPCアイコン
        if (gameState.dialogNpc) {
            ctx.fillStyle = gameState.dialogNpc.color;
            ctx.beginPath();
            ctx.arc(100, PLAYABLE_HEIGHT - 80, 30, 0, Math.PI * 2);
            ctx.fill();

            // NPC名
            ctx.fillStyle = '#0ff';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(gameState.dialogNpc.name, 100, PLAYABLE_HEIGHT - 30);
        }

        // テキスト
        ctx.fillStyle = '#fff';
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'left';

        // テキストを折り返し
        const maxWidth = canvas.width - 250;
        const words = gameState.dialogText.split('');
        let line = '';
        let y = PLAYABLE_HEIGHT - 110;

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i];
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && i > 0) {
                ctx.fillText(line, 160, y);
                line = words[i];
                y += 28;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, 160, y);

        // 続きのインジケーター
        const indicatorPulse = Math.sin(animationTime * 0.15) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(0, 255, 255, ${indicatorPulse})`;
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('▼ SPACE で閉じる', canvas.width - 70, PLAYABLE_HEIGHT - 20);
    }
}

// オープニング背景（縦スキャンライン＋粒子）
function drawOpeningBackground(scene) {
    // ベース背景
    const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, '#05050f');
    bgGrad.addColorStop(0.5, '#0a0a20');
    bgGrad.addColorStop(1, '#020208');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 縦スキャンライン（ゆっくり下に流れる）
    ctx.strokeStyle = `rgba(255, 255, 255, 0.04)`;
    ctx.lineWidth = 1;
    const lineSpacing = 4;
    const offset = (animationTime * 0.5) % lineSpacing;
    for (let y = -offset; y < canvas.height; y += lineSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // 上下の装飾バー（シーンのアクセントカラー）
    const barAlpha = 0.85;
    ctx.fillStyle = scene.accentColor;
    ctx.globalAlpha = barAlpha;
    ctx.fillRect(0, 0, canvas.width, 6);
    ctx.fillRect(0, canvas.height - 6, canvas.width, 6);
    ctx.globalAlpha = 1;

    // サイドのコーナー装飾
    ctx.strokeStyle = scene.accentColor;
    ctx.lineWidth = 2;
    const cornerSize = 40;
    const margin = 30;
    // 左上
    ctx.beginPath();
    ctx.moveTo(margin, margin + cornerSize);
    ctx.lineTo(margin, margin);
    ctx.lineTo(margin + cornerSize, margin);
    ctx.stroke();
    // 右上
    ctx.beginPath();
    ctx.moveTo(canvas.width - margin - cornerSize, margin);
    ctx.lineTo(canvas.width - margin, margin);
    ctx.lineTo(canvas.width - margin, margin + cornerSize);
    ctx.stroke();
    // 左下
    ctx.beginPath();
    ctx.moveTo(margin, canvas.height - margin - cornerSize);
    ctx.lineTo(margin, canvas.height - margin);
    ctx.lineTo(margin + cornerSize, canvas.height - margin);
    ctx.stroke();
    // 右下
    ctx.beginPath();
    ctx.moveTo(canvas.width - margin - cornerSize, canvas.height - margin);
    ctx.lineTo(canvas.width - margin, canvas.height - margin);
    ctx.lineTo(canvas.width - margin, canvas.height - margin - cornerSize);
    ctx.stroke();

    // 覚醒シーン専用の放射状グロー
    if (scene.type === 'awakening') {
        const pulse = Math.sin(animationTime * 0.07) * 0.15 + 0.35;
        const glow = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 50,
            canvas.width / 2, canvas.height / 2, canvas.width / 1.5
        );
        glow.addColorStop(0, `rgba(255, 204, 51, ${pulse})`);
        glow.addColorStop(0.4, `rgba(255, 100, 0, ${pulse * 0.3})`);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

// オープニング描画
function drawOpening() {
    const scene = openingScenes[gameState.openingIndex];

    drawOpeningBackground(scene);

    // タイトル
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = scene.accentColor;
    ctx.shadowBlur = 18;
    ctx.fillStyle = scene.accentColor;
    const titleSize = scene.type === 'title' ? 68 : 44;
    ctx.font = `bold ${titleSize}px sans-serif`;
    const titleY = scene.type === 'title' ? 230 : 180;
    ctx.fillText(scene.title, canvas.width / 2, titleY);
    ctx.shadowBlur = 0;

    // サブタイトル（タイトルシーンのみ）
    if (scene.subtitle) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText(scene.subtitle, canvas.width / 2, 295);

        // タイトル下の区切り線
        ctx.strokeStyle = scene.accentColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 200, 335);
        ctx.lineTo(canvas.width / 2 + 200, 335);
        ctx.stroke();
    }

    // 本文
    ctx.fillStyle = '#f0f0f0';
    ctx.font = '24px sans-serif';
    const lineHeight = 38;
    const bodyStartY = scene.type === 'title' ? 410 : canvas.height / 2 - 30;
    let y = bodyStartY;
    for (const line of scene.body) {
        ctx.fillText(line, canvas.width / 2, y);
        y += lineHeight;
    }

    // ページインジケーター
    ctx.fillStyle = '#555';
    ctx.font = '14px sans-serif';
    const total = openingScenes.length;
    const pageText = `${gameState.openingIndex + 1} / ${total}`;
    ctx.fillText(pageText, canvas.width / 2, canvas.height - 40);

    // 進行ドット
    const dotSpacing = 18;
    const dotsTotalWidth = (total - 1) * dotSpacing;
    const dotsStartX = canvas.width / 2 - dotsTotalWidth / 2;
    for (let i = 0; i < total; i++) {
        ctx.fillStyle = i === gameState.openingIndex ? scene.accentColor : '#333';
        ctx.beginPath();
        ctx.arc(dotsStartX + i * dotSpacing, canvas.height - 65, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    // SPACEプロンプト
    const pulse = Math.sin(animationTime * 0.08) * 0.4 + 0.6;
    ctx.fillStyle = `rgba(0, 255, 255, ${pulse})`;
    ctx.font = 'bold 18px sans-serif';
    const isLast = gameState.openingIndex === openingScenes.length - 1;
    const promptText = isLast ? '▼ SPACE で物語を始める' : '▼ SPACE で進む';
    ctx.fillText(promptText, canvas.width / 2, canvas.height - 90);
}

// オープニングを進める
function advanceOpening() {
    const now = Date.now();
    if (now - gameState.lastOpeningInputTime < gameState.openingInputDelay) {
        return;
    }
    gameState.lastOpeningInputTime = now;

    if (gameState.openingIndex < openingScenes.length - 1) {
        gameState.openingIndex++;
    } else {
        // 最後のパネル → マップへの遷移開始
        gameState.scene = 'transition';
        gameState.transitionDirection = 'in';
        gameState.transitionAlpha = 0;
    }
}

// 遷移更新（フェードイン→アウト）
function updateTransition() {
    if (gameState.transitionDirection === 'in') {
        gameState.transitionAlpha = Math.min(1, gameState.transitionAlpha + 0.04);
        if (gameState.transitionAlpha >= 1) {
            // 完全な暗転中にマップ準備＆導入セリフセット
            gameState.transitionDirection = 'out';
            if (!gameState.introDialogShown) {
                gameState.showDialog = true;
                gameState.dialogText = '（……シンジュク中央区画。アークが「最適化」した街。人々の目には光がない。 ──まずは情報を集めよう。誰かに話しかけてみるか。）';
                gameState.dialogNpc = { name: 'カイト（独白）', color: '#00ff66' };
                gameState.introDialogShown = true;
            }
        }
    } else {
        gameState.transitionAlpha = Math.max(0, gameState.transitionAlpha - 0.025);
        if (gameState.transitionAlpha <= 0) {
            gameState.scene = 'map';
        }
    }
}

// 遷移描画
function drawTransition() {
    if (gameState.transitionDirection === 'in') {
        // フェードイン中はオープニングの最後のパネルを表示
        drawOpening();
    } else {
        // フェードアウト中はマップを表示
        drawGame();
    }
    ctx.fillStyle = `rgba(0, 0, 0, ${gameState.transitionAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 色を調整するヘルパー関数
function adjustColor(hex, amount) {
    const num = parseInt(hex.slice(1), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return `rgb(${r}, ${g}, ${b})`;
}

// キーボード入力
document.addEventListener('keydown', (e) => {
    gameState.keys[e.key] = true;

    // オープニング中は SPACE / Enter のみ受け付ける
    if (gameState.scene === 'opening') {
        if (e.key === ' ' || e.key === 'Enter') {
            advanceOpening();
            e.preventDefault();
        }
        return;
    }

    // 遷移中は入力を無効化
    if (gameState.scene === 'transition') {
        e.preventDefault();
        return;
    }

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
    animationTime++;
    if (gameState.scene === 'opening') {
        drawOpening();
    } else if (gameState.scene === 'transition') {
        updateTransition();
        drawTransition();
    } else {
        drawGame();
    }
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
