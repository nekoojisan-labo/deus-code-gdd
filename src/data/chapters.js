// ========================================================================
// data/chapters.js — 章・クエスト・トリガー定義（ストーリーの背骨）
// ========================================================================
// 各章は story.chapter === id のときだけトリガー判定される（一度だけ発火）。
// trigger.type: 'talk'（npc名一致）/ 'enter'（map入場）
//   requireFlags / forbidFlags … 追加条件（任意）
// event: イベントID（文字列 or 配列）。story.js のディスパッチャが解決:
//   cutscene:<id> / battle:<enemyId> / recruit:<memberId> / flag:<name> / map:<id>@dir
//   配列は順番に逐次実行（戦闘や会話の前後に繋ぎの場面を差し込める）。
// onComplete: { setFlags?, nextChapter?, setObjective? } 連鎖完了後に適用
//
// ◆繋ぎの設計◆ 戦闘の前後にカットシーンを挟み、「なぜ次へ向かうのか」を
//   毎章はっきりさせる。flag:* で世界（NPC会話）に進行を反映する。

const chapters = [
    {
        id: 1, title: '第一章 覚醒',
        objective: { text: '街で情報を集めよう（ギルドマスターに話しかける）', targetMap: 'shinjuku_central', targetNpc: 'ギルドマスター' },
        trigger: { type: 'talk', npc: 'ギルドマスター' },
        event: ['cutscene:ch1_brief', 'battle:watcher', 'cutscene:ch1_after', 'flag:knows_truth_arc'],
        onComplete: {
            nextChapter: 2,
            setObjective: { text: '南の神社へ向かい、同じ力を持つ者を探せ', targetMap: 'shrine_grounds', targetNpc: 'アカリ' }
        }
    },
    {
        id: 2, title: '第二章 光を継ぐ者',
        objective: { text: '南の神社へ向かい、同じ力を持つ者を探せ', targetMap: 'shrine_grounds', targetNpc: 'アカリ' },
        trigger: { type: 'enter', map: 'shrine_grounds' },
        event: ['cutscene:akari_intro', 'cutscene:akari_awaken', 'recruit:akari',
                'cutscene:cerberus_pre', 'battle:cerberus', 'cutscene:ch2_after', 'flag:memory_found'],
        onComplete: {
            nextChapter: 3,
            setObjective: { text: '地下闇市へ。チップを解析できるレジスタンスを探せ', targetMap: 'underground_market', targetNpc: 'ヤミ' }
        }
    },
    {
        id: 3, title: '第三章 月下の同盟',
        objective: { text: '地下闇市へ。チップを解析できるレジスタンスを探せ', targetMap: 'underground_market', targetNpc: 'ヤミ' },
        trigger: { type: 'talk', npc: 'ヤミ', map: 'underground_market' },
        event: ['cutscene:yami_intro', 'cutscene:yami_awaken', 'recruit:yami',
                'cutscene:yami_chip', 'flag:haru_revealed'],
        onComplete: {
            nextChapter: 4,
            setObjective: { text: '植物園へ。眠るもう一柱の神（リク）を迎えに行け', targetMap: 'botanical_garden', targetNpc: 'リク' }
        }
    },
    {
        id: 4, title: '第四章 大地の守人',
        objective: { text: '植物園へ。眠るもう一柱の神（リク）を迎えに行け', targetMap: 'botanical_garden', targetNpc: 'リク' },
        trigger: { type: 'enter', map: 'botanical_garden' },
        event: ['cutscene:riku_intro', 'cutscene:riku_awaken', 'recruit:riku',
                'cutscene:alraune_pre', 'battle:alraune', 'cutscene:ch4_after', 'flag:has_scripture'],
        onComplete: {
            nextChapter: 5,
            setObjective: { text: '四柱は揃った。都庁を抜け、アーク中枢への道を開け', targetMap: 'city_hall', targetNpc: 'AI管理官' }
        }
    },
    {
        id: 5, title: '第五章 善意の檻',
        objective: { text: '四柱は揃った。都庁を抜け、アーク中枢への道を開け', targetMap: 'city_hall', targetNpc: 'AI管理官' },
        trigger: { type: 'enter', map: 'city_hall' },
        event: ['cutscene:cityhall_intro', 'cutscene:cityhall_reveal', 'flag:arc_truth',
                'battle:dominion', 'cutscene:ch5_after'],
        onComplete: {
            nextChapter: 6,
            setObjective: { text: 'アクセスカードでアーク中枢へ。決着をつけろ', targetMap: 'arc_core', targetNpc: 'アーク' }
        }
    },
    {
        id: 6, title: '終章 八百万の神託',
        objective: { text: 'アクセスカードでアーク中枢へ。決着をつけろ', targetMap: 'arc_core', targetNpc: 'アーク' },
        trigger: { type: 'enter', map: 'arc_core' },
        event: ['cutscene:arc_intro', 'battle:construct', 'cutscene:arc_debate', 'battle:arc', 'cutscene:ending'],
        onComplete: {
            setFlags: ['game_cleared'],
            nextChapter: 7,
            setObjective: { text: '― 心を取り戻した街に、新しい朝が訪れた ―', targetMap: null, targetNpc: null }
        }
    }
];

// id から章定義を引く
function getChapter(id) {
    return chapters.find(c => c.id === id) || null;
}
