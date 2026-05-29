// ========================================================================
// systems/scene.js — シーン状態機械のディスパッチ（update / render）
// ========================================================================

function updateScene() {
    switch (gameState.scene) {
        case 'title':      updateTitle(); break;
        case 'cutscene':   updateCutscene(); break;
        case 'transition': updateTransition(); break;
        case 'battle':     updateBattle(); break;
        case 'map':        updateWorld(); break;
    }
}

function renderScene() {
    switch (gameState.scene) {
        case 'title':      renderTitle(ctx); break;
        case 'cutscene':   renderCutscene(ctx); break;
        case 'transition': renderTransition(ctx); break;
        case 'battle':     renderBattle(ctx); break;
        case 'map':
            renderWorld(ctx);
            if (gameState.menu.open) renderMenu(ctx);
            break;
        default:
            renderWorld(ctx);
    }
}
