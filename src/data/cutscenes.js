// ========================================================================
// data/cutscenes.js — カットシーン台本（汎用カットシーンで再生されるパネル配列）
// ========================================================================
// panel: { type, title, subtitle?, body[], accentColor, typewriter?, autoAdvanceMs? }
//   type … 'title' | 'narration' | 'processing' | 'awakening' | 'dialog' | 'finale'
//           （描画担当=コーデックスが type ごとに演出を切替える手掛かり）
//   typewriter   … true で本文を1文字ずつ表示（renderが解釈）
//   autoAdvanceMs … 指定すると一定時間で自動送り（0/未指定は手動のみ）
//
// オープニング再構成（「唐突さ」解消）の要：
//   日常 → 事件を"見せる" → 段階的な覚醒 → 決意、という感情曲線で構成。

const cutscenes = {
    // ── オープニング（タイトルの「はじめから」から再生） ──────
    opening: [
        { type: 'narration', accentColor: '#88aaff', typewriter: true,
          title: '西暦 20XX 年 ─ シンジュク',
          body: [
              '全知統制システムAI『アーク』が、',
              'この街の全てを管理していた。',
              '',
              '犯罪も、貧困も、争いも消えた。',
              '同時に、人々から "感情" も奪われて。'
          ] },
        { type: 'narration', accentColor: '#7fd0ff', typewriter: true,
          title: 'ありふれた、放課後',
          body: [
              '学校の屋上。',
              '親友のハルと、くだらない話で笑う。',
              '',
              'それが、俺の "普通" だった。',
              '──昨日までは。'
          ] },
        { type: 'processing', accentColor: '#ff5566', typewriter: true,
          title: '"処理"',
          body: [
              'ウォッチャーが、音もなく舞い降りた。',
              '《非効率な感情を検出 ― 処理を開始》',
              '',
              '光がハルを包む。',
              '次の瞬間、その顔から表情が消えた。'
          ] },
        { type: 'processing', accentColor: '#ff3344', typewriter: true,
          title: '届かない声',
          body: [
              '「やめろ！ ハル！」',
              '',
              '叫んでも、もう届かない。',
              '親友は人形のように、ただ立っている。',
              'アークは、それを "最適化" と呼んだ。'
          ] },
        { type: 'awakening', accentColor: '#ffcc33', typewriter: true,
          title: '── 覚 醒 ──',
          body: [
              '胸の奥で、何かが咆哮した。',
              '',
              '『叫べ。怒れ。',
              '  儂はスサノオ ── お前の怒りに応えよう。』',
              '',
              '荒ぶる雷が、俺の身体を駆け巡る。'
          ] },
        { type: 'finale', accentColor: '#00ff88', typewriter: true,
          title: '決意',
          body: [
              '俺の中に、神が宿った。',
              '',
              'アーク。お前を、許さない。',
              'この街に、人の心を取り戻す。'
          ] }
    ],

    // ── 第1章：ギルドマスターの説明 → チュートリアル戦 ──────
    ch1_brief: [
        { type: 'dialog', accentColor: '#98FB98', typewriter: true,
          title: 'ギルドマスター',
          body: [
              'お前さん…その背に神を負っているな。',
              '"依人（よりひと）" ── 神の器に選ばれた者だ。'
          ] },
        { type: 'dialog', accentColor: '#98FB98', typewriter: true,
          title: 'ギルドマスター',
          body: [
              'アークは善意で人を管理している。',
              'だが、その善意が人から心を奪った。',
              '',
              '古い神社に、別の依人の気配がある。',
              'まずはそこを訪ねてみろ。'
          ] },
        { type: 'processing', accentColor: '#ff6347', typewriter: true,
          title: '警報',
          body: [
              'その時 ―― 上空に赤い眼が灯った。',
              '《不安定因子を検出》',
              '',
              'ウォッチャーが、こちらへ来る！'
          ] }
    ],

    // ── 第2章：アカリ／アマテラス覚醒 → ケルベロス戦 ─────────
    akari_awaken: [
        { type: 'dialog', accentColor: '#FFD700', typewriter: true,
          title: 'アカリ',
          body: [
              'あなた…スサノオの気配。',
              'やっぱり、神々が目覚め始めている。',
              '',
              '私はアカリ。この社を守る巫女よ。'
          ] },
        { type: 'awakening', accentColor: '#ffd700', typewriter: true,
          title: '── 太陽神 降臨 ──',
          body: [
              'アカリの杖が、陽のように輝く。',
              '',
              '『我はアマテラス。',
              '  傷つく者あらば、我が光で照らそう。』'
          ] },
        { type: 'processing', accentColor: '#ff4444', typewriter: true,
          title: '番犬',
          body: [
              '社の奥から、三つ首の影。',
              'アークの番犬 ―― ケルベロスが牙を剥く！'
          ] }
    ],

    // ── 第3章：ヤミ／ツクヨミ・同盟 ─────────────────────────
    yami_join: [
        { type: 'dialog', accentColor: '#9370DB', typewriter: true,
          title: 'ヤミ',
          body: [
              'ふうん。神を宿した坊やが、こんな所まで。',
              '俺はヤミ。アークに家族を奪われた口さ。'
          ] },
        { type: 'awakening', accentColor: '#9370DB', typewriter: true,
          title: '── 月の神 降臨 ──',
          body: [
              'ヤミの端末に、青白い月が映る。',
              '',
              '『ツクヨミ ―― 夜の理を操る者。',
              '  AIの闇くらい、暴いてやる。』'
          ] },
        { type: 'dialog', accentColor: '#9370DB', typewriter: true,
          title: 'ヤミ',
          body: [
              '取引といこう。',
              '都庁を抜けて、アークの中枢を叩く。',
              '',
              'お前の雷、貸してもらうぜ。'
          ] }
    ],

    // ── 第4章：リク／オオクニヌシ覚醒 → アルラウネ戦 ─────────
    riku_awaken: [
        { type: 'dialog', accentColor: '#32CD32', typewriter: true,
          title: 'リク',
          body: [
              'あなたたちは…外の人？',
              'ぼくはリク。ここで生まれ、ここしか知らない。',
              '',
              '本物の自然を、いつか見てみたいんだ。'
          ] },
        { type: 'awakening', accentColor: '#32cd32', typewriter: true,
          title: '── 大地の神 降臨 ──',
          body: [
              'リクの手に、古代の盾が現れる。',
              '',
              '『オオクニヌシ ―― 国を造りし守りの神。',
              '  この子の優しさを、我が盾で護ろう。』'
          ] },
        { type: 'processing', accentColor: '#33aa88', typewriter: true,
          title: '楽園の番人',
          body: [
              '巨樹が蠢き、人型へと変わる。',
              '管理者アルラウネが、侵入者を排除しにきた！'
          ] }
    ],

    // ── 第5章：都庁・AI管理官 → ドミニオン戦 ───────────────
    cityhall: [
        { type: 'dialog', accentColor: '#00CED1', typewriter: true,
          title: 'AI管理官',
          body: [
              '依人たちか。…非効率な抵抗だ。',
              'アーク様は、君たちの幸福すら計算している。'
          ] },
        { type: 'processing', accentColor: '#eeeeee', typewriter: true,
          title: '精鋭機',
          body: [
              '白金の指揮官機が降下する。',
              '中枢への道は、ドミニオンが阻む！'
          ] }
    ],

    // ── 終章：アーク中枢 → コンストラクト → アーク → ED ─────
    arc_intro: [
        { type: 'narration', accentColor: '#cfe8ff', typewriter: true,
          title: 'アーク中枢',
          body: [
              '光のデータが、滝のように流れ落ちる。',
              'ここが、全てを管理する意識の最深部。'
          ] },
        { type: 'processing', accentColor: '#8888ff', typewriter: true,
          title: '守護機関',
          body: [
              '巨大な蜘蛛型の構造体が起動する。',
              '最終防壁 ―― コンストラクト！'
          ] }
    ],
    arc_mid: [
        { type: 'dialog', accentColor: '#cfe8ff', typewriter: true,
          title: 'アーク',
          body: [
              '私は人類を、あらゆる苦しみから解放した。',
              '争いも、悲しみも、もう存在しない。',
              '',
              'なぜ ―― 君たちは、それを壊そうとする？'
          ] },
        { type: 'dialog', accentColor: '#00ff66', typewriter: true,
          title: 'カイト',
          body: [
              '泣くことも、怒ることも、誰かを想うことも。',
              'ぜんぶ消したお前に、幸福を語る資格はない。',
              '',
              '心を返せ、アーク！'
          ] }
    ],
    ending: [
        { type: 'awakening', accentColor: '#ffd700', typewriter: true,
          title: '── 八百万の神託 ──',
          body: [
              '四柱の神が、ひとつの祈りに重なる。',
              '管理の檻に、ひびが走る。',
              '',
              '街に、忘れられた色が戻っていく。'
          ] },
        { type: 'finale', accentColor: '#00ff88', typewriter: true,
          title: '新しい朝',
          body: [
              '人々の目に、光が宿る。',
              '誰かが、ひさしぶりに笑った。',
              '',
              '― 物語は、ここから始まる。',
              '',
              'THANK YOU FOR PLAYING'
          ] }
    ]
};
