# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

**Science Dots（サイエンス・ドッツ）** - 認知科学 × ドッツカードメソッドの乳幼児向け知育アプリ。
生後 3 ヶ月〜3 歳の子どもを持つ親が使う、買い切り ¥1,480 のオフラインアプリ。
178 日間の自動カリキュラムでドッツカードを毎日ワンタップ・40 秒で実施できる。

詳細要件: [docs/requirements.md](docs/requirements.md)

## Tech Stack

- **Framework**: Expo SDK 55+（Managed Workflow）+ TypeScript
- **Runtime**: Node.js v22
- **Package Manager**: npm
- **Navigation**: Expo Router（File-based）
- **Local DB**: expo-sqlite（進捗・設定の永続化）
- **Animation**: react-native-reanimated（ドットフラッシュ）
- **Audio**: expo-speech（TTS 音声読み上げ）
- **Notifications**: expo-notifications（ローカル通知）
- **Distribution**: EAS Build（iOS/Android 同時ビルド）

## Key Concepts

- **ドット配置アルゴリズム**: 毎回ランダム配置（パターン認識ではなく量の認識を促進）
- **比率依存の難易度**: Weber の法則に基づき 1:2 → 3:4 → 5:6 の順で難易度を上げる
- **完全オフライン**: ネット不要。データ収集一切なし（プライバシー訴求ポイント）
- **挫折防止**: スキップしても罰なし。ストリーク + マイルストーンで継続を後押し

## Key Commands

```bash
npm run start       # Expo開発サーバー起動
npm run android     # Androidエミュレーター起動
npm run ios         # iOSシミュレーター起動（macOS必須）
npx expo install    # Expo互換バージョンでパッケージ追加
npx eas build       # ストア向けビルド
```

## Rules

Global rules are installed at `~/.claude/rules/`:
- `common/` - coding style, git workflow, security, testing, performance
- `typescript/` - TypeScript-specific patterns, hooks, testing, security

## Available Commands

| Command | Description |
|---------|-------------|
| `/plan` | Implementation planning |
| `/tdd` | Test-driven development workflow |
| `/code-review` | Quality review |
| `/build-fix` | Fix build errors |
| `/e2e` | Generate and run E2E tests |
| `/learn` | Extract patterns from sessions |

## Agents

Specialized subagents available in `.claude/agents/`:
- Planner, Architect, Code Reviewer, TDD Guide, and more

## Hooks

Automated hooks configured in `.claude/settings.json`:
- **PreToolUse**: Blocks dev servers outside tmux, reminds about long-running commands
- **PostToolUse**: Auto-formats JS/TS files, TypeScript type check after edits
- **SessionStart**: Loads previous context, detects package manager
- **SessionEnd**: Persists session state, evaluates for extractable patterns

## Git Workflow

```bash
git add <files>
git commit -m "type: description"
git push
```

Commit types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`
