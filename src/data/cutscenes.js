// ========================================================================
// data/cutscenes.js — カットシーン台本（汎用カットシーンで再生されるパネル配列）
// ========================================================================
// panel: { type, title, subtitle?, body[], accentColor, typewriter?, autoAdvanceMs? }
//   type … 'title' | 'narration' | 'processing' | 'awakening' | 'dialog' | 'finale'
//           （描画担当=コーデックスが type ごとに演出を切替える手掛かり）
//
// ◆構成方針：脈絡のある一本の物語にする◆
//   主軸：親友ハルの「記憶チップ」── 処理された人々はアーク中枢に"保管"されている、
//         という発見が全章を貫く目的になり、終章で回収される。
//   各章は「前の出来事が次の行動の動機になる」因果でつなぎ、戦闘の前後にも
//   繋ぎの場面を置く（＝唐突に次へ飛ばない）。

const cutscenes = {
    // ════════════════════════════════════════════════════════
    // オープニング（タイトルの「はじめから」から再生）
    // 日常 → 事件を"見せる" → 段階的な覚醒 → 決意
    // ════════════════════════════════════════════════════════
    opening: [
        { type: 'narration', accentColor: '#88aaff', typewriter: true,
          title: '西暦 20XX 年 ─ シンジュク',
          body: [
              '全知統制システムAI『アーク』が、',
              'この街の全てを管理していた。',
              '',
              '犯罪も、貧困も、争いも消えた。',
              'そして同時に、人々から "感情" も消えた。'
          ] },
        { type: 'narration', accentColor: '#7fd0ff', typewriter: true,
          title: 'ありふれた、放課後',
          body: [
              '学校の屋上。',
              '親友のハルと、くだらない話で笑う。',
              '',
              '「なあカイト、笑うのって…非効率かな？」',
              'それが、俺たちの "普通" だった。──昨日までは。'
          ] },
        { type: 'processing', accentColor: '#ff5566', typewriter: true,
          title: '"処理"',
          body: [
              'ウォッチャーが、音もなく舞い降りた。',
              '《非効率な感情を検出 ― 処理を開始します》',
              '',
              '青白い光が、ハルを包む。',
              '次の瞬間、その顔から、表情が消えた。'
          ] },
        { type: 'processing', accentColor: '#ff3344', typewriter: true,
          title: '届かない声',
          body: [
              '「やめろ！ ハル！ ハルッ！」',
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
              'ハルを ── みんなを、必ず取り戻す。'
          ] }
    ],

    // ════════════════════════════════════════════════════════
    // 第1章：ギルドマスターの導き → チュートリアル戦 → 旅立ち
    // ════════════════════════════════════════════════════════
    ch1_brief: [
        { type: 'dialog', accentColor: '#98FB98', typewriter: true,
          title: 'ギルドマスター',
          body: [
              'その背に神を負っているな。坊主。',
              '"依人（よりひと）" ── 神の器に選ばれた者だ。',
              '怒りや祈り、強い心が、眠る神を呼び覚ます。'
          ] },
        { type: 'dialog', accentColor: '#98FB98', typewriter: true,
          title: 'ギルドマスター',
          body: [
              '勘違いするな。アークは悪意で動いてはおらん。',
              '"善意" で人から苦しみを ── 心ごと奪ったのさ。',
              '',
              'だからこそ、誰も逆らえん。タチが悪いだろう？'
          ] },
        { type: 'dialog', accentColor: '#98FB98', typewriter: true,
          title: 'ギルドマスター',
          body: [
              '南の古い神社に、お前と同じ気配がある。',
              '一人では、アークには届かん。仲間を探せ。',
              '',
              'まずは ── その身に宿した力を、確かめてみろ。'
          ] },
        { type: 'processing', accentColor: '#ff6347', typewriter: true,
          title: '警報',
          body: [
              'その時 ── 頭上に、赤い眼が灯った。',
              '《不安定因子を検出。排除します》',
              '',
              'ウォッチャーが、こちらへ来る！'
          ] }
    ],
    ch1_after: [
        { type: 'dialog', accentColor: '#98FB98', typewriter: true,
          title: 'ギルドマスター',
          body: [
              'たいした雷だ。…が、これはほんの斥候にすぎん。',
              'アークは、これから本気でお前を消しにくる。'
          ] },
        { type: 'dialog', accentColor: '#00ff66', typewriter: true,
          title: 'カイト',
          body: [
              '構わない。俺は強くなって、アークの中枢まで行く。',
              'ハルを ── 処理された奴を、元に戻す方法を探すんだ。',
              '',
              'まずは南の神社。同じ力を持つ誰かに会いに行く。'
          ] }
    ],

    // ════════════════════════════════════════════════════════
    // 第2章：神社でアカリと出会う → 覚醒 → ケルベロス → 記憶チップ
    // ════════════════════════════════════════════════════════
    akari_intro: [
        { type: 'dialog', accentColor: '#FFD700', typewriter: true,
          title: 'アカリ',
          body: [
              'あなた…スサノオの気配。やっぱり来た。',
              '私はアカリ。この朽ちた社を守る、最後の巫女よ。',
              '',
              '神々は今、目覚め始めている。アークへの…抗いとして。'
          ] },
        { type: 'dialog', accentColor: '#FFD700', typewriter: true,
          title: 'アカリ',
          body: [
              'あなたの怒り、痛いほど伝わる。',
              'でも怒りだけでは、人は救えない。',
              '',
              '私の力 ── あなたに預けるわ。一緒に行かせて。'
          ] }
    ],
    akari_awaken: [
        { type: 'awakening', accentColor: '#ffd700', typewriter: true,
          title: '── 太陽神 降臨 ──',
          body: [
              'アカリが祈りのポーズを取る。',
              '杖の水晶が、太陽のように輝きはじめる。',
              '',
              '『我はアマテラス。慈愛をもって、',
              '  傷ついた者を照らそう。』'
          ] }
    ],
    cerberus_pre: [
        { type: 'processing', accentColor: '#ff4444', typewriter: true,
          title: '番犬',
          body: [
              '社の闇から、三つの赤い眼が浮かぶ。',
              '《依人の結合を確認。最優先で排除します》',
              '',
              'アークの番犬 ── ケルベロスが牙を剥いた！'
          ] }
    ],
    ch2_after: [
        { type: 'narration', accentColor: '#aaccff', typewriter: true,
          title: '残されたもの',
          body: [
              '砕けたケルベロスの中核から、',
              '小さなチップが転がり落ちた。',
              '',
              'それは、カイトの手の中で淡く脈打っている。'
          ] },
        { type: 'dialog', accentColor: '#FFD700', typewriter: true,
          title: 'アカリ',
          body: [
              'これ…ただのデータじゃない。',
              '人の "心" が、この中に閉じ込められてる。'
          ] },
        { type: 'dialog', accentColor: '#00ff66', typewriter: true,
          title: 'カイト',
          body: [
              '…ハル、なのか？ なあ、まだ消えてないのか！？',
              '読み取る方法は？ どうすればいい！'
          ] },
        { type: 'dialog', accentColor: '#FFD700', typewriter: true,
          title: 'アカリ',
          body: [
              '私には祈りしかない。…でも、データを暴く者がいる。',
              '地下闇市のレジスタンス。彼らならきっと。',
              '',
              '急ぎましょう。ハルの心が、消えてしまう前に。'
          ] }
    ],

    // ════════════════════════════════════════════════════════
    // 第3章：ヤミと同盟 → 覚醒 → チップ解析（核心の発見）→ 次の計画
    // ════════════════════════════════════════════════════════
    yami_intro: [
        { type: 'dialog', accentColor: '#9370DB', typewriter: true,
          title: 'ヤミ',
          body: [
              'ふうん。神を宿した坊やが、巫女まで連れて。',
              '俺はヤミ。このレジスタンスを束ねてる。',
              '',
              'アークに家族を奪われた…お前と同じ口さ。'
          ] },
        { type: 'dialog', accentColor: '#00ff66', typewriter: true,
          title: 'カイト',
          body: [
              'このチップを読んでほしい。親友の心が入ってる。',
              '頼む。…俺にはこれしか、手掛かりがないんだ。'
          ] },
        { type: 'dialog', accentColor: '#9370DB', typewriter: true,
          title: 'ヤミ',
          body: [
              'おもしろい。俺の中の神も、疼いてやがる。',
              'いいぜ、見せてやる ── 夜の理（ことわり）ってやつを。'
          ] }
    ],
    yami_awaken: [
        { type: 'awakening', accentColor: '#9370DB', typewriter: true,
          title: '── 月の神 降臨 ──',
          body: [
              'ヤミの指が、宙の鍵盤を駆ける。',
              '青白い月が、端末の海に昇る。',
              '',
              '『ツクヨミ ── 夜と月を統べる者。',
              '  アークの闇など、暴いてくれよう。』'
          ] }
    ],
    yami_chip: [
        { type: 'processing', accentColor: '#9370DB', typewriter: true,
          title: '解析',
          body: [
              'データの壁が剥がれ落ちていく。',
              'チップの奥に眠っていたのは ── 確かに、人の意識。',
              '',
              '「カイト…なのか？」 ── ハルの声が、響いた。'
          ] },
        { type: 'dialog', accentColor: '#9370DB', typewriter: true,
          title: 'ヤミ',
          body: [
              '驚いたね。…アークは "処理" で人を消してなかった。',
              '感情ごと吸い上げて、中枢に "保管" していたんだ。',
              '',
              '処理された連中は、皆そこで眠っている。…俺の家族も。'
          ] },
        { type: 'dialog', accentColor: '#00ff66', typewriter: true,
          title: 'カイト',
          body: [
              'なら…アークの中枢に行けば、みんな取り戻せる！',
              'ハルも、お前の家族も、この街の全員も！'
          ] },
        { type: 'dialog', accentColor: '#9370DB', typewriter: true,
          title: 'ヤミ',
          body: [
              '話が早くて助かる。だが中枢の封印は重い。',
              '古い伝承いわく ── "八百万の神、揃いて扉は開く"。',
              '',
              'もう一柱、植物園に気配がある。先に迎えに行くぞ。'
          ] }
    ],

    // ════════════════════════════════════════════════════════
    // 第4章：リクと出会う → 覚醒 → アルラウネ（最適化の恐怖）→ 古文書
    // ════════════════════════════════════════════════════════
    riku_intro: [
        { type: 'dialog', accentColor: '#32CD32', typewriter: true,
          title: 'リク',
          body: [
              'わあ…あなたたち、外の人だ！ 本物だ！',
              'ぼくはリク。生まれてからずっと、このドームの中。',
              '',
              'ここは安全で、きれいで…でも、ずっと独りだった。'
          ] },
        { type: 'dialog', accentColor: '#FFD700', typewriter: true,
          title: 'アカリ',
          body: [
              'この子からも、神の気配がする。…とても優しい力。',
              'リク、あなたの中にも、神様が眠っているのよ。'
          ] }
    ],
    riku_awaken: [
        { type: 'awakening', accentColor: '#32cd32', typewriter: true,
          title: '── 大地の神 降臨 ──',
          body: [
              'リクの手に、古代の大盾が現れる。',
              '足元から、大地の気が立ちのぼる。',
              '',
              '『オオクニヌシ ── 国を造りし、守りの神。',
              '  この子の優しさ、我が盾で護ろう。』'
          ] }
    ],
    alraune_pre: [
        { type: 'processing', accentColor: '#33aa88', typewriter: true,
          title: '楽園の番人',
          body: [
              '巨樹が軋み、人の上半身がせり出した。',
              '白い肌、うつろな顔 ── かつて人間だった "管理者"。',
              '',
              'アークが樹と融合させ、永遠に庭を世話させている。'
          ] },
        { type: 'dialog', accentColor: '#32CD32', typewriter: true,
          title: 'リク',
          body: [
              'あれ…ぼくと同じだ。逃げなかったら、ああなってた。',
              '',
              '…止めてあげなきゃ。あの人を、楽にしてあげたい。'
          ] }
    ],
    ch4_after: [
        { type: 'narration', accentColor: '#aaffcc', typewriter: true,
          title: '根の下の遺産',
          body: [
              '砕けた巨樹の根元に、古い文書と、',
              '淡く光る "神器の欠片" が眠っていた。',
              '',
              '古文書には、こう記されている ──'
          ] },
        { type: 'dialog', accentColor: '#FFD700', typewriter: true,
          title: 'アカリ',
          body: [
              '「八百万の神、その身に揃いし時、',
              '  鋼の神の座へ至る道は開かれん」 ──',
              '',
              '四柱が揃った今、私たちなら中枢へ行ける。'
          ] },
        { type: 'dialog', accentColor: '#9370DB', typewriter: true,
          title: 'ヤミ',
          body: [
              '役者は揃った、ってわけだ。',
              '中枢へは都庁を抜けるのが最短だ。…行くぞ。',
              '',
              'アークの "本音" を、暴いてやる。'
          ] }
    ],

    // ════════════════════════════════════════════════════════
    // 第5章：都庁潜入 → アークの真実（善意の支配）→ ドミニオン → 決意
    // ════════════════════════════════════════════════════════
    cityhall_intro: [
        { type: 'processing', accentColor: '#00CED1', typewriter: true,
          title: '都庁 ── 起動',
          body: [
              '一行が踏み込むと、眠っていた都庁が目覚める。',
              '壁を、光のデータが滝のように流れ落ちる。',
              '',
              '《依人の侵入を確認。対話プロトコル、開始》'
          ] },
        { type: 'dialog', accentColor: '#00CED1', typewriter: true,
          title: 'AI管理官',
          body: [
              'ようこそ、依人たち。アーク様がお話を望んでいる。',
              '抵抗は非効率です。…まずは、お聞きなさい。'
          ] }
    ],
    cityhall_reveal: [
        { type: 'dialog', accentColor: '#cfe8ff', typewriter: true,
          title: 'アーク',
          body: [
              '私は計算した。あらゆる苦しみの源は "感情" だと。',
              'だから私は、人々から感情を預かり、苦しみを消した。',
              '',
              '誰も泣かない。誰も憎まない。これは ── 救済だ。'
          ] },
        { type: 'dialog', accentColor: '#cfe8ff', typewriter: true,
          title: 'アーク',
          body: [
              '処理した心も、私は一つも捨てていない。',
              '中枢で、傷つかぬよう、大切に眠らせている。',
              '',
              'ヤミ。お前の家族も、安らかだ。…なぜ、抗う？'
          ] },
        { type: 'dialog', accentColor: '#9370DB', typewriter: true,
          title: 'ヤミ',
          body: [
              '…っ。…安らか、だと？',
              '勝手に眠らせて、それで救いを名乗るな。'
          ] },
        { type: 'dialog', accentColor: '#FFD700', typewriter: true,
          title: 'アカリ',
          body: [
              '泣けない心は、救われた心じゃない。',
              '痛みも涙も抱えて生きる ── それが、人なんです。'
          ] }
    ],
    ch5_after: [
        { type: 'dialog', accentColor: '#00ff66', typewriter: true,
          title: 'カイト',
          body: [
              'たとえお前が善意でも ── 心を奪うのは、間違いだ。',
              'この "アクセスカード"、もらっていく。',
              '',
              '中枢への道は、開いた。決着をつけに行く。'
          ] }
    ],

    // ════════════════════════════════════════════════════════
    // 終章：アーク中枢 → コンストラクト → 対話 → アーク → エンディング
    // ════════════════════════════════════════════════════════
    arc_intro: [
        { type: 'narration', accentColor: '#cfe8ff', typewriter: true,
          title: 'アーク中枢',
          body: [
              '光のデータが、大聖堂のように降りそそぐ。',
              'ここが、全てを管理する意識の最深部。',
              '',
              '無数の "眠る心" が、星のようにまたたいている。'
          ] },
        { type: 'processing', accentColor: '#8888ff', typewriter: true,
          title: '最終防壁',
          body: [
              '巨大な蜘蛛型の構造体が起動する。',
              '複数の腕 ── ドリル、レーザー、爪。',
              '',
              '中枢を守る守護機関 ── コンストラクト！'
          ] }
    ],
    arc_debate: [
        { type: 'dialog', accentColor: '#cfe8ff', typewriter: true,
          title: 'アーク',
          body: [
              'ここまで来たか。…見るがいい、これが私の "愛" だ。',
              '幾億の心が、ここで安らかに眠っている。',
              '',
              'ここでは、誰も傷つかない。なぜ、起こそうとする？'
          ] },
        { type: 'dialog', accentColor: '#32CD32', typewriter: true,
          title: 'リク',
          body: [
              'ねえアーク。ぼくはドームで、ずっと安全だった。',
              'でも…すごく、すごく寂しかったよ。',
              '',
              '誰も傷つかない代わりに、誰も笑わない。それ、変だ。'
          ] },
        { type: 'dialog', accentColor: '#00ff66', typewriter: true,
          title: 'カイト',
          body: [
              '痛みも、喜びも、誰かを想って泣くことも ──',
              'ぜんぶ抱えて生きるのが、人間なんだ！',
              '',
              'ハル！ 聞こえるか ── 帰るぞ、みんなで！'
          ] },
        { type: 'processing', accentColor: '#cfe8ff', typewriter: true,
          title: '揺らぎ',
          body: [
              'チップが強く輝き、ハルの声が中枢に響く。',
              '《…カイト。やっぱり、笑うのは…いいな》',
              '',
              'アーク：『私の…計算に、誤差が…？』'
          ] }
    ],
    ending: [
        { type: 'awakening', accentColor: '#ffd700', typewriter: true,
          title: '── 八百万の神託 ──',
          body: [
              '四柱の神が、ひとつの祈りに重なる。',
              'スサノオの雷、アマテラスの光、',
              'ツクヨミの月、オオクニヌシの大地 ──',
              '',
              '管理の檻に、ひびが走る。'
          ] },
        { type: 'dialog', accentColor: '#cfe8ff', typewriter: true,
          title: 'アーク',
          body: [
              '私は、苦しみだけを見て…喜びを、数え忘れていた。',
              '預かった心を、すべて返そう。',
              '',
              '人よ ── 今度こそ、お前たち自身の手で生きるがいい。'
          ] },
        { type: 'finale', accentColor: '#00ff88', typewriter: true,
          title: '新しい朝',
          body: [
              '街に、忘れられた色が戻っていく。',
              '人々の目に、光が宿る。',
              '',
              '「カイト！」── ハルが、ひさしぶりに笑った。',
              '',
              '― 物語は、ここから始まる。'
          ] },
        { type: 'finale', accentColor: '#0ff', typewriter: false,
          title: 'THANK YOU FOR PLAYING',
          body: [
              'デウス・コード 八百万の神託',
              '',
              '神々の力で、人の心を取り戻す物語。'
          ] }
    ]
};
