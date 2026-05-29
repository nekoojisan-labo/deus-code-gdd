// ========================================================================
// constants.js — 定数とキャンバス参照（最初に読み込む）
// ========================================================================
// このファイルはグローバルに canvas / ctx と各種定数を公開する。
// 以降の全ファイルがこれらに依存するため、必ず最初に読み込むこと。

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// マップ・グリッド（大画面対応）
const TILE_SIZE = 50;
const GRID_WIDTH = 24;
const GRID_HEIGHT = 12;
const STATUS_BAR_HEIGHT = 150;
const PLAYABLE_HEIGHT = canvas.height - STATUS_BAR_HEIGHT;

// エンカウント率の調整係数（map.encounterRate をこの値で割って1歩あたりの%に）
const ENCOUNTER_DIVISOR = 9;

// 神ごとのアクセント色（覚醒演出・神威エフェクトに流用）
const GOD_COLORS = {
    'スサノオ': '#ffcc33',
    'アマテラス': '#ffd700',
    'ツクヨミ': '#9370DB',
    'オオクニヌシ': '#32CD32'
};

// アイテムのレア度色（image_prompts/04 準拠）
const RARITY_COLOR = {
    common: '#dddddd',
    rare: '#44aaff',
    epic: '#bb44ff',
    legendary: '#ffcc33'
};

// セーブキー
const SAVE_KEY = 'deuscode_save_v1';
