<<<<<<< HEAD
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
Remove-Item -Recurse -Force .next

你可以依下列步驟，將 Next.js 網站部署到 QNAP NAS（假設你要用 Node.js 伺服器模式）：

1. 產生靜態檔案或 Node.js 產物
在本機專案根目錄執行：


npm run build
這會產生 .next、out 等發佈用檔案。

2. 將專案檔案上傳到 QNAP NAS
建議只上傳必要檔案（package.json、.next、public、node_modules、next.config.js、app 或 pages 等）。
可用 SFTP、Samba、QNAP File Station 或 WinSCP 上傳到 NAS 目標資料夾（例如 /share/Web/myweb）。
3. 在 QNAP NAS 安裝 Node.js
進入 QNAP App Center，安裝「Node.js」套件。
或用 QNAP Container Station 執行 Node.js Docker 容器。
4. 在 NAS 上安裝相依套件
用 SSH 連線到 NAS，切換到你的網站目錄：

cd /share/CACHEDEV1_DATA/.qpkg/MyWeb
npx next start -p 3000 -H 0.0.0.0
cd /share/Web/mywebnpm install --production
5. 啟動 Next.js 伺服器

npm start# 或npx next start
預設會在 3000 port 提供服務。

6. 設定 NAS 反向代理（可選）

恭喜你！很高興聽到你的網頁應用程式成功運行了。

如果你以後需要更改網頁內容或影像，並希望這些更改反映在你的 Docker 容器中，你需要遵循以下步驟：

修改你的 Next.js 網頁或影像：

在你的 Next.js 專案的原始碼中進行所需的更改。這可能包括編輯 .js, .jsx, .ts, .tsx 檔案，新增或修改影像檔案（例如 public/images/ 下的檔案），或更新 CSS/樣式。

重新建置 Next.js 應用程式：

在你的 Next.js 專案的根目錄下，執行建置命令。這會根據你的 next.config.js 中的 output: 'export' 設定，重新生成 out 目錄中的靜態檔案。

Bash

npm run build
重新建置 Docker 映像：

由於你已經更改了應用程式的內容，你需要用這些新內容來重新建置 Docker 映像。在包含你的 Dockerfile 的目錄中執行：

Bash

docker build -t myweb-next-app .
這將使用更新後的 out 目錄內容，以及 Dockerfile 中定義的所有步驟，來創建一個新的 myweb-next-app 映像版本。

停止並移除舊的 Docker 容器：

你現在有一個新的 Docker 映像，但舊的容器仍然在運行舊版本的應用程式。你需要停止並移除它，以便為新容器騰出名稱和埠。

Bash

docker stop myweb-next-container
docker rm myweb-next-container
如果 docker stop 報告容器已經停止（因為它可能已經由於某些原因退出），你可以直接執行 docker rm。

運行新的 Docker 容器：

現在你可以使用剛剛建置的新映像來啟動一個新的容器。

Bash

docker run -d --name myweb-next-container -p 3010:3000 myweb-next-app
如果你之前因為埠衝突而使用了不同的主機埠（例如 3011），請確保在這裡也使用相同的埠。

完成這些步驟後，你的網頁應用程式將會更新到你最新修改的內容。
=======
# MyWeb
Adam 個人網站
>>>>>>> 601a33a9773e88e3e030ac1193187032b3c9ea0a
