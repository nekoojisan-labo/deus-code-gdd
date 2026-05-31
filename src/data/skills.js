// ========================================================================
// data/skills.js — 神威（カムイ）データ。神ごとのスキル定義。
// ========================================================================
// target 種別:
//   'one'        … 敵1体
//   'allEnemies' … 敵全体
//   'oneAlly'    … 味方1体
//   'allAllies'  … 味方全体
//   'self'       … 自分
// type 種別: damage / heal / buff / debuff / shield / stun / cleanse / taunt

const skills = {
    // ── スサノオ（カイト／攻撃・雷） ───────────────────────────
    raimei:        { name: '雷鳴斬',   god: 'スサノオ', mpCost: 6,  power: 22, type: 'damage', target: 'one',        element: 'thunder', desc: '雷を帯びた一閃。敵1体に雷ダメージ' },
    narukami:      { name: '鳴神',     god: 'スサノオ', mpCost: 14, power: 26, type: 'damage', target: 'allEnemies', element: 'thunder', desc: '敵全体に雷ダメージ' },
    amenomurakumo: { name: '天叢雲',   god: 'スサノオ', mpCost: 24, power: 60, type: 'damage', target: 'one',        element: 'thunder', crit: 0.3, desc: '神剣の一撃。高威力・高会心' },

    // ── アマテラス（アカリ／回復・浄化） ──────────────────────
    hikari: { name: '陽の癒し',   god: 'アマテラス', mpCost: 8,  power: 40, type: 'heal',    target: 'oneAlly',  desc: '味方1体のHPを回復' },
    taiyo:  { name: '太陽の恵み', god: 'アマテラス', mpCost: 18, power: 32, type: 'heal',    target: 'allAllies', desc: '味方全体のHPを回復' },
    harae:  { name: '祓い',       god: 'アマテラス', mpCost: 10,            type: 'cleanse', target: 'oneAlly',  desc: '味方1体の弱体・状態異常を解除' },

    // ── ツクヨミ（ヤミ／魔法・妨害） ──────────────────────────
    tsukikage:   { name: '月影',             god: 'ツクヨミ', mpCost: 10, power: 28, type: 'damage', target: 'one', element: 'dark', desc: '敵1体に闇ダメージ' },
    hack_def:    { name: 'システム解析',      god: 'ツクヨミ', mpCost: 8,             type: 'debuff', target: 'one', stat: 'def', amount: -0.3, desc: '敵1体の防御を低下' },
    hack_freeze: { name: '強制シャットダウン', god: 'ツクヨミ', mpCost: 20,            type: 'stun',   target: 'one', chance: 0.6, desc: '敵1体を一定確率で行動停止' },

    // ── オオクニヌシ（リク／防御・守護） ──────────────────────
    taunt:   { name: '挑発',       god: 'オオクニヌシ', mpCost: 4,             type: 'taunt',  target: 'self',      desc: '敵の攻撃を自分に引きつける' },
    iwakabe: { name: '岩壁',       god: 'オオクニヌシ', mpCost: 8,             type: 'buff',   target: 'allAllies', stat: 'def', amount: 0.4, desc: '味方全体の防御を上昇' },
    daichi:  { name: '大地の守り', god: 'オオクニヌシ', mpCost: 14, power: 40, type: 'shield', target: 'allAllies', desc: '味方全体にダメージ吸収シールド' }
};
