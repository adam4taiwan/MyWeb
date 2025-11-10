# ----------------------------------------------------
# 階段 1: 建構 (Builder Stage) - 產生 Standalone 輸出
# ----------------------------------------------------
FROM node:20-alpine AS builder

# 設定環境變數
ENV NODE_ENV=production
WORKDIR /app

# 複製 package 檔案
COPY package.json package-lock.json ./

# 安裝 Next.js 依賴
RUN npm install

# 複製所有程式碼，包括 next.config.ts 和 app 資料夾
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

# 僅複製 Standalone 模式所需檔案
# 1. 複製程式碼依賴（在 standalone 模式下，這是運行伺服器所需的）
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/node_modules /app/node_modules

# 2. 複製 Standalone 輸出和靜態資源
# standalone 目錄包含編譯好的服務器程式
COPY --from=builder /app/.next/standalone ./
# static 目錄包含網頁所需的靜態資源
COPY --from=builder /app/.next/static ./.next/static 

# 暴露端口 (Next.js 預設使用 3000 或環境變數 PORT)
EXPOSE 3000

# Next.js 應用程式啟動指令
# 使用 node server.js 啟動服務器，這是 standalone 模式的入口
CMD ["node", "server.js"]