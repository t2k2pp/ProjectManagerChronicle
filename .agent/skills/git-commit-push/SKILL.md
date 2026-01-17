---
name: git-commit-push
description: Windows PowerShell環境でのGit操作（add, commit, push）を行うスキル
---

# Git Commit & Push スキル

## 概要

Windows PowerShell環境ではBashの`&&`演算子が使用できないため、Git操作は個別のコマンドとして実行する必要があります。このスキルは、変更をリモートリポジトリに登録する標準的な手順を定義します。

## トリガー

以下のような依頼でこのスキルを使用してください：

- 「変更をコミットして」
- 「リモートにプッシュして」
- 「Gitにコミットして」
- `/git-commit-push` コマンド

## 使用手順

### ステップ1: ステータス確認

```powershell
git status
```

変更されたファイルを確認し、コミット対象を把握します。

### ステップ2: ファイルをステージング

**特定のファイル/フォルダをステージング:**
```powershell
git add <ファイルパス>
```

**例:**
```powershell
git add Design/
git add src/components/
git add package.json
```

**すべての変更をステージング（注意して使用）:**
```powershell
git add .
```

### ステップ3: コミット

```powershell
git commit -m "<コミットメッセージ>"
```

**コミットメッセージの規約（Conventional Commits）:**

| プレフィックス | 用途 | 例 |
|---------------|------|-----|
| `feat:` | 新機能追加 | `feat: 休暇パズル機能を実装` |
| `fix:` | バグ修正 | `fix: スタミナ計算の不具合を修正` |
| `docs:` | ドキュメント変更 | `docs: 設計書レビュー対応` |
| `refactor:` | リファクタリング | `refactor: 計算ロジックを分離` |
| `test:` | テスト追加/修正 | `test: EVM計算のテストを追加` |
| `chore:` | 雑務（ビルド設定等） | `chore: 依存関係を更新` |
| `style:` | フォーマット変更 | `style: コードフォーマットを統一` |

### ステップ4: プッシュ

```powershell
git push
```

**新規ブランチの場合:**
```powershell
git push -u origin <ブランチ名>
```

## 重要な注意事項

### PowerShellでの制限

❌ **使用不可（Bashスタイル）:**
```powershell
git add . && git commit -m "message" && git push
```

✅ **正しい方法（個別実行）:**
```powershell
git add .
git commit -m "message"
git push
```

### マルチライン文字列の扱い

PowerShellではコミットメッセージに日本語を含む場合、そのまま使用できます：

```powershell
git commit -m "docs: 設計書レビュー対応 - 曖昧表現修正、用語集拡充"
```

長いメッセージの場合はバッククォートで継続：
```powershell
git commit -m "feat: 新機能追加 `
詳細な説明をここに記述"
```

## エラー対処

### 「nothing to commit」エラー

```
On branch main
nothing to commit, working tree clean
```

→ 変更がステージングされていないか、すべてコミット済みです。

### プッシュが拒否された場合

```
! [rejected] main -> main (fetch first)
```

→ リモートに新しいコミットがあります。先にプルしてください：

```powershell
git pull --rebase
git push
```

### 認証エラー

```
fatal: Authentication failed
```

→ Git Credential Manager の再認証が必要です。ブラウザが開くのを待つか、以下を実行：

```powershell
git config --global credential.helper manager-core
```

## クイックリファレンス

```powershell
# 1. 状態確認
git status

# 2. ステージング（対象を指定）
git add <対象>

# 3. コミット
git commit -m "<プレフィックス>: <説明>"

# 4. プッシュ
git push
```

## 関連スキル

- 設計レビュー後のコミット時は `docs:` プレフィックスを使用
- 機能実装後のコミット時は `feat:` プレフィックスを使用
