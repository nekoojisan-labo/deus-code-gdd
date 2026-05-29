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
        atk: 14, def: 6, mag: 6, spd: 10,
        growth: { hp: 12, mp: 4, atk: 3, def: 2, mag: 2, spd: 1 },
        equipped: { weapon: 'kamui_bat' },
        learned: ['raimei'],
        skillTree: [{ id: 'raimei', level: 1 }, { id: 'narukami', level: 5 }, { id: 'amenomurakumo', level: 12 }],
        inParty: true, recruitFlag: 'kaito_joined'
    },
    akari: {
        id: 'akari', name: 'アカリ', god: 'アマテラス', role: 'healer', color: '#FFD700',
        level: 3, exp: 0, expNext: 18,
        hp: 80, maxHp: 80, mp: 70, maxMp: 70,
        atk: 8, def: 5, mag: 14, spd: 9,
        growth: { hp: 8, mp: 6, atk: 1, def: 2, mag: 3, spd: 1 },
        equipped: { weapon: 'miko_staff' },
        learned: ['hikari'],
        skillTree: [{ id: 'hikari', level: 3 }, { id: 'harae', level: 5 }, { id: 'taiyo', level: 9 }],
        inParty: false, recruitFlag: 'akari_joined'
    },
    yami: {
        id: 'yami', name: 'ヤミ', god: 'ツクヨミ', role: 'mage', color: '#9370DB',
        level: 5, exp: 0, expNext: 26,
        hp: 90, maxHp: 90, mp: 80, maxMp: 80,
        atk: 9, def: 6, mag: 16, spd: 13,
        growth: { hp: 9, mp: 6, atk: 1, def: 2, mag: 3, spd: 2 },
        equipped: { weapon: 'hack_device' },
        learned: ['tsukikage', 'hack_def'],
        skillTree: [{ id: 'tsukikage', level: 5 }, { id: 'hack_def', level: 5 }, { id: 'hack_freeze', level: 10 }],
        inParty: false, recruitFlag: 'yami_joined'
    },
    riku: {
        id: 'riku', name: 'リク', god: 'オオクニヌシ', role: 'tank', color: '#32CD32',
        level: 7, exp: 0, expNext: 34,
        hp: 170, maxHp: 170, mp: 40, maxMp: 40,
        atk: 13, def: 15, mag: 5, spd: 6,
        growth: { hp: 16, mp: 3, atk: 2, def: 3, mag: 1, spd: 1 },
        equipped: { weapon: 'ancient_shield' },
        learned: ['taunt', 'iwakabe'],
        skillTree: [{ id: 'taunt', level: 7 }, { id: 'iwakabe', level: 7 }, { id: 'daichi', level: 11 }],
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
