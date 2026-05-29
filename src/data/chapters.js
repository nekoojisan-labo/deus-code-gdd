// ========================================================================
// data/chapters.js — 章・クエスト・トリガー定義（ストーリーの背骨）
// ========================================================================
// 各章は story.chapter === id のときだけトリガー判定される（一度だけ発火）。
// trigger.type: 'talk'（npc名一致）/ 'enter'（map入場）
//   requireFlags / forbidFlags … 追加条件（任意）
// event: イベントID（文字列 or 配列）。story.js のディスパッチャが解決:
//   cutscene:<id> / battle:<enemyId> / recruit:<memberId> / flag:<name> / map:<id>@dir
// onComplete: { setFlags?, nextChapter?, setObjective? } 連鎖完了後に適用

const chapters = [
    {
        id: 1, title: '第一章 覚醒',
        objective: { text: '街で情報を集めよう（ギルドマスターに話しかける）', targetMap: 'shinjuku_central', targetNpc: 'ギルドマスター' },
        trigger: { type: 'talk', npc: 'ギルドマスター' },
        event: ['cutscene:ch1_brief', 'battle:watcher'],
        onComplete: {
            nextChapter: 2,
            setObjective: { text: '神社へ向かい、神の気配を追え', targetMap: 'shrine_grounds', targetNpc: 'アカリ' }
        }
    },
    {
        id: 2, title: '第二章 光を継ぐ者',
        objective: { text: '神社へ向かい、神の気配を追え', targetMap: 'shrine_grounds', targetNpc: 'アカリ' },
        trigger: { type: 'enter', map: 'shrine_grounds' },
        event: ['cutscene:akari_awaken', 'recruit:akari', 'battle:cerberus'],
        onComplete: {
            nextChapter: 3,
            setObjective: { text: '地下闇市でレジスタンスのヤミと接触せよ', targetMap: 'underground_market', targetNpc: 'ヤミ' }
        }
    },
    {
        id: 3, title: '第三章 月下の同盟',
        objective: { text: '地下闇市でレジスタンスのヤミと接触せよ', targetMap: 'underground_market', targetNpc: 'ヤミ' },
        trigger: { type: 'talk', npc: 'ヤミ', map: 'underground_market' },
        event: ['cutscene:yami_join', 'recruit:yami'],
        onComplete: {
            nextChapter: 4,
            setObjective: { text: '植物園のリクを保護せよ', targetMap: 'botanical_garden', targetNpc: 'リク' }
        }
    },
    {
        id: 4, title: '第四章 大地の守人',
        objective: { text: '植物園のリクを保護せよ', targetMap: 'botanical_garden', targetNpc: 'リク' },
        trigger: { type: 'enter', map: 'botanical_garden' },
        event: ['cutscene:riku_awaken', 'recruit:riku', 'battle:alraune'],
        onComplete: {
            nextChapter: 5,
            setObjective: { text: '都庁に潜入し、アーク中枢への道を探せ', targetMap: 'city_hall', targetNpc: 'AI管理官' }
        }
    },
    {
        id: 5, title: '第五章 都庁潜入',
        objective: { text: '都庁に潜入し、アーク中枢への道を探せ', targetMap: 'city_hall', targetNpc: 'AI管理官' },
        trigger: { type: 'enter', map: 'city_hall' },
        event: ['cutscene:cityhall', 'battle:dominion'],
        onComplete: {
            nextChapter: 6,
            setObjective: { text: 'アクセスカードでアーク中枢へ。アークを止めろ', targetMap: 'arc_core', targetNpc: 'アーク' }
        }
    },
    {
        id: 6, title: '終章 八百万の神託',
        objective: { text: 'アクセスカードでアーク中枢へ。アークを止めろ', targetMap: 'arc_core', targetNpc: 'アーク' },
        trigger: { type: 'enter', map: 'arc_core' },
        event: ['cutscene:arc_intro', 'battle:construct', 'cutscene:arc_mid', 'battle:arc', 'cutscene:ending'],
        onComplete: {
            setFlags: ['game_cleared'],
            nextChapter: 7,
            setObjective: { text: '― 物語をクリアした。新たな朝が来る ―', targetMap: null, targetNpc: null }
        }
    }
];

// id から章定義を引く
function getChapter(id) {
    return chapters.find(c => c.id === id) || null;
}
