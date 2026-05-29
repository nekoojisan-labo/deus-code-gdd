// ========================================================================
// systems/battle.js — ターン制バトル（コマンド／神威／道具／逃走・EXP・Lv）
// ========================================================================
// combatant 共通インターフェース:
//   side: 'ally' | 'enemy'
//   ally:  { side, member(=partyの実体), defMul, shield, stunned, taunting }
//   enemy: { side, refId, name, hp, maxHp, atk, def, mag, spd, exp, gold,
//            drops, color, sprite, boss, elite, defMul, shield, stunned }

// ── combatant アクセサ ──────────────────────────────────────
function cName(c) { return c.side === 'ally' ? c.member.name : c.name; }
function cHp(c)   { return c.side === 'ally' ? c.member.hp : c.hp; }
function cMaxHp(c){ return c.side === 'ally' ? c.member.maxHp : c.maxHp; }
function cMp(c)   { return c.side === 'ally' ? c.member.mp : 0; }
function cAtk(c)  { return c.side === 'ally' ? effStat(c.member, 'atk') : c.atk; }
function cMag(c)  { return c.side === 'ally' ? effStat(c.member, 'mag') : (c.mag || 0); }
function cSpd(c)  { return c.side === 'ally' ? effStat(c.member, 'spd') : c.spd; }
function cDef(c)  {
    const base = c.side === 'ally' ? effStat(c.member, 'def') : c.def;
    return Math.max(0, Math.round(base * (c.defMul || 1)));
}
function cAlive(c){ return cHp(c) > 0; }
function cSetHp(c, v) {
    const max = cMaxHp(c);
    const nv = clamp(v, 0, max);
    if (c.side === 'ally') c.member.hp = nv; else c.hp = nv;
}
function cSetMp(c, v) {
    if (c.side !== 'ally') return;
    c.member.mp = clamp(v, 0, c.member.maxMp);
}

function aliveEnemies() { return gameState.battle.enemies.filter(cAlive); }
function aliveAllies()  { return gameState.battle.allies.filter(cAlive); }

// ── バトル開始 ─────────────────────────────────────────────
function startBattle(enemyIds, onWin) {
    const allies = activeParty().map(m => ({
        side: 'ally', member: m, defMul: 1, shield: 0, stunned: false, taunting: false
    }));
    const enemyList = enemyIds.map(id => {
        const t = enemies[id];
        return {
            side: 'enemy', refId: id, name: t.name,
            hp: t.hp, maxHp: t.hp, atk: t.atk, def: t.def, mag: t.mag || 0, spd: t.spd,
            exp: t.exp, gold: t.gold, drops: t.drops || [], color: t.color, sprite: t.sprite,
            boss: !!t.boss, elite: !!t.elite, defMul: 1, shield: 0, stunned: false
        };
    });
    gameState.battle = {
        allies, enemies: enemyList,
        order: [], turnPtr: 0, current: null,
        phase: 'message', menuCursor: 0, subCursor: 0, targetCursor: 0, targetPool: [],
        pendingAction: null, message: '', messageNext: null,
        rewards: null, onWin: onWin || null, lastInputTime: 0
    };
    gameState.scene = 'battle';
    const names = enemyList.map(e => e.name).join('、');
    showMessage(`${names} が現れた！`, startRound);
}

function showMessage(text, next) {
    const b = gameState.battle;
    if (!b) return;
    b.message = text;
    b.messageNext = next || null;
    b.phase = 'message';
}

// ── ターン進行 ─────────────────────────────────────────────
function startRound() {
    const b = gameState.battle;
    b.order = [...b.allies, ...b.enemies].filter(cAlive).sort((x, y) => cSpd(y) - cSpd(x));
    b.turnPtr = 0;
    beginTurn();
}

function beginTurn() {
    const b = gameState.battle;
    if (checkBattleEnd()) return;
    if (b.turnPtr >= b.order.length) { startRound(); return; }
    const c = b.order[b.turnPtr];
    if (!cAlive(c)) { b.turnPtr++; beginTurn(); return; }
    b.current = c;
    if (c.stunned) { c.stunned = false; showMessage(`${cName(c)}は動けない！`, advanceTurn); return; }
    if (c.side === 'ally') { b.phase = 'command'; b.menuCursor = 0; }
    else enemyAct(c);
}

