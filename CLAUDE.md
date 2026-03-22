# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

**babylearning** - iPhone/Android向け買い切りアプリ（Expo / React Native）。
App Store・Google Playで販売予定。

## Tech Stack

- **Framework**: Expo (React Native) + TypeScript
- **Runtime**: Node.js v22
- **Package Manager**: npm
- **Distribution**: EAS Build（Expo Application Services）

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
