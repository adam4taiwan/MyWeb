# 使用 Node.js 18 的 Alpine 版本作為基礎映像
FROM node:18-alpine

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json (或 yarn.lock)
COPY package*.json ./

# 安裝所有依賴
RUN npm install

# 安裝 'serve' 套件，用於提供靜態檔案
# 因為你的 Next.js 專案設定為 'output: export'，所以需要一個靜態檔案伺服器
RUN npm install -g serve

# 複製應用程式的其他所有檔案到工作目錄
COPY . .

# 執行 Next.js 建置，這會根據你的 'output: export' 設定生成 'out' 目錄
RUN npm run build

# 暴露容器內部應用程式將監聽的埠
EXPOSE 3000

# 啟動靜態檔案伺服器 'serve'
# -s out: 指定要提供服務的目錄是 'out'，並啟用單頁應用程式模式（對於 Next.js 靜態導出很有用）
# -p 3000: 指定 'serve' 監聽的埠是 3000
CMD ["serve", "-s", "out", "-p", "3000"]
