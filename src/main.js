// ========================================================================
// main.js — ゲームループとブートストラップ（最後に読み込む）
// ========================================================================

function gameLoop() {
    animationTime++;
    updateScene();
    renderScene();
    requestAnimationFrame(gameLoop);
}

function startGame() {
    const loading = document.getElementById('loading');
    if (loading) loading.classList.add('hidden');
    newGame();
    gameState.scene = 'title';   // 起動はタイトルから
    gameLoop();
}

window.addEventListener('load', () => {
    setTimeout(startGame, 100);
});
