// ========================================================================
// assets.js — 画像アセットの読み込みフック
// ========================================================================
// 画像は Image.onload 後でないと canvas が汚染／例外になるため、
// 「読み込み済みフラグ」を gameAssets.ready.* に持たせる。描画層は
// gameAssets.ready.<name> を見てから drawImage する。
//
// 追加アセットがあれば assetList に { id, src } を足すだけで自動ロード。

const gameAssets = {
    images: {},
    ready: {}
};

const assetList = [
    { id: 'field', src: 'assets/field.png' }
];

(function loadAssets() {
    for (const a of assetList) {
        const img = new Image();
        img.onload = () => { gameAssets.ready[a.id] = true; };
        img.onerror = () => { gameAssets.ready[a.id] = false; };  // 失敗時は描画側がフォールバック
        img.src = a.src;
        gameAssets.images[a.id] = img;
    }
})();
