# git-and-commit-standards.md

此檔案定義 MyWeb 專案的 Git 工作流程和提交規範。

---

## 🌳 Git 分支策略

### 分支命名規範

遵循 Git Flow 模式，使用以下分支類型：

```
main
├── 正式發佈版本
│
develop
├── 開發集成分支
│
feature/功能-描述           # 新功能
├── feature/user-profile
├── feature/payment-system
└── feature/lecture-booking

hotfix/緊急修復-描述        # 緊急修復
├── hotfix/payment-error
└── hotfix/auth-bug

bugfix/bug-描述             # 非緊急 bug 修復
├── bugfix/form-validation
└── bugfix/image-loading

refactor/重構-描述          # 代碼重構
├── refactor/api-client
└── refactor/component-structure

docs/文檔-描述              # 文檔更新
├── docs/api-documentation
└── docs/deployment-guide

chore/雜務-描述             # 構建、依賴等
├── chore/upgrade-dependencies
└── chore/update-eslint-config
```

### 分支命名規則

- 使用連字符分隔單詞：`feature/user-management`
- 使用小寫字母：`feature/payment-integration`
- 簡潔但有意義：`feature/add-avatar-upload`（好）vs `feature/stuff`（差）
- 包含工單號（如適用）：`feature/TICKET-123-user-profile`

### 分支管理流程

#### 1. 新增功能流程

```bash
# 1. 從 develop 創建新分支
git checkout develop
git pull origin develop
git checkout -b feature/user-dashboard

# 2. 在新分支上開發
git add .
git commit -m "feat: add user dashboard page"

# 3. 推送到遠端
git push origin feature/user-dashboard

# 4. 創建 Pull Request
# （在 GitHub 上創建，從 feature/user-dashboard 到 develop）

# 5. 代碼審查和合併完成後，刪除分支
git branch -d feature/user-dashboard
git push origin --delete feature/user-dashboard
```

#### 2. 緊急修復流程

```bash
# 1. 從 main 創建 hotfix 分支
git checkout main
git pull origin main
git checkout -b hotfix/payment-error

# 2. 修復和測試
git add .
git commit -m "fix: resolve payment processing error"

# 3. 推送並創建 PR 到 main
git push origin hotfix/payment-error

# 4. 合併到 main 後，也要合併回 develop
git checkout develop
git merge hotfix/payment-error
git push origin develop
```

---

## 📝 提交訊息規範

遵循 Conventional Commits 規範，確保提交訊息清晰一致。

### 提交訊息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type（必須）

| Type | 說明 | 範例 |
|------|------|------|
| **feat** | 新功能 | `feat: add user authentication` |
| **fix** | bug 修復 | `fix: resolve login error` |
| **docs** | 文檔更新 | `docs: update API documentation` |
| **style** | 程式碼風格（不影響邏輯） | `style: format code` |
| **refactor** | 代碼重構 | `refactor: simplify API client` |
| **perf** | 性能改進 | `perf: optimize image loading` |
| **test** | 測試相關 | `test: add unit tests` |
| **chore** | 構建、依賴等維護 | `chore: update dependencies` |
| **ci** | CI/CD 配置 | `ci: update GitHub workflows` |

### Scope（可選但推薦）

指明變更所涉及的模塊或功能：

```
feat(auth): add JWT token refresh mechanism
fix(payment): resolve transaction timeout
docs(deployment): update Fly.io guide
refactor(api): improve error handling
```

常用 scope：
- `auth` - 認證相關
- `api` - API 服務
- `ui` - 用戶介面
- `db` - 資料庫
- `payment` - 支付系統
- `lecture` - 講座功能
- `book` - 書籍功能
- `consultation` - 諮詢功能
- `disk` - 命盤功能

### Subject（必須）

- 使用祈使句，現在式：`add`（✅） vs `added`（❌）
- 首字母不大寫：`add feature`（✅） vs `Add feature`（❌）
- 末尾不加句號：`resolve error`（✅） vs `resolve error.`（❌）
- 長度保持在 50 個字符以內

### Body（可選但推薦）

詳細說明變更內容、原因和影響：

```
feat(auth): implement JWT token refresh

Previously, tokens would expire and users would be logged out
without a way to refresh the session. This implementation adds
an automatic token refresh mechanism that runs before the token
expires.

The refresh endpoint checks if the token is about to expire
(within 5 minutes) and requests a new one from the backend.

Closes #123
```

### Footer（可選）

用於關閉相關 issue 或記錄破壞性變更：

