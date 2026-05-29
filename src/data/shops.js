// ========================================================================
// data/shops.js — 店／宿の定義。maps の NPC に shopId で紐付ける。
// ========================================================================
// type: 'shop' … stock のアイテムを売買
//        'inn'  … cost を払って HP/MP 全回復

const shops = {
    ryou:   { type: 'shop', title: '武器屋 リョウ',   stock: ['kamui_bat', 'miko_staff', 'hack_device', 'ancient_shield'] },
    sakura: { type: 'shop', title: '道具屋 サクラ',   stock: ['onigiri', 'omamori'] },
    yuki:   { type: 'shop', title: '道具屋 ユウキ',   stock: ['onigiri', 'energy_drink', 'shrine_fuda'] },
    mikoto: { type: 'shop', title: '神威屋 ミコト',   stock: ['raiseki', 'taiyo_drop', 'tsuki_powder', 'daichi_seed'] },

    inn_shinjuku: { type: 'inn', cost: 20, line: 'ゆっくり休んでいきな。（HP/MP全回復・20G）' }
};
