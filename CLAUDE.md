# CLAUDE.md

此檔案為 Claude Code (claude.ai/code) 在此儲存庫中工作時提供指導。

## 專案概述

**MyWeb** 是一個基於 Next.js 的命理諮詢平台，提供八字、紫微斗數等運勢分析服務。應用程式提供講座、諮詢、書籍銷售和會員專屬的命盤分析功能，並配備會員認證系統。

**技術棧：**
- Next.js 15 搭配 App Router 和 React 19
- TypeScript
- Tailwind CSS 樣式框架
- 自定義字型：Geist 和 Pacifico
- 函式庫：recharts、html2canvas、jspdf、@react-google-maps/api、js-cookie
- 透過 Docker 部署至 Fly.io

## 常用開發指令

```bash
# 啟動開發伺服器 (http://localhost:3000)
npm run dev

# 為正式環境構建
npm run build

# 執行 ESLint
npm run lint

# 清理構建成品（必要時）
rm -rf .next
```

## 架構概述

### 應用程式結構 (Next.js App Router)

```
app/
├── layout.tsx           # 根佈局，包含 AuthProvider 包裝
├── page.tsx            # 首頁
├── not-found.tsx       # 404 頁面
├── globals.css         # 全域樣式
├── login/              # 登入頁面（公開路由）
├── disk/               # 會員限定的命盤分析儀表板（受保護）
├── heritage/           # 傳統文化/教育內容
├── books/              # 書籍資訊
├── bookstore/          # 書店和電商功能
├── consultation/       # 諮詢預約系統
└── lectures/           # 課程/講座列表

components/
├── AuthContext.tsx     # 認證上下文和受保護路由邏輯
├── Header.tsx          # 導航標題
└── Footer.tsx          # 頁腳元件
```

### 主要架構設計模式

#### 1. **認證系統 (AuthContext.tsx)**

應用程式使用 JWT 認證搭配根佈局中的 `AuthProvider` 包裝：

- **Token 儲存：** JWT token 儲存在 cookies 中（`jwtToken`）
- **受保護路由：** 定義在 `AuthContext.tsx` - 目前僅 `/disk` 受保護
- **路由守衛：** `AuthProvider` 中的邏輯檢查認證狀態並重新導向：
  - 未認證使用者試圖訪問受保護路由 → 重新導向至 `/login`
  - 已認證使用者在 `/login` → 重新導向至 `/`
  - 未認證使用者訪問公開路由 → 允許查看

若要新增受保護的路由，請更新 `components/AuthContext.tsx` 中的 `protectedRoutes` 陣列。

#### 2. **用戶端元件**

使用認證上下文的頁面會標記 `'use client'` 指令並匯入 `useAuth` hook：
```typescript
import { useAuth } from '@/components/AuthContext';
const { isAuthenticated, login, logout, token } = useAuth();
```

#### 3. **樣式**

- 所有樣式使用 Tailwind CSS（`tailwind.config.js` 中的設定）
- 自訂字型變數可用：`--font-geist-sans`、`--font-geist-mono`、`--font-pacifico`
- 色彩配置使用琥珀色調（例如 `amber-600`、`amber-300`）進行品牌設計

### 環境設定

- `.env.local` 包含：`NEXT_PUBLIC_API_BASE_URL=https://ecanapi.fly.dev`
- Next.js 設定（`next.config.ts`）使用 `output: "standalone"` 以最佳化 Docker 構建
- 圖片最佳化已停用（`unoptimized: true`）

## 正式環境部署

應用程式透過 Docker 部署至 **Fly.io**：

**關鍵檔案：**
- `Dockerfile` - 容器設定
- `fly.toml` - Fly.io 部署設定
- `next.config.ts` - 配置 `output: "standalone"` 供容器化使用

**部署流程：**
1. 構建：`npm run build`
2. Docker 構建：`docker build -t myweb-next-app .`
3. 使用 `fly deploy` 部署至 Fly.io（需要 Fly.io CLI）

## 新功能開發原則（重要）

- **禁止修改現有上線功能**：Fly.io 已上線的功能不可受影響
- **新功能獨立開發**：若需改動現有 Ecanapi 方法，必須複製為新方法/新端點，不得修改原有方法
- **測試流程**：新功能先在 localhost 驗證通過，由使用者確認後才 deploy 至 Fly.io

