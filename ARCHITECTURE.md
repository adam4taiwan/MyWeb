# 玉洞子星相古學堂 - 系統架構文件

更新日期：2026-08-10

---

## 整體架構圖

```
用戶瀏覽器
     |
     v
Cloudflare CDN (yudongzi.tw)
  - DNS Nameserver: cosmin.ns.cloudflare.com / annabel.ns.cloudflare.com
  - IP: 172.67.218.237 / 104.21.24.129 (Cloudflare Anycast)
  - 功能: CDN 快取、DDoS 防護、SSL 憑證、Cache Purge on Deploy
     |
     v
Fly.io - myweb (前端)
  - 應用: Next.js 15 (App Router, React 19)
  - 規格: shared-cpu-1x, 512MB RAM, 1 台機器
  - 區域: Singapore (sin)
  - 網址: myweb.fly.dev / yudongzi.tw
     |
     v
Fly.io - ecanapi (後端 API)
  - 應用: C# .NET API
  - 規格: shared-cpu-1x, 1GB RAM, 1 台機器
  - 區域: Singapore (sin)
  - 網址: ecanapi.fly.dev
     |
     v
NeonDB (資料庫)
  - 引擎: PostgreSQL (Serverless)
  - 位置: AWS ap-southeast-1 (新加坡)
  - 連線: ep-tiny-flower-a1gv6jkf-pooler.ap-southeast-1.aws.neon.tech:5432
  - 資料庫名稱: neondb
```

---

## 各服務明細

### 網域與 CDN
| 項目 | 內容 |
|------|------|
| 網域 | yudongzi.tw |
| 網域註冊商 | GoDaddy |
| DNS 管理 | Cloudflare |
| CDN | Cloudflare (免費方案) |
| SSL | Cloudflare 自動管理 |

### 前端 (myweb)
| 項目 | 內容 |
|------|------|
| 框架 | Next.js 15 + React 19 + TypeScript |
| 樣式 | Tailwind CSS |
| 部署平台 | Fly.io |
| 機器規格 | shared-cpu-1x, 512MB |
| 機器數量 | 1 台 |
| 部署區域 | Singapore (sin) |
| Git Repo | github.com/adam4taiwan/MyWeb |

### 後端 (ecanapi)
| 項目 | 內容 |
|------|------|
| 框架 | C# .NET (ASP.NET Core) |
| 部署平台 | Fly.io |
| 機器規格 | shared-cpu-1x, 1GB |
| 機器數量 | 1 台 |
| 部署區域 | Singapore (sin) |
| Git Repo | github.com/adam4taiwan/Ecanapi |
| AI 服務 | Google Gemini API |

### 資料庫 (NeonDB)
| 項目 | 內容 |
|------|------|
| 類型 | PostgreSQL (Serverless) |
| 服務商 | Neon |
| 區域 | AWS ap-southeast-1 |
| ORM | EF Core (Entity Framework) |
| Migration | 手動執行 SQL 腳本 (sql/ 目錄) |

---

## 部署流程

```
git commit + git push
       |
       v
   ./deploy.sh
       |
       +-- fly deploy (建置 Docker image + 部署至 Fly.io)
       |
       +-- Cloudflare Cache Purge (清除 yudongzi.tw 全站快取)
```

> 注意：必須使用 `./deploy.sh`，不可直接 `fly deploy`（不會清 CDN 快取）

---

## 每月費用估算

| 服務 | 費用 |
|------|------|
| Cloudflare | 免費 |
| Fly.io myweb (1台 512MB) | ~$3-4 USD |
| Fly.io ecanapi (1台 1GB) | ~$11 USD |
| NeonDB | 免費方案 |
| GoDaddy 網域 | 年費約 $10-15 USD |
| **合計** | **~$14-15 USD/月** |

---

## 版本備份記錄

| 日期 | 備份內容 | 位置 |
|------|----------|------|
| 2026-08-08 | MyWeb + Ecanapi source code | D:\data\backup_20260808 |
| 2026-08-08 | NeonDB 完整資料庫 | 本地 pgAdmin4 匯出 |
