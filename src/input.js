// ========================================================================
// input.js — キーボード入力ルータ（シーン別に専有して誤発火を防ぐ）
// ========================================================================

document.addEventListener('keydown', (e) => {
    if (!gameState) return;
    gameState.keys[e.key] = true;

    switch (gameState.scene) {
        case 'title':
            titleKey(e); e.preventDefault();
            break;

        case 'cutscene':
            if (e.key === ' ' || e.key === 'Enter') { advanceCutscene(); e.preventDefault(); }
            break;

        case 'transition':
            e.preventDefault();   // 暗転中は入力を無効化
            break;

        case 'battle':
            battleKey(e); e.preventDefault();
            break;

        case 'map':
            if (gameState.menu.open) { menuKey(e); e.preventDefault(); break; }
            if (gameState.showDialog) {
                if (e.key === ' ' || e.key === 'Enter') { doAction(); e.preventDefault(); }
                break;
            }
            if (e.key === 'ArrowUp')        { movePlayer(0, -1); e.preventDefault(); }
            else if (e.key === 'ArrowDown') { movePlayer(0, 1);  e.preventDefault(); }
            else if (e.key === 'ArrowLeft') { movePlayer(-1, 0); e.preventDefault(); }
            else if (e.key === 'ArrowRight'){ movePlayer(1, 0);  e.preventDefault(); }
            else if (e.key === ' ')         { doAction(); e.preventDefault(); }
            else if (e.key === 'x' || e.key === 'X') { openMenu(); e.preventDefault(); }
            else if (e.key === 's' || e.key === 'S') { saveGame(); e.preventDefault(); }
            break;
    }
});

document.addEventListener('keyup', (e) => {
    if (gameState) gameState.keys[e.key] = false;
});
