# ----------------------------------------------------
# 階段 1: 建構 (Builder Stage) - 產生 Standalone 輸出
# ----------------------------------------------------
FROM node:20-alpine AS builder

# 我們故意不在此階段設置 NODE_ENV=production，以確保 devDependencies (如 typescript) 被安裝。
WORKDIR /app

# 複製 package 檔案 (確保 package.json 和 lock 檔案在第一層，以利用 Docker Cache)
COPY package.json package-lock.json ./

# 安裝所有依賴 (包括 devDependencies，這是建構 next.config.ts 所必需的)
RUN npm install

# 複製所有程式碼
COPY . .

# 運行建構指令
RUN npm run build

# ----------------------------------------------------
# 階段 2: 運行 (Runner Stage) - 輕量化服務器
# ----------------------------------------------------
FROM node:20-alpine AS runner

# ***只在此階段設置 NODE_ENV=production***
ENV NODE_ENV=production
WORKDIR /app

# 1. 複製 Standalone 模式所需檔案
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 2. 複製 public/ 資料夾內容
COPY --from=builder /app/public ./public

# 暴露端口 (Next.js 預設使用 3000)
EXPOSE 3000

# Next.js 應用程式啟動指令
CMD ["node", "server.js"]