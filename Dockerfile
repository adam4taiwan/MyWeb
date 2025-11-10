# ----------------------------------------------------
# 階段 1: 建構 (Builder Stage) - 產生 Standalone 輸出
# ----------------------------------------------------
# 建議使用 Node.js 20 穩定版本作為基礎
FROM node:20-alpine AS builder

# 設定環境變數為生產模式
ENV NODE_ENV=production
WORKDIR /app

# 複製 package 檔案 (確保 package.json 和 lock 檔案在第一層，以利用 Docker Cache)
COPY package.json package-lock.json ./

# 安裝所有依賴
# 由於 next.config.ts 需要 'typescript' (通常是 devDependencies)，
# 我們必須確保安裝所有依賴才能成功建構。
RUN npm install

# 複製所有程式碼，包括 next.config.ts、app/page.tsx 等
COPY . .

# 運行建構指令，這會產生 .next/standalone/ 和 .next/static/
RUN npm run build

# ----------------------------------------------------
# 階段 2: 運行 (Runner Stage) - 輕量化服務器
# ----------------------------------------------------
# 使用 Node.js 輕量化映像作為最終運行環境
FROM node:20-alpine AS runner

# 設定環境變數和工作目錄
ENV NODE_ENV=production
WORKDIR /app

# 1. 複製 Standalone 模式所需檔案
# Next.js 將運行伺服器所需的程式碼輸出到此路徑
COPY --from=builder /app/.next/standalone ./
# 靜態資源 (如圖片、字體等)
COPY --from=builder /app/.next/static ./.next/static

# 2. 複製 public/ 資料夾內容 (用於 Next.js 的 public 資源)
COPY --from=builder /app/public ./public

# 暴露端口 (Next.js 預設使用 3000)
EXPOSE 3000

# Next.js 應用程式啟動指令
# 使用 node server.js 啟動編譯好的 standalone 服務器
CMD ["node", "server.js"]