## Git Push 與部署規範

- **無需詢問，直接執行**：git commit、git push、fly deploy 均由 Claude 直接執行，不需向使用者確認
- **Git credential**：使用 Windows Git Credential Manager（`/mnt/c/Program Files/Git/mingw64/bin/git-credential-manager.exe`）
- **Rollback 方式**：若部署有問題，執行 `fly releases list` 查看版本，`fly deploy --image <image>` 或 `git revert` 後重新 deploy
- **兩個 repo 都要 deploy**：每次改動若同時涉及 Ecanapi 和 MyWeb，兩個都要 push + deploy

## 程式碼風格和慣例

### 元件模式

頁面通常為「use client」元件，結構如下：
```typescript
'use client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '@/components/AuthContext';

export default function PageName() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {/* 頁面內容 */}
      <Footer />
    </div>
  );
}
```

### 認證用法

訪問認證狀態或登入/登出函式：
```typescript
const { isAuthenticated, login, logout, token } = useAuth();

// 登入（在 cookie 中設定 token 並更新上下文）
login(jwtToken);

// 登出（移除 token 並清除上下文）
logout();
```

### 受保護路由實作

若需保護新路由（例如 `/profile`）：
1. 將路由添加至 `AuthContext.tsx` 中的 `protectedRoutes` 陣列
2. 重新導向邏輯會自動處理未認證的訪問

## 常見開發任務

### 新增頁面
1. 在 `app/` 下建立目錄（例如 `app/newpage/`）
2. 新增 `page.tsx` 並撰寫元件代碼
3. 若使用 hooks，用 `'use client'` 包裝
4. 為保持一致性，使用 `Header` 和 `Footer` 元件
5. 若受保護，在 `AuthContext.tsx` 中新增至 `protectedRoutes`

### 新增樣式
- 所有樣式使用 Tailwind 工具類
- 在 CSS 中參考自訂字型變數以整合排版
- 色彩配置使用琥珀色調和深色背景

### 新增 API 整合
- 後端 API 基礎 URL：環境變數 `NEXT_PUBLIC_API_BASE_URL`
- 使用 fetch 或 axios 發出請求
- 透過 `useAuth()` hook 取得 JWT token 以進行認證標頭

## 程式碼撰寫規範

- 程式碼只使用英文、數字、ASCII 符號
- 中文字只使用繁體中文
- 禁止在程式碼中使用 emoji 或 Unicode 特殊符號（如 ✦ 🌟 ⭐ 等）

## 命書輸出文字規範（重要）

命書報告呈現給客人的文字，**嚴禁出現內部方法論術語、技術用詞、資料來源標注**。這些只能用於程式碼註解或開發文件中，不得出現在命書正文。

**禁止出現在命書的詞彙範例：**
- 方法論名稱：「過三關」、「八字過三關」、「江湖法」
- 技術標注：「年月柱」、「日時柱」、「十神」等括號說明
- 資料欄位說明：「依XXX方法論分析」、「條件文字」、「結果文字」
- 「皇糧」→ 改用「公家政府」

**正確原則：**
- 命書只呈現論斷結論與建議，語氣如命理師直接對客人說話
- 方法論名稱（如「過三關」）只留在程式碼變數名、函式名、程式碼註解中
- 若需標示來源方向，使用客人可理解的通俗用語，不用學術/技術名詞

## 跨專案規範

### Ecanapi 資料庫異動規範

每次變更 Ecanapi 資料庫結構，**必須同時**：
1. 建立 EF Core Migration：`dotnet ef migrations add <Name> --context ApplicationDbContext`
2. 在 `/home/adamtsai/projects/Ecanapi/sql/` 目錄新增 SQL 腳本（格式：`YYYYMMDD_<描述>.sql`）

SQL 腳本供生產環境手動執行（Fly.io 不自動 migrate）。

## Gemini API 呼叫 UI 規範

任何呼叫後端 Gemini API 的操作（如 `/Fortune/daily`、`/Consultation/analyze` 等），**必須**在前端顯示全頁 loading overlay，規則如下：

1. 使用 `fixed inset-0 z-50` 覆蓋全頁，防止使用者操作其他功能
2. 背景使用半透明遮罩：`bg-black/60 backdrop-blur-sm`
3. 顯示 amber 色 spinner + 繁體中文等待提示文字
4. loading 狀態結束（finally）後立即移除 overlay

