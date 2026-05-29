// ========================================================================
// data/maps.js — マップ定義（シナリオに合わせ再構成）
// ========================================================================
// 接続グラフ:
//   residential_area ─ shinjuku_central ─ shibuya_shopping ─ city_hall ─ arc_core
//                            │(下)                 │(下)
//                       shrine_grounds        shibuya_street
//                       (神社/アカリ)               │(下)
//                                            underground_market ─ botanical_garden
//                                            (闇市/ヤミ)           (植物園/リク)
//
// npc 追加フィールド:
//   shopId      … data/shops.js のキー。会話の代わりに店/宿を開く
//   hideWhenFlag… 指定フラグが立つと非表示・無効化（仲間加入後に消す）
//   dialog      … 文字列、または [{flags:[...], text}] の配列（進行で変化）
// portal 追加フィールド:
//   requireItem … 所持していないと通れない（ソフトゲート：バナーで助言）

const maps = {
    // ── ハブ：新宿中央区画（店・ギルド） ──────────────────────
    shinjuku_central: {
        name: '新宿 - 中央区画',
        description: 'アークに管理された街の中心部',
        walkCount: 176, encounterRate: 0, bgColor: '#1a1a2e',
        npcs: [
            { x: 4, y: 3, name: '武器商人リョウ', color: '#90EE90', shopId: 'ryou', dialog: '良い武器が入ったぜ！見ていくかい？' },
            { x: 8, y: 3, name: '防具商人サクラ', color: '#FFB6C1', shopId: 'sakura', dialog: '回復の道具なら私に任せて！' },
            { x: 12, y: 3, name: 'アイテム商人ユウキ', color: '#87CEEB', shopId: 'yuki', dialog: 'アイテムの補充はいかが？' },
            { x: 16, y: 3, name: '魔法商人ミコト', color: '#DDA0DD', shopId: 'mikoto', dialog: '神威を高める品を揃えているわ' },
            { x: 6, y: 7, name: '宿屋の主人', color: '#FFA07A', shopId: 'inn_shinjuku', dialog: '疲れただろう？ゆっくり休んでいきな' },
            { x: 10, y: 7, name: '新宿区長', color: '#F0E68C', dialog: [
                { flags: ['akari_joined'], text: '巫女様まで反アークに…時代が動いておるな。' },
                { flags: [], text: 'ようこそ新宿中央区画へ。アーク様のおかげで平和そのものだ。' }
            ] },
            { x: 18, y: 7, name: 'ギルドマスター', color: '#98FB98', dialog: 'クエストを受けていくかい？' }
        ],
        obstacles: [
            { x: 5, y: 5, width: 3, height: 2, name: '街の住居' }
        ],
        portals: [
            { x: 0, y: 4, width: 1, height: 4, direction: 'left', target: 'residential_area', targetDir: 'right', label: '← 住宅街へ' },
            { x: 23, y: 4, width: 1, height: 4, direction: 'right', target: 'shibuya_shopping', targetDir: 'left', label: '渋谷へ →' },
            { x: 10, y: 11, width: 4, height: 1, direction: 'bottom', target: 'shrine_grounds', targetDir: 'top', label: '↓ 神社へ' }
        ]
    },

    // ── 神社境内（アカリ／アマテラス覚醒・第2章） ─────────────
    shrine_grounds: {
        name: '神社境内 - 朽ちた社',
        description: '苔むした鳥居が並ぶ、神々の気配が残る場所',
        walkCount: 90, encounterRate: 30, bgColor: '#16241a',
        npcs: [
            { x: 12, y: 6, name: 'アカリ', color: '#FFD700', hideWhenFlag: 'akari_joined',
              dialog: 'あなた…ただの人間じゃないわね。神の気配を感じる…' },
            { x: 7, y: 8, name: '老巫女', color: '#D3D3D3', dialog: 'この社には、まだ神がまどろんでおられる…' }
        ],
        obstacles: [
            { x: 10, y: 2, width: 4, height: 2, name: '社殿' }
        ],
        portals: [
            { x: 10, y: 0, width: 4, height: 1, direction: 'top', target: 'shinjuku_central', targetDir: 'bottom', label: '↑ 中央区画へ' }
        ]
    },

    // ── 住宅街（接続ルート） ───────────────────────────────
    residential_area: {
        name: '住宅街 - 静かな路地',
        description: '古い住宅が立ち並ぶ静かなエリア',
        walkCount: 120, encounterRate: 15, bgColor: '#1e2a1e',
        npcs: [
            { x: 8, y: 5, name: '老人', color: '#D3D3D3', dialog: '最近は物騒でのう...' },
            { x: 14, y: 6, name: '子供', color: '#FFD700', dialog: 'ぼく、依人になりたいな！' }
        ],
        obstacles: [
            { x: 4, y: 3, width: 3, height: 2, name: '民家' },
            { x: 17, y: 3, width: 3, height: 2, name: '民家' }
        ],
        portals: [
            { x: 23, y: 4, width: 1, height: 4, direction: 'right', target: 'shinjuku_central', targetDir: 'left', label: '中央区画へ →' }
        ]
    },

    // ── 渋谷商業街・モール（中継ハブ） ──────────────────────
    shibuya_shopping: {
        name: '渋谷商業街 - ショッピングモール',
        description: 'ネオンが輝く大型商業施設',
        walkCount: 270, encounterRate: 0, bgColor: '#2a1a2e',
        npcs: [
            { x: 12, y: 8, name: '感情を失った市民', color: '#B0C4DE', dialog: '...買い物...効率的...アーク様...' },
            { x: 8, y: 4, name: '案内ロボット', color: '#87CEEB', dialog: 'イラッシャイマセ。最適ナ買物体験ヲ。' }
        ],
        obstacles: [],
        portals: [
            { x: 0, y: 4, width: 1, height: 4, direction: 'left', target: 'shinjuku_central', targetDir: 'right', label: '← 新宿へ' },
            { x: 10, y: 11, width: 4, height: 1, direction: 'bottom', target: 'shibuya_street', targetDir: 'top', label: '↓ 表通りへ' },
            { x: 23, y: 4, width: 1, height: 4, direction: 'right', target: 'city_hall', targetDir: 'left', label: '都庁へ →' }
        ]
    },

    // ── 渋谷・表通り（接続ルート） ─────────────────────────
    shibuya_street: {
        name: '渋谷商業街 - 表通り',
        description: '賑やかな商店街のメインストリート',
        walkCount: 200, encounterRate: 15, bgColor: '#2a2a1e',
        npcs: [
            { x: 7, y: 6, name: '露店の商人', color: '#FFA500', dialog: 'いらっしゃい！掘り出し物だよ。' },
            { x: 17, y: 6, name: '巡回ドローン', color: '#FF6347', dialog: '...監視中...異常なし...' }
        ],
        obstacles: [
            { x: 4, y: 4, width: 3, height: 2, name: '店舗' },
            { x: 17, y: 4, width: 3, height: 2, name: '店舗' }
        ],
        portals: [
            { x: 10, y: 0, width: 4, height: 1, direction: 'top', target: 'shibuya_shopping', targetDir: 'bottom', label: '↑ モールへ' },
            { x: 10, y: 11, width: 4, height: 1, direction: 'bottom', target: 'underground_market', targetDir: 'top', label: '↓ 闇市へ' }
        ]
    },

    // ── 地下闇市（ヤミ／ツクヨミ・第3章／レジスタンス拠点） ──
    underground_market: {
        name: '地下闇市 - 反アーク拠点',
        description: 'レジスタンスの秘密基地',
        walkCount: 300, encounterRate: 0, bgColor: '#0a0a1a',
        npcs: [
            { x: 12, y: 6, name: 'ヤミ', color: '#9370DB', hideWhenFlag: 'yami_joined',
              dialog: 'ここがAIの裏側さ。…お前、面白い力を持ってるな。' },
            { x: 7, y: 6, name: 'レジスタンス', color: '#FF4500', dialog: 'アークを倒す...それが俺たちの使命だ' },
            { x: 17, y: 6, name: '情報屋', color: '#DAA520', dialog: '何か知りたいことは？タダじゃないがね。' }
        ],
        obstacles: [
            { x: 4, y: 3, width: 3, height: 2, name: '武器庫' },
            { x: 17, y: 3, width: 3, height: 2, name: '物資' }
        ],
        portals: [
            { x: 10, y: 0, width: 4, height: 1, direction: 'top', target: 'shibuya_street', targetDir: 'bottom', label: '↑ 表通りへ' },
            { x: 23, y: 4, width: 1, height: 4, direction: 'right', target: 'botanical_garden', targetDir: 'left', label: '植物園へ →' }
        ]
    },

    // ── 植物園（リク／オオクニヌシ・第4章） ──────────────────
    botanical_garden: {
        name: '植物園 - 人工楽園',
        description: 'ガラスドームに包まれた、作り物の自然',
        walkCount: 150, encounterRate: 20, bgColor: '#10301a',
        npcs: [
            { x: 12, y: 6, name: 'リク', color: '#32CD32', hideWhenFlag: 'riku_joined',
              dialog: '外の世界…本当の自然って、どんなだろう。' },
            { x: 7, y: 5, name: '管理ドローン', color: '#87CEEB', dialog: '植生ハ最適ニ管理サレテイマス。' }
        ],
        obstacles: [
            { x: 16, y: 4, width: 4, height: 3, name: '巨樹' }
        ],
        portals: [
            { x: 0, y: 4, width: 1, height: 4, direction: 'left', target: 'underground_market', targetDir: 'right', label: '← 闇市へ' }
        ]
    },

    // ── 都庁・管理センター（第5章・潜入） ──────────────────
    city_hall: {
        name: '都庁 - 管理センター',
        description: 'アークの制御中枢へ通じる場所',
        walkCount: 150, encounterRate: 25, bgColor: '#1a2a3a',
        npcs: [
            { x: 12, y: 7, name: 'AI管理官', color: '#00CED1', dialog: 'アークの意志に従え...それが最適だ...' }
        ],
        obstacles: [
            { x: 10, y: 3, width: 4, height: 2, name: '制御装置' }
        ],
        portals: [
            { x: 0, y: 4, width: 1, height: 4, direction: 'left', target: 'shibuya_shopping', targetDir: 'right', label: '← モールへ' },
            { x: 23, y: 4, width: 1, height: 4, direction: 'right', target: 'arc_core', targetDir: 'left', label: 'アーク中枢へ →', requireItem: 'access_card' }
        ]
    },

    // ── アーク中枢（終局） ─────────────────────────────────
    arc_core: {
        name: 'アーク中枢 - 神々の座',
        description: '光のデータが流れる、AIの意識の最深部',
        walkCount: 0, encounterRate: 0, bgColor: '#0a1530',
        npcs: [
            { x: 12, y: 6, name: 'アーク', color: '#cfe8ff', hideWhenFlag: 'game_cleared',
              dialog: '私は人類を最適化した。…君たちは、なぜ抗うのか？' }
        ],
        obstacles: [
            { x: 10, y: 2, width: 4, height: 3, name: 'サーバーコア' }
        ],
        portals: [
            { x: 0, y: 4, width: 1, height: 4, direction: 'left', target: 'city_hall', targetDir: 'right', label: '← 都庁へ' }
        ]
    }
};
