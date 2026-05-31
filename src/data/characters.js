// ========================================================================
// data/characters.js — パーティメンバー雛形（依人＝神の器）
// ========================================================================
// newGame() / recruitMember() がこれを deepClone して party に積む。
// growth: レベルアップ時の各ステータス上昇量
// skillTree: { id, level } 到達レベルで learned に習得
// recruitFlag: 加入済みを示すストーリーフラグ

const characterTemplates = {
    kaito: {
        id: 'kaito', name: 'カイト', god: 'スサノオ', role: 'attacker', color: '#00ff66',
        level: 1, exp: 0, expNext: 12,
        hp: 100, maxHp: 100, mp: 50, maxMp: 50,
        atk: 16, def: 6, mag: 6, spd: 10,
        growth: { hp: 14, mp: 5, atk: 4, def: 2, mag: 2, spd: 1 },
        equipped: { weapon: 'kamui_bat' },
        learned: ['raimei'],
        skillTree: [{ id: 'raimei', level: 1 }, { id: 'narukami', level: 4 }, { id: 'amenomurakumo', level: 9 }],
        inParty: true, recruitFlag: 'kaito_joined'
    },
    akari: {
        id: 'akari', name: 'アカリ', god: 'アマテラス', role: 'healer', color: '#FFD700',
        level: 5, exp: 0, expNext: 22,
        hp: 110, maxHp: 110, mp: 90, maxMp: 90,
        atk: 10, def: 7, mag: 22, spd: 10,
        growth: { hp: 10, mp: 7, atk: 1, def: 2, mag: 4, spd: 1 },
        equipped: { weapon: 'miko_staff' },
        learned: ['hikari', 'harae'],
        skillTree: [{ id: 'hikari', level: 1 }, { id: 'harae', level: 5 }, { id: 'taiyo', level: 8 }],
        inParty: false, recruitFlag: 'akari_joined'
    },
    yami: {
        id: 'yami', name: 'ヤミ', god: 'ツクヨミ', role: 'mage', color: '#9370DB',
        level: 8, exp: 0, expNext: 32,
        hp: 140, maxHp: 140, mp: 110, maxMp: 110,
        atk: 12, def: 8, mag: 28, spd: 14,
        growth: { hp: 12, mp: 7, atk: 1, def: 2, mag: 4, spd: 2 },
        equipped: { weapon: 'hack_device' },
        learned: ['tsukikage', 'hack_def'],
        skillTree: [{ id: 'tsukikage', level: 1 }, { id: 'hack_def', level: 5 }, { id: 'hack_freeze', level: 10 }],
        inParty: false, recruitFlag: 'yami_joined'
    },
    riku: {
        id: 'riku', name: 'リク', god: 'オオクニヌシ', role: 'tank', color: '#32CD32',
        level: 11, exp: 0, expNext: 44,
        hp: 260, maxHp: 260, mp: 60, maxMp: 60,
        atk: 22, def: 22, mag: 6, spd: 7,
        growth: { hp: 20, mp: 3, atk: 3, def: 4, mag: 1, spd: 1 },
        equipped: { weapon: 'ancient_shield' },
        learned: ['taunt', 'iwakabe', 'daichi'],
        skillTree: [{ id: 'taunt', level: 1 }, { id: 'iwakabe', level: 5 }, { id: 'daichi', level: 11 }],
        inParty: false, recruitFlag: 'riku_joined'
    }
};

// 装備込みの実効ステータスを返す（atk/def/mag/spd）
function effStat(member, key) {
    let v = member[key] || 0;
    const wid = member.equipped && member.equipped.weapon;
    if (wid && items[wid] && items[wid][key]) v += items[wid][key];
    return v;
}