function advanceTurn() {
    const b = gameState.battle;
    if (!b) return;
    if (checkBattleEnd()) return;
    b.turnPtr++;
    beginTurn();
}

// ── プレイヤーコマンド ──────────────────────────────────────
function confirmCommand() {
    const b = gameState.battle;
    switch (b.menuCursor) {
        case 0: b.pendingAction = { type: 'attack' }; enterTargetPhase(aliveEnemies()); break;
        case 1: b.phase = 'skill'; b.subCursor = 0; break;
        case 2: b.phase = 'item'; b.subCursor = 0; break;
        case 3: attemptEscape(); break;
    }
}

function getLearnedSkills(member) {
    return member.learned.map(id => Object.assign({ id }, skills[id]));
}

function confirmSkill() {
    const b = gameState.battle;
    const actor = b.current;
    const list = getLearnedSkills(actor.member);
    const sk = list[b.subCursor];
    if (!sk) return;
    if (cMp(actor) < sk.mpCost) { showMessage('MPが足りない！', () => { b.phase = 'command'; }); return; }
    b.pendingAction = { type: 'skill', skill: sk };
    switch (sk.target) {
        case 'one':      enterTargetPhase(aliveEnemies()); break;
        case 'oneAlly':  enterTargetPhase(aliveAllies()); break;
        default:         resolveAction(null); break;   // allEnemies/allAllies/self
    }
}

function usableBattleItems() {
    return gameState.inventory.filter(s => {
        const it = items[s.id];
        return it && it.type === 'recovery' && it.useIn !== 'field';
    });
}

function confirmItem() {
    const b = gameState.battle;
    const list = usableBattleItems();
    const slot = list[b.subCursor];
    if (!slot) return;
    const it = items[slot.id];
    b.pendingAction = { type: 'item', itemId: slot.id };
    if (it.effect && it.effect.revive) enterTargetPhase(b.allies.slice()); // 戦闘不能も対象
    else enterTargetPhase(aliveAllies());
}

function enterTargetPhase(pool) {
    const b = gameState.battle;
    b.targetPool = pool;
    b.targetCursor = 0;
    b.phase = 'target';
}

// ── アクション解決 ─────────────────────────────────────────
function resolveAction(target) {
    const b = gameState.battle;
    const actor = b.current;
    const pa = b.pendingAction;
    if (!pa) return;
    let msg = '';
    if (pa.type === 'attack') msg = doPhysical(actor, target);
    else if (pa.type === 'skill') { msg = doSkill(actor, pa.skill, target); cSetMp(actor, cMp(actor) - pa.skill.mpCost); }
    else if (pa.type === 'item') msg = doItem(actor, pa.itemId, target);
    b.pendingAction = null;
    showMessage(msg, () => { if (!checkBattleEnd()) advanceTurn(); });
}

function applyDamage(target, raw, critChance) {
    let crit = false;
    let dmg = Math.max(1, raw);
    if (Math.random() < (critChance === undefined ? 0.1 : critChance)) { crit = true; dmg = Math.floor(dmg * 1.5); }
    if (target.shield > 0) { const a = Math.min(target.shield, dmg); target.shield -= a; dmg -= a; }
    cSetHp(target, cHp(target) - dmg);
    return { dmg, crit };
}

function doPhysical(actor, target) {
    const raw = cAtk(actor) - cDef(target) + rngRange(-2, 2);
    const r = applyDamage(target, raw, 0.1);
    return `${cName(actor)}の攻撃！ ${cName(target)}に${r.dmg}ダメージ${r.crit ? '（会心！）' : ''}`;
}

function skillTargets(actor, sk, target) {
    switch (sk.target) {
        case 'one':
        case 'oneAlly':    return target ? [target] : [];
        case 'allEnemies': return aliveEnemies();
        case 'allAllies':  return aliveAllies();
        case 'self':       return [actor];
    }
    return [];
}

