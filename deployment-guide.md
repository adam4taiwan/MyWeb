# deployment-guide.md

此檔案提供 MyWeb 專案的詳細部署指南，涵蓋開發、預發佈和正式生產環境。

---

## 🌍 部署環境概述

MyWeb 應用程式支援多個部署環境：

| 環境 | 用途 | 訪問 | 主機 |
|------|------|------|------|
| **本地開發** | 本地開發和測試 | http://localhost:3000 | 本地機器 |
| **預發佈環境** | 測試和驗證（可選） | https://staging.myweb.fly.dev | Fly.io |
| **正式生產** | 實時用戶訪問 | https://myweb.fly.dev | Fly.io |

---

## 🛠️ 本地開發環境

### 初始化開發環境

```bash
# 1. 克隆儲存庫
git clone <repository-url>
cd MyWeb

# 2. 安裝依賴
npm install

# 3. 建立本地環境檔案
cp .env.example .env.local  # 如果存在

# 4. 配置環境變數
# 編輯 .env.local 並設定：
# NEXT_PUBLIC_API_BASE_URL=https://localhost:32801
# 或您的本地後端地址
```

### .env.local 配置（開發環境）

```env
# API 端點（開發環境）
NEXT_PUBLIC_API_BASE_URL=https://localhost:32801
NEXT_PUBLIC_API_URL=https://localhost:32801/api

# 其他開發相關變數
# NODE_ENV=development (Next.js 自動設置)
```

### 啟動開發伺服器

```bash
# 啟動開發伺服器（帶熱重載）
npm run dev

# 在瀏覽器中訪問
# http://localhost:3000

# 停止伺服器：Ctrl+C
```

### 開發過程中的常見問題

#### 1. 樣式未應用

```bash
# 清理構建成品並重啟
rm -rf .next
npm run dev
```

#### 2. TypeScript 錯誤

```bash
# 檢查 TypeScript 編譯
npm run build

# 查看具體錯誤信息並修復
```

#### 3. API 連接失敗

```bash
# 驗證後端服務正在運行
# 檢查 .env.local 中的 API 地址是否正確
# 確認防火牆和代理設定

# 可以測試 API 連接：
curl https://localhost:32801/health
```

---

## 🔨 構建流程

### 本地構建

在將程式碼部署到遠端前，應在本地測試構建：

```bash
# 1. 開始構建（生產模式）
npm run build

# 2. 檢查構建輸出
# ✅ 成功會顯示：
# ✓ Compiled successfully
# ✓ Linting and checking validity of types
```

### 構建失敗除錯

```bash
# 清理並重新構建
rm -rf .next node_modules package-lock.json
npm install
npm run build

# 檢查 ESLint 問題
npm run lint

# 檢查 TypeScript 問題
npx tsc --noEmit
```

### 測試生產構建

```bash
# 1. 構建成功後，啟動生產伺服器
npm start

# 2. 訪問 http://localhost:3000
# 3. 驗證所有功能正常工作
# 4. 檢查性能（F12 開發工具）
# 5. Ctrl+C 停止伺服器
```

---

## 🐳 Docker 部署

### Docker 構建流程

MyWeb 使用多階段 Docker 構建：

```dockerfile
# 階段 1：Builder - 編譯應用程式
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 階段 2：Runner - 輕量化運行環境
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

### 本地 Docker 構建和測試

```bash
# 1. 構建 Docker 映像
docker build -t myweb-next-app:latest .

# 2. 運行容器進行測試
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://ecanapi.fly.dev/api \
  myweb-next-app:latest

# 3. 訪問應用程式
# http://localhost:3000

# 4. 檢查容器日誌
docker logs <container-id>

# 5. 停止容器
docker stop <container-id>
```

### Docker 常用指令

```bash
# 列出映像
docker images

# 列出運行中的容器
docker ps

# 移除映像
docker rmi myweb-next-app:latest

