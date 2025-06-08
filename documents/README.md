# Documents フォルダ

このフォルダには「デウス・コード 八百万の神託」のテキスト関連素材を保存します。

## 📁 フォルダ構成

### 📜 scripts/ - スクリプト・台詞
- キャラクターの台詞
- ナレーションテキスト
- システムメッセージ
- チュートリアルテキスト

### 📚 stories/ - ストーリー・シナリオ
- メインストーリー
- サブクエスト
- キャラクター背景設定
- 世界観詳細設定

### ⚙️ settings/ - 設定ファイル
- ゲームバランス設定
- キャラクターパラメータ
- アイテム詳細データ
- スキル・神威設定

## 📝 ファイル命名規則

### スクリプトファイル
- `script_[場面]_[内容].md` (例: script_battle_kaito_awakening.md)
- `dialogue_[キャラ名]_[シーン].txt` (例: dialogue_akari_shrine.txt)

### ストーリーファイル
- `story_[章番号]_[タイトル].md` (例: story_01_awakening.md)
- `quest_[種類]_[名前].md` (例: quest_main_ark_infiltration.md)

### 設定ファイル
- `config_[種類].json` (例: config_characters.json)
- `data_[内容].csv` (例: data_items.csv)

## 🔧 推奨フォーマット
- **テキスト:** Markdown (.md)、Plain Text (.txt)
- **データ:** JSON (.json)、CSV (.csv)
- **スクリプト:** YAML (.yml)、XML (.xml)

## ✍️ 書式例

### キャラクター台詞
```markdown
# カイト - 神威覚醒シーン

**カイト**: 「絶対に... 絶対に許さない！」
*[怒りで拳を握りしめる]*

**カイト**: 「俺の中に... 何かが目覚める...！」
*[青い電撃が身体を包む]*
```

### アイテム設定
```json
{
  "item_id": "weapon_kamui_bat",
  "name": "神威バット",
  "type": "weapon",
  "rarity": "legendary",
  "attack": 150,
  "special_effect": "雷属性ダメージ"
}
```