function doSkill(actor, sk, target) {
    const targets = skillTargets(actor, sk, target);
    const parts = [`${cName(actor)}の${sk.name}！`];
    for (const t of targets) {
        if (sk.type === 'damage') {
            const raw = sk.power + Math.floor(cMag(actor) * 0.5) - cDef(t);
            const r = applyDamage(t, raw, sk.crit || 0.05);
            parts.push(`${cName(t)}に${r.dmg}${r.crit ? '(会心!)' : ''}`);
        } else if (sk.type === 'heal') {
            const amt = sk.power + Math.floor(cMag(actor) * 0.5);
            cSetHp(t, cHp(t) + amt);
            parts.push(`${cName(t)}のHP+${amt}`);
        } else if (sk.type === 'buff') {
            t.defMul = (t.defMul || 1) + sk.amount;
            parts.push(`${cName(t)}の防御UP`);
        } else if (sk.type === 'debuff') {
            t.defMul = Math.max(0.1, (t.defMul || 1) + sk.amount);
            parts.push(`${cName(t)}の防御DOWN`);
        } else if (sk.type === 'shield') {
            t.shield = (t.shield || 0) + sk.power;
            parts.push(`${cName(t)}にシールド`);
        } else if (sk.type === 'stun') {
            if (Math.random() < (sk.chance || 0.5)) { t.stunned = true; parts.push(`${cName(t)}を停止!`); }
            else parts.push(`${cName(t)}に効かない`);
        } else if (sk.type === 'cleanse') {
            t.defMul = 1; t.stunned = false;
            parts.push(`${cName(t)}を浄化`);
        } else if (sk.type === 'taunt') {
            actor.taunting = true;
            parts.push(`${cName(actor)}は敵を引きつけた`);
        }
    }
    return parts.join(' ');
}

function doItem(actor, itemId, target) {
    const it = items[itemId];
    const ef = it.effect || {};
    let msg = `${cName(actor)}は${it.name}を使った！`;
    if (ef.revive && !cAlive(target)) {
        cSetHp(target, Math.floor(cMaxHp(target) * ef.revive));
        msg += ` ${cName(target)}が復活！`;
    } else {
        if (ef.hp) { cSetHp(target, cHp(target) + ef.hp); msg += ` ${cName(target)}のHP+${ef.hp}`; }
        if (ef.mp) { cSetMp(target, cMp(target) + ef.mp); msg += ` ${cName(target)}のMP+${ef.mp}`; }
    }
    removeItem(itemId, 1);
    return msg;
}

// ── 敵の行動（基本AI） ──────────────────────────────────────
function enemyAct(enemy) {
    const targets = aliveAllies();
    if (targets.length === 0) { checkBattleEnd(); return; }
    const taunters = targets.filter(t => t.taunting);
    const pool = taunters.length ? taunters : targets;
    const target = pool[rng(pool.length)];
    const raw = enemy.atk - cDef(target) + rngRange(-2, 2);
    const r = applyDamage(target, raw, 0.08);
    showMessage(`${enemy.name}の攻撃！ ${cName(target)}に${r.dmg}ダメージ${r.crit ? '（会心！）' : ''}`,
        () => { if (!checkBattleEnd()) advanceTurn(); });
}

// ── 逃走 ───────────────────────────────────────────────────
function attemptEscape() {
    const b = gameState.battle;
    if (b.enemies.some(e => e.boss)) { showMessage('強敵からは逃げられない！', () => { b.phase = 'command'; }); return; }
    const ps = Math.max(...aliveAllies().map(cSpd), 1);
    const es = Math.max(...aliveEnemies().map(cSpd), 1);
    const chance = clamp(0.5 + (ps - es) * 0.05, 0.15, 0.9);
    if (Math.random() < chance) showMessage('うまく逃げ出した！', finalizeEscape);
    else showMessage('逃げられなかった！', advanceTurn);
}
function finalizeEscape() {
    gameState.battle = null;
    gameState.scene = gameState.pendingReturnScene || 'map';
}

// ── 勝敗判定・報酬 ─────────────────────────────────────────
function checkBattleEnd() {
    const b = gameState.battle;
    if (!b) return true;
    if (b.enemies.every(e => !cAlive(e))) { startVictory(); return true; }
    if (b.allies.every(a => !cAlive(a))) { b.phase = 'defeat'; return true; }
    return false;
}