# 進入運行中的容器（除錯）
docker exec -it <container-id> sh
```

---

## 🚀 Fly.io 部署指南

### 前置要求

```bash
# 1. 安裝 Fly.io CLI
# macOS
brew install flyctl

# Linux
curl -L https://fly.io/install.sh | sh

# Windows
scoop install flyctl

# 2. 登入 Fly.io
flyctl auth login

# 3. 驗證登入
flyctl auth whoami
```

### 建立或初始化應用程式

```bash
# 如果是第一次部署，初始化應用程式
flyctl launch --name myweb

# 系統會詢問配置問題：
# - Dockerfile path: ./Dockerfile
# - Deploy now?: Yes

# 這會生成 fly.toml 配置檔案
```

### 查看 fly.toml 配置

```toml
app = 'myweb'
primary_region = 'sin'  # 新加坡

[build]
  args = { NEXT_PUBLIC_API_URL = "https://ecanapi.fly.dev" }

[env]
  NEXT_PUBLIC_API_URL = "https://ecanapi.fly.dev/api"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = 'stop'
  auto_start_machines = true
  min_machines_running = 0
```

### 部署流程

#### 1. 部署新版本

```bash
# 1. 確保所有變更已提交
git status  # 應顯示「nothing to commit」

# 2. 檢查構建是否通過
npm run build

# 3. 部署到 Fly.io
flyctl deploy

# 部署過程：
# - 構建 Docker 映像
# - 推送到 Fly.io
# - 啟動新機器
# - 運行健康檢查
# - 路由流量到新版本

# 4. 監控部署
flyctl status

# 5. 查看實時日誌
flyctl logs
```

#### 2. 回滾版本（如有問題）

```bash
# 查看部署歷史
flyctl releases

# 回滾到特定版本
flyctl releases rollback <version-number>
```

### 環境變數管理

```bash
# 設定環境變數
flyctl secrets set NEXT_PUBLIC_API_URL="https://ecanapi.fly.dev/api"

# 查看已設定的環境變數
flyctl secrets list

# 刪除環境變數
flyctl secrets unset NEXT_PUBLIC_API_URL

# 重新部署以應用新變數
flyctl deploy
```

### 監控和故障排除

```bash
# 查看應用程式狀態
flyctl status

# 查看實時日誌
flyctl logs

# 查看過去的日誌
flyctl logs --since 1h

# 連接到應用程式（SSH）
flyctl ssh console

# 檢查機器狀態
flyctl machines list

# 查看機器的詳細信息
flyctl machines show <machine-id>
```

### 提高應用程式規模

```bash
# 查看當前配置
flyctl machine list

# 增加 CPU 和內存
flyctl scale vm shared-cpu-1x 1gb

# 查看成本
flyctl billing
```

---

## 📋 預發佈環境（Staging）

如果您想要一個獨立的預發佈環境進行測試：

### 創建預發佈應用程式

```bash
# 創建新的 Fly.io 應用程式用於預發佈
flyctl launch --name myweb-staging

# 配置不同的環境變數
flyctl secrets set NEXT_PUBLIC_API_URL="https://staging-api.example.com/api"

# 部署預發佈版本
flyctl deploy --app myweb-staging
```

### 預發佈部署流程

```bash
# 1. 推送到 develop 分支並創建 PR
git push origin feature/your-feature

# 2. 在預發佈環境測試
cd MyWeb
flyctl deploy --app myweb-staging

# 3. 訪問預發佈應用程式
# https://myweb-staging.fly.dev

# 4. 測試和驗證
# - 功能測試
# - 性能測試
# - 相容性測試

# 5. 代碼審查並合併到 main
# （創建 PR 並等待批准）

