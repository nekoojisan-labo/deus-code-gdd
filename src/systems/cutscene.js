// ========================================================================
// systems/cutscene.js — 汎用カットシーン＋トランジション（オープニングの一般化）
// ========================================================================
// 既存オープニングを「データ駆動の汎用カットシーン」に一般化したもの。
// startCutscene(panels, onComplete) で任意のパネル列を再生できる。

// パネル列の再生を開始
function startCutscene(panels, onComplete) {
    gameState.cutscene = {
        panels: panels || [],
        index: 0,
        onComplete: onComplete || null,
        lastInputTime: 0,
        charReveal: 0,
        panelStart: animationTime
    };
    gameState.scene = 'cutscene';
}

// パネル本文の総文字数（タイプライター完了判定用）
function panelCharCount(panel) {
    if (!panel || !panel.body) return 0;
    return panel.body.reduce((s, l) => s + l.length, 0);
}

// 毎フレーム更新（タイプライター送り・自動送り）
function updateCutscene() {
    const cs = gameState.cutscene;
    const panel = cs.panels[cs.index];
    if (!panel) return;
    if (panel.typewriter) {
        cs.charReveal = Math.min(panelCharCount(panel), cs.charReveal + 1.6);
    } else {
        cs.charReveal = panelCharCount(panel);
    }
    if (panel.autoAdvanceMs) {
        const elapsedMs = (animationTime - cs.panelStart) * 16.7;
        if (elapsedMs > panel.autoAdvanceMs && cs.charReveal >= panelCharCount(panel)) {
            advanceCutscene();
        }
    }
}

// SPACE/Enter で進める。タイプライター途中なら一旦全表示。
function advanceCutscene() {
    const cs = gameState.cutscene;
    const now = Date.now();
    if (now - cs.lastInputTime < 180) return;
    cs.lastInputTime = now;

    const panel = cs.panels[cs.index];
    const total = panelCharCount(panel);
    if (panel && panel.typewriter && cs.charReveal < total) {
        cs.charReveal = total;  // 1回目の入力で全文表示
        return;
    }

    if (cs.index < cs.panels.length - 1) {
        cs.index++;
        cs.charReveal = 0;
        cs.panelStart = animationTime;
    } else {
        const cb = cs.onComplete;
        if (cb) cb();
        else gameState.scene = gameState.pendingReturnScene || 'map';
    }
}

// ── トランジション（暗転フェード。オープニング→マップ／宿の休息に流用） ──
// opts: { onBlack, onDone, returnScene }
function startTransition(opts) {
    opts = opts || {};
    gameState.transitionDirection = 'in';
    gameState.transitionAlpha = 0;
    gameState._transOnBlack = opts.onBlack || null;
    gameState._transOnBlackFired = false;
    gameState.transitionOnDone = opts.onDone || null;
    gameState._transReturn = opts.returnScene || 'map';
    gameState.scene = 'transition';
}

function updateTransition() {
    if (gameState.transitionDirection === 'in') {
        gameState.transitionAlpha = Math.min(1, gameState.transitionAlpha + 0.04);
        if (gameState.transitionAlpha >= 1 && !gameState._transOnBlackFired) {
            gameState._transOnBlackFired = true;
            gameState.transitionDirection = 'out';
            if (gameState._transOnBlack) gameState._transOnBlack();
        }
    } else {
        gameState.transitionAlpha = Math.max(0, gameState.transitionAlpha - 0.025);
        if (gameState.transitionAlpha <= 0) {
            gameState.scene = gameState._transReturn || 'map';
            const cb = gameState.transitionOnDone;
            gameState.transitionOnDone = null;
            if (cb) cb();
        }
    }
}

// ── オープニング起動（タイトルの「はじめから」から呼ぶ） ──────────
function startOpening() {
    startCutscene(cutscenes.opening, function () {
        // 覚醒の余韻 → 暗転 → 新宿ハブで独白 → 自由探索へ
        startTransition({
            onBlack: function () {
                gameState.showDialog = true;
                gameState.dialogText = '（……シンジュク中央区画。アークが「最適化」した街。人々の目には、光がない。 ──まずは情報を集めよう。ギルドマスターに話しかけてみるか。）';
                gameState.dialogNpc = { name: 'カイト（独白）', color: '#00ff66' };
                gameState.introDialogShown = true;
            },
            returnScene: 'map'
        });
    });
}
