---
name: image-gen
description: |
  Gemini API (Nano Banana Pro) を使用した汎用画像生成スキル。

  【発動条件】
  - 「画像を生成して」「イラストを作成」など一般的な画像生成依頼
  - 特定のプロンプトで画像を生成したい場合

  【注意】
  - 記事のインフォグラフィック生成には `article-infographic` スキルを使用すること
  - このスキルは汎用的なテキスト→画像生成のみを行う
version: 1.1.0
---

# Image Generation Skill

Gemini API (Nano Banana Pro) を使用した汎用画像生成スキルです。
プロンプトを受け取り、画像を生成して保存します。

## 使用方法

### 基本的な画像生成

```bash
node ~/.claude/skills/image-gen/image_gen.js --prompt "生成したい画像の説明" --output "./output/assets"
```

### オプション

| オプション | 必須 | 説明 |
|-----------|------|------|
| `--prompt <text>` | Yes | 画像生成プロンプト |
| `--output <dir>` | Yes | 出力先ディレクトリ |
| `--filename <name>` | No | 出力ファイル名（省略時は `image_<timestamp>.png`） |

### 出力先

```
{output}/{filename}
```

### 例

```bash
# 基本的な使用方法
node ~/.claude/skills/image-gen/image_gen.js \
  --prompt "青い空と白い雲、緑の草原に一本の大きな木" \
  --output "./output/assets"

# ファイル名を指定
node ~/.claude/skills/image-gen/image_gen.js \
  --prompt "モダンなオフィスのインテリアデザイン" \
  --output "./articles/assets" \
  --filename "office_design.png"
```

## 前提条件

1. `~/.claude/skills/image-gen` ディレクトリで `npm install` を実行済みであること
2. `~/.claude/settings.local.json` の `env` フィールドに以下が設定されていること
   ```json
   {
     "env": {
       "GEMINI_API_KEY": "your-api-key-here",
       "NANOBANANA_MODEL": "gemini-3-pro-image-preview"
     }
   }
   ```

## 環境変数

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `GEMINI_API_KEY` | Yes | Google AI Studio API Key |
| `NANOBANANA_MODEL` | No | 使用するモデル名（デフォルト: `gemini-2.0-flash-exp`） |

### APIキーの取得方法

1. [Google AI Studio](https://aistudio.google.com/apikey) にアクセス
2. 「Create API Key」をクリック
3. 生成されたAPIキーを `.env` にコピー

## 依存パッケージ

- @google/genai: Gemini API クライアント
- dotenv: 環境変数読み込み
- minimist: コマンドライン引数パース

## 関連スキル

- **article-infographic**: 記事からインフォグラフィックを生成する場合はこちらを使用

## トラブルシューティング

### エラー: GEMINI_API_KEY is not set

`~/.claude/settings.local.json` の `env` フィールドに API キーを設定してください：
```json
{
  "env": {
    "GEMINI_API_KEY": "your-api-key"
  }
}
```

### エラー: Model not found

利用可能なモデルを確認してください：
- `gemini-2.0-flash-exp` (デフォルト)
- `gemini-3-pro-image-preview` (Nano Banana Pro)

`~/.claude/settings.local.json` の `env` フィールドでモデルを指定：
```json
{
  "env": {
    "NANOBANANA_MODEL": "gemini-2.0-flash-exp"
  }
}
```

### エラー: API quota exceeded

APIの利用制限に達した場合は、しばらく待ってから再試行してください。
