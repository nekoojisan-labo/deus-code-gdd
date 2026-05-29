// ========================================================================
// data/items.js — アイテムDB（image_prompts/04 準拠）
// ========================================================================
// type: recovery / weapon / keyitem / booster
// useIn: 'both' | 'battle' | 'field'（recovery のみ）
// ownerId: weapon の装備可能キャラ
// effect: recovery の効果 { hp?, mp?, revive? }
// boost: booster の永続強化 { god, maxHp?|maxMp?|atk?|mag? }

const items = {
    // ── 回復 ──────────────────────────────────────────────
    onigiri:      { name: 'おにぎり',         type: 'recovery', effect: { hp: 50 },        price: 30,  rarity: 'common', useIn: 'both',   desc: 'HPを50回復する' },
    energy_drink: { name: 'エナジードリンク', type: 'recovery', effect: { mp: 30 },        price: 40,  rarity: 'common', useIn: 'both',   desc: 'MPを30回復する' },
    shrine_fuda:  { name: '神社のお札',       type: 'recovery', effect: { hp: 80, mp: 30 }, price: 120, rarity: 'rare',   useIn: 'both',   desc: 'HP80・MP30を回復する' },
    omamori:      { name: 'お守り',           type: 'recovery', effect: { revive: 0.5 },   price: 200, rarity: 'rare',   useIn: 'battle', desc: '戦闘不能の味方をHP半分で復活' },

    // ── 武器（ownerId 専用・店売りは基本0Gで初期装備） ──────
    kamui_bat:      { name: '神威バット',           type: 'weapon', ownerId: 'kaito', atk: 8,         price: 300, rarity: 'rare', desc: 'カイト専用。雷を帯びた金属バット' },
    miko_staff:     { name: '巫女の杖',             type: 'weapon', ownerId: 'akari', mag: 8,         price: 300, rarity: 'rare', desc: 'アカリ専用。神聖な水晶を戴く杖' },
    hack_device:    { name: 'ハッキングデバイス',   type: 'weapon', ownerId: 'yami',  mag: 6, spd: 3, price: 300, rarity: 'rare', desc: 'ヤミ専用。腕装着型の侵入端末' },
    ancient_shield: { name: '古代の盾',             type: 'weapon', ownerId: 'riku',  def: 10,        price: 300, rarity: 'rare', desc: 'リク専用。古代文様の大盾' },

    // ── キーアイテム（売却不可・qty1） ─────────────────────
    memory_chip:  { name: '記憶チップ',   type: 'keyitem', rarity: 'epic',      desc: '人間の記憶の断片が刻まれたチップ' },
    shinki_shard: { name: '神器の欠片',   type: 'keyitem', rarity: 'legendary', desc: '神の力を宿す輝く欠片' },
    access_card:  { name: 'アクセスカード', type: 'keyitem', rarity: 'rare',     desc: '都庁の制限区域を開ける認証カード' },
    ancient_text: { name: '古文書',       type: 'keyitem', rarity: 'epic',      desc: '神々と覚醒の秘儀を記した古文書' },

    // ── 神威ブースター（永続強化） ─────────────────────────
    raiseki:      { name: '雷の石',   type: 'booster', boost: { god: 'スサノオ',   maxMp: 5 },  price: 150, rarity: 'rare', desc: 'スサノオの最大MP+5' },
    taiyo_drop:   { name: '太陽の雫', type: 'booster', boost: { god: 'アマテラス', maxMp: 5 },  price: 150, rarity: 'rare', desc: 'アマテラスの最大MP+5' },
    tsuki_powder: { name: '月の粉',   type: 'booster', boost: { god: 'ツクヨミ',   mag: 2 },    price: 150, rarity: 'rare', desc: 'ツクヨミの魔力+2' },
    daichi_seed:  { name: '大地の種', type: 'booster', boost: { god: 'オオクニヌシ', maxHp: 10 }, price: 150, rarity: 'rare', desc: 'オオクニヌシの最大HP+10' }
};
