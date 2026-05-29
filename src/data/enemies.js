// ========================================================================
// data/enemies.js — 敵DB + 章別エンカウント表（image_prompts/02 準拠）
// ========================================================================
// 難度順: ウォッチャー → ケルベロス(中ボス) → ダスト・ゴーレム
//        → アルラウネ(ボス) → ドミニオン(精鋭) → コンストラクト(ボス) → アーク(最終)
// drops: [{ id, rate }]（rate=0..1）

const enemies = {
    watcher: {
        name: 'ウォッチャー', hp: 24, atk: 8, def: 3, spd: 9, exp: 5, gold: 8,
        skills: [], drops: [{ id: 'energy_drink', rate: 0.2 }],
        color: '#ff4444', sprite: 'sphere'
    },
    dust_golem: {
        name: 'ダスト・ゴーレム', hp: 90, atk: 16, def: 12, spd: 4, exp: 24, gold: 40,
        skills: [], drops: [{ id: 'onigiri', rate: 0.3 }],
        color: '#7a6a4a', sprite: 'golem'
    },
    dominion: {
        name: 'ドミニオン', hp: 140, atk: 22, def: 14, spd: 13, exp: 55, gold: 90, elite: true,
        skills: [], drops: [{ id: 'access_card', rate: 1.0 }],
        color: '#eeeeee', sprite: 'commander'
    },

    // ── ボス（エンカウント表には載せず、章イベントから出現） ──
    cerberus: {
        name: 'ケルベロス', hp: 160, atk: 18, def: 8, spd: 11, exp: 60, gold: 120, boss: true,
        skills: [], drops: [{ id: 'memory_chip', rate: 1.0 }],
        color: '#222222', sprite: 'wolf'
    },
    alraune: {
        name: 'アルラウネ', hp: 200, atk: 18, def: 8, spd: 8, exp: 90, gold: 160, boss: true,
        skills: [], drops: [{ id: 'shinki_shard', rate: 1.0 }],
        color: '#33aa88', sprite: 'tree'
    },
    construct: {
        name: 'コンストラクト', hp: 300, atk: 24, def: 16, spd: 10, exp: 200, gold: 400, boss: true,
        skills: [], drops: [{ id: 'shrine_fuda', rate: 1.0 }],
        color: '#8888ff', sprite: 'spider'
    },
    arc: {
        name: 'アーク', hp: 420, atk: 26, def: 18, spd: 14, exp: 0, gold: 0, boss: true, finalForm: true,
        skills: [], drops: [],
        color: '#cfe8ff', sprite: 'core'
    }
};

// 章ごとのランダムエンカウント（ボスは含めない）。w=重み。1〜3体出現。
const encounterTables = {
    1: [],                                                   // 第1章はチュートリアルのみ（乱戦なし）
    2: [{ e: 'watcher', w: 70 }, { e: 'dust_golem', w: 30 }],
    3: [{ e: 'watcher', w: 50 }, { e: 'dust_golem', w: 50 }],
    4: [{ e: 'dust_golem', w: 60 }, { e: 'watcher', w: 40 }],
    5: [{ e: 'dominion', w: 30 }, { e: 'dust_golem', w: 40 }, { e: 'watcher', w: 30 }],
    6: [{ e: 'dominion', w: 100 }]
};
