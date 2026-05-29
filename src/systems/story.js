// ========================================================================
// systems/story.js — フラグ／目的／会話解決／イベント駆動（ソフト誘導の中枢）
// ========================================================================

// ── NPC会話の解決 ───────────────────────────────────────────
// world.doAction から呼ばれる。章トリガー → 店 → 通常会話 の優先順で処理。
function interactNpc(npc) {
    // 1) 章の「talk」トリガーに合致すればイベント発火（通常会話はしない）
    if (tryFireTrigger('talk', { npc: npc.name })) return;
    // 2) 店／宿
    if (npc.shopId) { openShop(npc.shopId, npc); return; }
    // 3) 通常会話（進行で変化）
    const text = resolveDialogText(npc);
    if (text) {
        gameState.showDialog = true;
        gameState.dialogText = text;
        gameState.dialogNpc = npc;
    }
}

// dialog が配列なら、成立フラグを満たす「最後の」エントリを採用（進行で台詞が変化）
function resolveDialogText(npc) {
    const d = npc.dialog;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) {
        let chosen = '';
        for (const e of d) {
            if ((e.flags || []).every(f => hasFlag(f))) chosen = e.text;
        }
        return chosen;
    }
    return '';
}

// マップ入場時フック（world.checkPortal から）
function onMapEnter(mapId) {
    tryFireTrigger('enter', { map: mapId });
}

// ── 章トリガー判定（story.chapter 一致時のみ・一度だけ） ─────────
function tryFireTrigger(kind, ctx) {
    if (gameState.eventRunning) return false;
    const ch = getChapter(gameState.story.chapter);
    if (!ch || !ch.trigger || ch.trigger.type !== kind) return false;
    const t = ch.trigger;
    if (kind === 'talk') {
        if (t.npc !== ctx.npc) return false;
        if (t.map && t.map !== gameState.currentMap) return false;
    } else if (kind === 'enter') {
        if (t.map !== ctx.map) return false;
    }
    if ((t.requireFlags || []).some(f => !hasFlag(f))) return false;
    if ((t.forbidFlags || []).some(f => hasFlag(f))) return false;
    fireChapter(ch);
    return true;
}

function fireChapter(ch) {
    const events = Array.isArray(ch.event) ? ch.event.slice() : [ch.event];
    runEvents(events, function () { applyOnComplete(ch.onComplete); });
}

// 章完了処理（フラグ付与・次章・目的更新）
function applyOnComplete(oc) {
    if (oc) {
        (oc.setFlags || []).forEach(f => setFlag(f));
        if (oc.nextChapter) gameState.story.chapter = oc.nextChapter;
        if (oc.setObjective) gameState.story.objective = deepClone(oc.setObjective);
    }
    gameState.scene = 'map';
    gameState.showDialog = false;
}

// ── イベントキュー（章イベントの逐次実行） ───────────────────────
// cutscene/battle は「ブロッキング」：完了時に stepEvents を呼んで次へ進む。
function runEvents(list, onDone) {
    gameState.eventRunning = true;
    gameState.eventQueue = list.slice();
    gameState.eventOnDone = onDone || null;
    stepEvents();
}

function stepEvents() {
    if (gameState.eventQueue.length === 0) {
        const cb = gameState.eventOnDone;
        gameState.eventOnDone = null;
        gameState.eventRunning = false;
        if (cb) cb();
        else gameState.scene = 'map';
        return;
    }
    const ev = gameState.eventQueue.shift();
    dispatchStoryEvent(ev);
}

function dispatchStoryEvent(ev) {
    const ci = ev.indexOf(':');
    const kind = ci >= 0 ? ev.slice(0, ci) : ev;
    const arg = ci >= 0 ? ev.slice(ci + 1) : '';
    switch (kind) {
        case 'cutscene':
            startCutscene(cutscenes[arg] || [], stepEvents);
            break;
        case 'battle':
            startBattle([arg], stepEvents);     // arg = 敵ID（ボス/台本戦）
            break;
        case 'recruit':
            recruitMember(arg); stepEvents();
            break;
        case 'flag':
            setFlag(arg); stepEvents();
            break;
        case 'map': {
            const parts = arg.split('@');
            gameState.currentMap = parts[0];
            if (parts[1]) setPlayerPositionFromPortal(parts[1]);
            stepEvents();
            break;
        }
        default:
            stepEvents();
    }
}

// 仲間を加入させる
function recruitMember(id) {
    const tpl = characterTemplates[id];
    if (!tpl) return;
    let m = gameState.party.find(p => p.id === id);
    if (!m) { m = deepClone(tpl); gameState.party.push(m); }
    m.inParty = true;
    setFlag(m.recruitFlag);
}
