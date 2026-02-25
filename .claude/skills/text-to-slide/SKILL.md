---
name: text-to-slide
description: |
  任意のテキストからスライド資料(Marp)を作成し、さらに画像生成用プロンプトへ変換するワークフロースキル。

  【発動条件】
  - 「スライドを作成して」「プレゼン資料を作って」などスライド作成依頼
  - テキストからインフォグラフィック用資料を作成したい場合
  - テキストを視覚的なスライドに変換したい場合

  【前提】
  - 元となるテキストファイル（要約mdや原稿txtなど）が必要
  - Marp形式で出力
  - プロンプト生成スクリプト（marp_to_prompts.js）が必要
version: 1.0.0
---

# Text to Slide Skill

任意のテキストからスライド資料(Marp)を作成し、さらに画像生成用プロンプトへ変換するワークフロースキルです。

## 使用方法

### 基本的なフロー

1. スライド資料の作成
2. プロンプト生成スクリプトの実行
3. 確認

### 手順1: スライド資料の作成

AIに対して、元となるテキストファイル（要約mdや原稿txtなど）を指定し、以下の指示でMarp形式のスライド資料を作成させてください。

**出力ファイル名:** `[元のファイル名]_slide.md` を推奨

**指示内容:**
```markdown
このテキストを元に、スライド資料を作成してください。

フォーマット: Markdown (Marp形式)
構成: 表紙 + [AIが提案する適切な枚数]
デザイン: defaultテーマを使用

出力ファイル: [任意のファイル名].md
```

### 手順2: プロンプト生成スクリプトの実行

スライド資料（Markdown）が完成したら、以下のコマンドを実行して画像生成用プロンプトを作成します。

```bash
node e:\development\work\infographic-test\scripts\marp_to_prompts.js "[PATH_TO_SLIDE_MD]"
```

`[PATH_TO_SLIDE_MD]` には手順1で作成したファイルのパスを入れてください。

**出力先:** `prompts/YYYY-MM-DD_HH-MM-SS/` ディレクトリに各スライドごとのプロンプトmdファイルが出力されます。

### 手順3: 確認

`prompts` ディレクトリに生成されたファイルを確認します。問題なければ完了とします。

## 使用例

```bash
# テキストファイルからスライド作成の指示
「article_summary.txt を元に、スライド資料を作成してください」

# スライド作成後にプロンプト生成
node e:\development\work\infographic-test\scripts\marp_to_prompts.js "article_summary_slide.md"
```

## 前提条件

1. 元となるテキストファイル（.md または .txt）が必要
2. `scripts/marp_to_prompts.js` が存在すること
3. Node.js 環境が必要

## 依存ファイル

- `scripts/marp_to_prompts.js`: Marpファイルからプロンプトを生成するスクリプト

## 出力ファイル

1. `[元のファイル名]_slide.md`: Marp形式のスライド資料
2. `prompts/YYYY-MM-DD_HH-MM-SS/`: 各スライドの画像生成用プロンプトディレクトリ

## 関連スキル

- **image-gen**: 生成されたプロンプトを使用して画像を生成する場合

## 注意点

- 出力ファイル名はわかりやすい名前を推奨（例: `summary_slide.md`, `presentation_slide.md`）
- プロンプト生成スクリプトのパスは環境に合わせて調整してください
