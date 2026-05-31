// ========================================================================
// data/shops.js — 店／宿の定義。maps の NPC に shopId で紐付ける。
// ========================================================================
// type: 'shop' … stock のアイテムを売買。stock は ID 文字列または
//                 { id, requireFlag } の配列（フラグが立つまで店頭に並ばない）。
//        'inn'  … cost を払って HP/MP 全回復

const shops = {
    // 武器屋：依人が加入するたび、その専用武器が解放される
    ryou: { type: 'shop', title: '武器屋 リョウ', stock: [
        'kamui_bat',
        { id: 'miko_staff',     requireFlag: 'akari_joined' },
        { id: 'hack_device',    requireFlag: 'yami_joined' },
        { id: 'ancient_shield', requireFlag: 'riku_joined' }
    ] },

    // 道具屋：序盤の基本品。お守り（戦闘不能復活）は中盤から
    sakura: { type: 'shop', title: '道具屋 サクラ', stock: [
        'onigiri',
        { id: 'omamori', requireFlag: 'memory_found' }
    ] },

    // 道具屋：MP・回復系。神社のお札は記憶チップ入手後（中盤）から
    yuki: { type: 'shop', title: '道具屋 ユウキ', stock: [
        'onigiri', 'energy_drink',
        { id: 'shrine_fuda', requireFlag: 'memory_found' }
    ] },

    // 神威屋：神が揃っていくに応じて、ブースターが順次解禁
    mikoto: { type: 'shop', title: '神威屋 ミコト', stock: [
        'raiseki',
        { id: 'taiyo_drop',   requireFlag: 'akari_joined' },
        { id: 'tsuki_powder', requireFlag: 'yami_joined' },
        { id: 'daichi_seed',  requireFlag: 'riku_joined' }
    ] },

    inn_shinjuku: { type: 'inn', cost: 20, line: 'ゆっくり休んでいきな。（HP/MP全回復・20G）' }
};
