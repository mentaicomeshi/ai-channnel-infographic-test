# カスタムスキル用.claude-pluginディレクトリの作成

## Context

ユーザーはプロジェクト内で独自に開発したカスタムスキル（`.agent/skills/text-to-slide/`）を、Claude Codeのプラグイン経由で読み込めるようにしたいです。

現在の状況:
- 既に `example-skills@anthropic-agent-skills` プラグインがインストール済み
- プロジェクトには `.agent/skills/text-to-slide/SKILL.md` が作成済み
- しかし、プロジェクトルートに `.claude` ディレクトリが存在しない

Claude Codeは以下の順序でスキルを検索します:
1. `~/.claude/skills/` (ユーザーレベル)
2. プロジェクトルートの `.claude/skills/` (プロジェクトレベル)
3. プラグイン経由でインストールされたスキル

## 計画

### 1. `.claude-plugin` ディレクトリ構造の作成

プロジェクトルートに以下の構造を作成します:

```
.claude-plugin/
├── marketplace.json
└── skills/
    └── (シンボリックリンクまたはコピー)
```

### 2. `marketplace.json` の作成

以下の内容で `marketplace.json` を作成します:

```json
{
  "name": "ai-channel-infographic-skills",
  "owner": {
    "name": "Project Owner"
  },
  "metadata": {
    "description": "Custom AI Channel Infographic Skills",
    "version": "1.0.0"
  },
  "plugins": [
    {
      "name": "text-to-slide",
      "description": "Convert text to Marp slides and generate image prompts",
      "source": "./",
      "strict": false,
      "skills": [
        "./.agent/skills/text-to-slide"
      ]
    }
  ]
}
```

### 3. スキルディレクトリのシンボリックリンク作成（またはコピー）

Windows環境なので、以下のいずれかの方法で対応:

**オプションA**: ディレクトリ構造をそのまま使用（`skills` パスを `.agent/skills/text-to-slide` で指定）

**オプションB**: `.agent/skills/` を `.claude/skills/` にコピー

**オプションC**: `.claude-plugin/` を `.agent/` に移動して配置

### 推奨アプローチ（ユーザー選択: 標準構造）

Claude Codeの標準構造に準拠した以下の構造を採用します:

```
agent-infographic-test/
├── .agent/
│   └── skills/
│       └── text-to-slide/
│           └── SKILL.md
├── .claude/
│   ├── skills/
│   │   └── text-to-slide/
│   │       └── SKILL.md
│   └── .claude-plugin/
│       └── marketplace.json
└── (その他のファイル)
```

`.agent/skills/` から `.claude/skills/` にスキルをコピーし、`.claude/.claude-plugin/marketplace.json` で `.claude/skills/text-to-slide` を参照します。

## 実装手順

1. `.claude/skills/` ディレクトリを作成
2. `.agent/skills/text-to-slide/` を `.claude/skills/text-to-slide/` にコピー
3. `.claude/.claude-plugin/marketplace.json` を作成
4. 構成を確認（Claude Codeが自動的に検出）
5. 必要に応じてClaude Codeを再起動

## 依存関係

既存ファイル:
- [`.agent/skills/text-to-slide/SKILL.md`](.agent/skills/text-to-slide/SKILL.md) - 既存のスキル定義（コピー元）

新規作成ファイル:
- [`.claude/skills/text-to-slide/SKILL.md`](.claude/skills/text-to-slide/SKILL.md) - スキル定義（コピー先）
- [`.claude/.claude-plugin/marketplace.json`](.claude/.claude-plugin/marketplace.json) - プラグインメタデータ

## 検証方法

1. `.claude-plugin/marketplace.json` が作成されたことを確認
2. Claude Codeでスキルが認識されるか確認（例: スキルの発動条件が表示されるか）
3. テキストからスライド作成のリクエストで `text-to-slide` スキルがトリガーされるか確認

## 参考資料

- [Claude Code Agent Skills Tutorial](https://www.alibabacloud.com/help/en/claude-code-user-guide/skill-development-and-usage)
- [Official Skills Repository](https://github.com/skillmatic-ai/awesome-agent-skills)