```
feat(payments): update payment processing

BREAKING CHANGE: The payment API endpoint has changed from
/api/pay to /api/payments/process

Closes #456
Fixes #789
```

### 提交訊息範例

#### ✅ 好的提交訊息

```
feat(lecture): add booking confirmation email

Users now receive a confirmation email after booking a lecture.
The email includes:
- Lecture details (title, date, time)
- Booking reference number
- Link to cancel or modify booking

Implements feature request #234
```

```
fix(auth): prevent session hijacking with secure cookies

Set HttpOnly and Secure flags on authentication cookies to
prevent XSS attacks and ensure HTTPS-only transmission in
production environments.

Fixes #567
```

```
refactor(api): extract error handling to utility

Centralize API error handling logic into a reusable utility
function to reduce code duplication and improve maintainability.
```

#### ❌ 不好的提交訊息

```
update stuff              # 過於模糊
```

```
Fixed login bug           # 不使用祈使句
```

```
feat: updated the authentication system with new JWT token handling and fixed the error handling in the API client and also updated the styling of some components
# 過長、多個功能混雜
```

---

## 🔄 Pull Request 流程

### 創建 Pull Request

```bash
# 1. 確保本地分支最新
git pull origin feature/your-feature

# 2. 推送到遠端
git push origin feature/your-feature

# 3. 在 GitHub 上創建 PR
# （使用以下模板）
```

### PR 標題格式

遵循與提交訊息相同的規範：

```
feat(auth): implement two-factor authentication
fix(payment): resolve transaction failure on slow networks
docs: update deployment guide for Fly.io
```

### PR 描述模板

```markdown
## 📝 變更說明

簡述此 PR 的目的和內容。

## 🎯 關鍵變更

- 新增使用者頭像上傳功能
- 改進表單驗證錯誤提示
- 優化 API 回應時間

## 🧪 測試方式

描述如何測試這些變更：

1. 登入系統
2. 進入個人資料頁面
3. 上傳新頭像
4. 驗證頭像已正確保存和顯示

## 📋 檢查清單

- [x] 程式碼遵循專案風格規範
- [x] 已執行 ESLint 檢查：`npm run lint`
- [x] TypeScript 編譯無誤
- [x] 已在本地測試功能
- [x] 提交訊息清晰有意義
- [ ] 已更新相關文檔

## 🔗 相關 Issue

Closes #123, #456

## 📸 截圖（如適用）

_如有 UI 變更，請添加截圖_

## ⚠️ 可能的風險

描述任何可能的副作用或需要特別注意的地方。
```

---

## 🔍 代碼審查檢查清單

審查者應檢查以下項目：

### 代碼質量

- [ ] 程式碼遵循專案風格規範
- [ ] 沒有使用 `any` 類型
- [ ] 適當的錯誤處理
- [ ] 沒有重複的代碼
- [ ] 變數和函式命名清晰

### 功能正確性

- [ ] 實作符合需求規格
- [ ] 邏輯正確，沒有邊界情況被忽略
- [ ] API 呼叫正確，包括認證檢查
- [ ] 表單驗證完整

### 安全性

- [ ] 沒有硬編碼的敏感信息（密鑰、token 等）
- [ ] 用戶輸入適當驗證
- [ ] 認證和授權檢查正確實施
- [ ] 沒有 SQL 注入或 XSS 漏洞風險

### 測試

- [ ] 相關功能已在本地測試
- [ ] 邊界情況已測試
- [ ] 沒有明顯的破損（broken links 等）

### 文檔

- [ ] 提交訊息清晰有意義
- [ ] 代碼註解適當（非顯而易見的邏輯）
- [ ] 相關文檔已更新

---

## 🚀 提交前檢查清單

在推送程式碼之前，執行以下檢查：

### 本地開發

```bash
# 1. 確保代碼質量
npm run lint

# 2. 確保 TypeScript 編譯正確
npm run build

# 3. 本地測試功能
npm run dev

# 4. 檢查是否有未提交的更改
git status

# 5. 確認所有變更都已提交
git add .
git status  # 應該顯示 "nothing to commit"
```

### Git 檢查

```bash
# 1. 確認當前分支正確
git branch

# 2. 確認提交訊息格式正確
git log --oneline -5

# 3. 確認沒有未推送的提交
git status

# 4. 確認沒有大的二進制檔案被不慎加入
git ls-files --stage | grep -v "^100644"
```

---

## 🔐 敏感信息管理