# 6. 部署到正式環境
flyctl deploy --app myweb
```

---

## ✅ 部署前檢查清單

### 代碼準備

```markdown
[ ] 所有變更已提交
[ ] 所有分支已推送到遠端
[ ] ESLint 檢查通過：`npm run lint`
[ ] TypeScript 編譯通過：`npm run build`
[ ] 本地測試通過：`npm start`
[ ] 代碼審查已完成
[ ] PR 已合併到 main 分支
```

### 環境驗證

```markdown
[ ] .env 變數已正確配置
[ ] API 端點指向正確的服務器
[ ] 資料庫連接字符串正確
[ ] 所有必要的密鑰已設定
[ ] CORS 設定正確
[ ] HTTPS 已啟用
```

### 應用程式驗證

```markdown
[ ] 首頁正常載入
[ ] 登入/登出功能正常
[ ] API 呼叫正常
[ ] 表單提交正常
[ ] 應用程式響應式設計正常
[ ] 沒有控制台錯誤
[ ] 沒有破損的連結
[ ] 圖片正確載入
```

### 文檔和通知

```markdown
[ ] 變更日誌已更新
[ ] 相關文檔已更新
[ ] 團隊成員已通知
[ ] 如有破壞性變更，已通知用戶
```

---

## 🔒 安全檢查清單

部署前必須完成安全檢查：

```markdown
[ ] 沒有敏感信息（密鑰、密碼）硬編碼在代碼中
[ ] 環境變數未提交到 Git
[ ] HTTPS 已強制啟用
[ ] Cookies 設定了 HttpOnly、Secure、SameSite
[ ] 用戶輸入已驗證和清理
[ ] API 端點有適當的認證檢查
[ ] 沒有已知的 npm 漏洞：`npm audit`
[ ] 敏感操作已記錄和監控
```

---

## 🔍 部署後監控

### 監控任務

部署後的前 2 小時内：

```bash
# 1. 實時監控應用程式
flyctl logs --follow

# 2. 檢查應用程式可用性
curl https://myweb.fly.dev/health

# 3. 檢查錯誤率
# 在 Fly.io 儀表板或通過 API 檢查

# 4. 測試關鍵功能
# - 用戶登入
# - 數據提取
# - 表單提交

# 5. 檢查性能指標
# - 頁面加載時間
# - API 響應時間
# - 伺服器資源使用
```

### 常見部署問題

#### 問題 1：應用程式無法啟動

```bash
# 查看詳細日誌
flyctl logs --lines 100

# 可能的原因：
# - NODE_ENV 未設定為 production
# - 環境變數缺失
# - Next.js 構建失敗
# - 端口已被佔用

# 解決方案：
# 1. 檢查 Dockerfile 和構建過程
# 2. 驗證所有環境變數已設定
# 3. 檢查依賴是否正確安裝
```

#### 問題 2：API 連接失敗

```bash
# 驗證 API 端點
flyctl secrets list

# 測試 API 連通性
curl https://ecanapi.fly.dev/health

# 檢查 CORS 設定
# 確保 API 允許來自您的域的請求
```

#### 問題 3：靜態資源（圖片、CSS）未載入

```bash
# 驗證 public/ 目錄已複製
docker exec <container-id> ls -la /app/public

# 檢查 Dockerfile 是否包含
# COPY --from=builder /app/public ./public
```

---

## 📊 部署統計和性能

### 構建時間

| 階段 | 預期時間 |
|------|--------|
| 本地構建 | 1-2 分鐘 |
| Docker 構建 | 3-5 分鐘 |
| Fly.io 部署 | 2-5 分鐘 |
| **總計** | **6-12 分鐘** |

### 應用程式大小

```
Docker 映像大小：~200-300MB
部署機器最小配置：1GB RAM、Shared CPU
推薦配置：2GB RAM、Shared CPU（用於生產）
```

---

## 🔄 CI/CD 自動化（未來改進）

目前部署是手動的，未來可以考慮自動化：

```yaml
# .github/workflows/deploy.yml（示例）
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: superfly/flyctl-actions@master
        with:
          args: "deploy"
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

---

## 📚 有用的資源

- [Fly.io 官方文檔](https://fly.io/docs/)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
- [Docker 官方文檔](https://docs.docker.com/)
- [Fly.io CLI 參考](https://fly.io/docs/reference/flyctl/)