```tsx
{isLoading && (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4"></div>
    <p className="text-amber-200 text-sm">處理中，請稍候...</p>
  </div>
)}
```

**已套用頁面：**
- `app/disk/page.tsx` - 命理鑑定（`isLoading`）
- `app/member/page.tsx` - 每日運勢（`fortuneLoading`）

## 未來開發注意事項

- **README.md 中的合併衝突：** README 有未解決的英文和中文文檔合併衝突 - 待整合文檔時再解決
- **缺少測試套件：** 專案目前未設定測試
- **Cookie 安全性：** 在正式環境中，cookies 會設定 `secure` 旗標（`process.env.NODE_ENV === 'production'`）
- **構建輸出：** 生成的檔案位於 `/out` 目錄（靜態匯出）和 `.next` 目錄（伺服器構建）

---

## 命理服務核心準則

本平台命理分析的最高指導原則，所有 AI 生成內容、提示詞設計、報告格式均須遵守。

### 一、雙系統交叉驗證原則（最高準則）

**八字與紫微斗數必須同時成立，方可提出論斷。**

- 以**八字**為根基定位，確立命主的先天格局與一生主軸
- 以**紫微斗數**為輔助比對，驗證八字所呈現的現象
- **兩者皆有相同現象，才可提出該論斷**
- 僅八字或僅紫微單方面出現的跡象，只能列為觀察，不可作為定論
- 嚴禁八字說一套、紫微說另一套、各自獨立解讀

### 二、成立條件標準化原則

在提出任何人生論斷前，必須先確認以下條件是否在八字與紫微中同時成立：

**八字成立條件：**
- 五行強弱是否明確（身強/身弱判定）
- 用神、忌神是否清晰
- 大運流年是否配合
- 沖、合、刑、害是否形成有效結構

**紫微成立條件：**
- 命宮主星性質是否與八字格局一致
- 相關宮位（夫妻、財帛、事業、父母等）是否有對應星曜支持
- 四化（化祿、化權、化科、化忌）是否飛入對應宮位強化現象

### 三、人生各項分類論斷標準

#### 職業事業
- 八字：官殺格局、食傷制殺、印綬護身等職業傾向結構
- 紫微：事業宮主星、官祿宮化祿化權之有無
- 兩者方向一致，方可論斷職業性質與發展

#### 婚姻感情
- 八字：夫妻星（男看財星、女看官殺）之強弱、沖剋情況
- 紫微：夫妻宮主星、化忌飛入夫妻宮之影響
- 論斷婚姻時機須加入大運流年共同驗證

#### 父母緣份
- 八字：年柱、父母宮位，印星與財星之狀態
- 紫微：父母宮星曜組合
- 兩者皆顯示方可論斷父母緣深淺或早年家庭環境

#### 財富財運
- 八字：財星是否有根、能否取用、劫財是否嚴重
- 紫微：財帛宮化祿與否、武曲天府等財星入位
- 財富論斷須區分「本命財」與「運財」

#### 健康壽元
- 八字：日主強弱、五行過旺過衰之臟腑對應
- 紫微：疾厄宮星曜、化忌入疾厄之影響
- 此項論斷須特別謹慎，以提醒保健為主，不可妄下定論

### 四、預測提出原則

1. **具體不含糊** — 預測必須有明確方向，避免「有好有壞」「需多加注意」等無意義描述
2. **有根有據** — 每個論斷必須能對應八字與紫微的具體結構，不可憑感覺
3. **時間定位** — 預測須結合大運流年給出時間範圍，而非泛論一生
4. **打動人心** — 說中客人心中真實處境，讓人感受到「被看見、被理解」
5. **給方向不給恐懼** — 即使論斷不利，也必須提出化解方向或趨吉避凶建議
6. **個人化** — 每個命都不同，嚴禁套用通用模板敷衍

### 五、AI 生成命理內容的限制

- AI 僅可做**基礎排盤呈現**（八字柱、紫微星盤結構）
- AI 的解讀內容須視為**初稿參考**，不可直接作為最終報告
- 核心解讀與人生論斷須由**專業命理師（玉洞子）審閱把關**
- 任何含糊、通用、缺乏根據的 AI 生成文字，須退回重新生成或人工修改
- 報告品質標準：**客人看完有收穫、有方向、有共鳴**