### ❌ 絕對不要提交的內容

```
.env.local              # 本地環境變數（包含 API 密鑰）
.env.production.local   # 生產環境變數
*.key                   # 私鑰檔案
secrets.json            # 任何密鑰或令牌
node_modules/           # 依賴（使用 .gitignore）
.next/                  # 構建輸出（使用 .gitignore）
```

### ✅ .gitignore 配置

```gitignore
# 環境變數
.env.local
.env.*.local

# 依賴
node_modules/
package-lock.json

# 構建輸出
.next/
out/
dist/
build/

# IDE
.vscode/
.idea/
*.swp
*.swo

# 作業系統
.DS_Store
Thumbs.db

# 日誌
*.log
npm-debug.log*

# 臨時檔案
tmp/
temp/
*.tmp
```

---

## 📊 提交統計和最佳實踐

### 提交頻率

- **最小化提交**：避免過度分割提交。相關的變更應該放在一個提交中
- **邏輯分組**：如果一個功能涉及多個檔案，但邏輯上是獨立的，考慮分開提交
- **頻繁推送**：至少每天推送一次，避免本地積累過多未推送的變更

### 提交大小指南

| 大小 | 說明 |
|------|------|
| **1-3 檔案** | 小修復或簡單功能（✅ 推薦） |
| **3-8 檔案** | 中等功能（✅ 可接受） |
| **8+ 檔案** | 大功能，應考慮分解（❌ 警告） |

### 修復已推送的提交

#### 修改最後一個提交

```bash
# 修改提交訊息
git commit --amend -m "feat: new message"
git push origin branch-name --force-with-lease

# 添加遺漏的檔案
git add forgotten-file.ts
git commit --amend
git push origin branch-name --force-with-lease
```

#### 查看提交歷史

```bash
# 查看最近的提交
git log --oneline -10

# 查看特定檔案的提交
git log --oneline -- app/login/page.tsx

# 查看提交的詳細内容
git show <commit-hash>
```

---

## ⚠️ 常見和解

### 情況 1：誤推送敏感信息

```bash
# 檢查是否真的推送了敏感信息
git log -p -- .env.local | head -20

# 如果敏感信息已推送到遠端，立即：
# 1. 輪換所有受影響的密鑰和令牌
# 2. 聯繫團隊成員
# 3. 從歷史記錄中移除文件
git filter-branch --tree-filter 'rm -f .env.local' HEAD
git push origin branch-name --force-with-lease
```

### 情況 2：合併衝突

```bash
# 當有多人編輯同一檔案時發生
git pull origin develop

# Git 會標記衝突位置，手動編輯解決
# 編輯檔案，移除衝突標記 <<<<<<<, =======, >>>>>>>

# 解決後
git add resolved-file.ts
git commit -m "fix: resolve merge conflict"
git push origin feature/your-feature
```

### 情況 3：誤刪分支恢復

```bash
# 找到被刪除的分支的最後一個提交
git reflog

# 恢復分支
git checkout -b feature/recovered-branch <commit-hash>
```

---

## 📚 有用的 Git 指令

### 日常開發

```bash
# 查看當前狀態
git status

# 查看未暫存的變更
git diff

# 查看已暫存的變更
git diff --staged

# 提交變更
git commit -m "type(scope): message"

# 推送到遠端
git push origin <branch-name>

# 拉取遠端變更
git pull origin <branch-name>
```

### 分支管理

```bash
# 列出所有分支
git branch -a

# 創建新分支
git branch <branch-name>

# 切換分支
git checkout <branch-name>

# 快速創建並切換（推薦）
git checkout -b <branch-name>

# 刪除本地分支
git branch -d <branch-name>

# 刪除遠端分支
git push origin --delete <branch-name>

# 重命名分支
git branch -m <old-name> <new-name>
```

### 查看歷史

```bash
# 簡潔的提交歷史
git log --oneline -10

# 圖形化呈現分支
git log --graph --oneline --all

# 查看特定檔案的變更
git log -p -- app/page.tsx

# 查看誰修改了某行代碼
git blame app/page.tsx
```

### 撤銷變更

```bash
# 放棄暫存區的變更
git reset HEAD <file>

# 放棄工作目錄的變更
git checkout -- <file>

# 撤銷最後一個提交（但保留變更）
git reset --soft HEAD~1

# 撤銷最後一個提交（放棄變更）
git reset --hard HEAD~1
```

---

## 🎓 學習資源

- [Git 官方文檔](https://git-scm.com/doc)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