function startVictory() {
    const b = gameState.battle;
    let exp = 0, gold = 0;
    const drops = [];
    for (const e of b.enemies) {
        exp += e.exp || 0; gold += e.gold || 0;
        for (const d of (e.drops || [])) { if (Math.random() < d.rate) drops.push(d.id); }
    }
    gameState.gold += gold;
    const levelUps = [];
    for (const a of b.allies) {
        if (cAlive(a)) {
            const before = a.member.level;
            gainExp(a.member, exp);
            if (a.member.level > before) levelUps.push(a.member.name);
        }
    }
    for (const id of drops) addItem(id, 1);
    b.rewards = { exp, gold, drops, levelUps };
    b.phase = 'victory';
    syncLeaderMirror();
}

function gainExp(member, amt) {
    member.exp += amt;
    while (member.exp >= member.expNext) {
        member.exp -= member.expNext;
        member.level++;
        member.maxHp += member.growth.hp; member.hp += member.growth.hp;
        member.maxMp += member.growth.mp; member.mp += member.growth.mp;
        member.atk += member.growth.atk; member.def += member.growth.def;
        member.mag += member.growth.mag; member.spd += member.growth.spd;
        member.expNext = Math.floor(member.expNext * 1.4) + 4;
        for (const node of member.skillTree) {
            if (member.level >= node.level && !member.learned.includes(node.id)) member.learned.push(node.id);
        }
    }
}

function finalizeVictory() {
    const b = gameState.battle;
    const onWin = b.onWin;
    gameState.battle = null;
    syncLeaderMirror();
    if (onWin) onWin();
    else gameState.scene = gameState.pendingReturnScene || 'map';
}

function finalizeDefeat() {
    gameState.battle = null;
    if (hasSave() && loadGame()) { /* 直近セーブから再開 */ }
    else { newGame(); gameState.scene = 'title'; }
}

// 毎フレーム更新（現状は入力駆動のため特に処理なし）
function updateBattle() { /* no-op */ }

// ── 入力ルータ ─────────────────────────────────────────────
function battleKey(e) {
    const b = gameState.battle;
    if (!b) return;
    const k = e.key;
    if (b.phase === 'message') { if (k === ' ' || k === 'Enter') { const n = b.messageNext; b.messageNext = null; if (n) n(); } return; }
    if (b.phase === 'victory') { if (k === ' ' || k === 'Enter') finalizeVictory(); return; }
    if (b.phase === 'defeat')  { if (k === ' ' || k === 'Enter') finalizeDefeat(); return; }

    if (b.phase === 'command') {
        if (k === 'ArrowUp') b.menuCursor = (b.menuCursor + 3) % 4;
        else if (k === 'ArrowDown') b.menuCursor = (b.menuCursor + 1) % 4;
        else if (k === ' ' || k === 'Enter') confirmCommand();
        return;
    }
    if (b.phase === 'skill') {
        const list = getLearnedSkills(b.current.member);
        if (k === 'ArrowUp') b.subCursor = (b.subCursor + list.length - 1) % list.length;
        else if (k === 'ArrowDown') b.subCursor = (b.subCursor + 1) % list.length;
        else if (k === ' ' || k === 'Enter') confirmSkill();
        else if (k === 'x' || k === 'X') b.phase = 'command';
        return;
    }
    if (b.phase === 'item') {
        const list = usableBattleItems();
        if (k === 'x' || k === 'X') { b.phase = 'command'; return; }
        if (list.length === 0) return;
        if (k === 'ArrowUp') b.subCursor = (b.subCursor + list.length - 1) % list.length;
        else if (k === 'ArrowDown') b.subCursor = (b.subCursor + 1) % list.length;
        else if (k === ' ' || k === 'Enter') confirmItem();
        return;
    }
    if (b.phase === 'target') {
        const pool = b.targetPool;
        if (pool.length === 0) { b.phase = 'command'; return; }
        if (k === 'ArrowUp' || k === 'ArrowLeft') b.targetCursor = (b.targetCursor + pool.length - 1) % pool.length;
        else if (k === 'ArrowDown' || k === 'ArrowRight') b.targetCursor = (b.targetCursor + 1) % pool.length;
        else if (k === ' ' || k === 'Enter') resolveAction(pool[b.targetCursor]);
        else if (k === 'x' || k === 'X') {
            const pt = b.pendingAction && b.pendingAction.type;
            b.phase = pt === 'skill' ? 'skill' : pt === 'item' ? 'item' : 'command';
        }
        return;
    }
}
