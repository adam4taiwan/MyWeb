# disaster-recovery-guide.md

本檔案定義 MyWeb 應用程式的災難恢復計劃和故障排除指南。

---

## 🚨 故障優先級定義

| 優先級 | 影響範圍 | 響應時間 | 恢復時間 |
|--------|---------|---------|---------|
| **P1 (Critical)** | 整個應用不可用，數據丟失 | 15 分鐘 | 1 小時 |
| **P2 (High)** | 關鍵功能不可用，部分用戶受影響 | 30 分鐘 | 4 小時 |
| **P3 (Medium)** | 非關鍵功能受影響，用戶可迂迴 | 2 小時 | 24 小時 |
| **P4 (Low)** | 輕微功能問題或偶發錯誤 | 24 小時 | 一周內 |

---

## 🔍 常見故障排查

### 故障 1：應用程式無法啟動

#### 症狀
- 訪問網站返回 500 錯誤
- 應用程式日誌顯示啟動失敗

#### 排查步驟

```bash
# 1. 檢查應用程式日誌
flyctl logs --follow

# 2. 檢查常見原因
# a. 環境變數是否設定
flyctl secrets list

# b. 構建是否成功
docker build -t test .

# c. 依賴是否正確安裝
npm audit

# 3. 檢查 Node.js 版本
node --version  # 應為 v20+

# 4. 檢查 Next.js 構建
npm run build

# 5. 檢查本地運行
npm start
```

#### 解決方案

```bash
# 如果是部署相關
flyctl deploy --detach --vm-memory 2048

# 如果是構建失敗
rm -rf node_modules .next
npm install
npm run build

# 回滾到上一個版本
flyctl releases
flyctl releases rollback <version>
```

---

### 故障 2：資料庫連接失敗

#### 症狀
- API 返回「資料庫連接錯誤」
- 登入功能不工作

#### 排查步驟

```bash
# 1. 檢查資料庫連接字符串
flyctl secrets list | grep -i database

# 2. 測試連接
# 根據資料庫類型執行相應命令

# MongoDB
mongo "your_connection_string"

# PostgreSQL
psql your_connection_string

# 3. 檢查網路連接
ping database-host

# 4. 檢查防火牆規則
# 確保應用程式 IP 在防火牆允許列表中

# 5. 查看應用程式日誌
flyctl logs --follow | grep -i database
```

#### 解決方案

```bash
# 重新設定連接字符串
flyctl secrets set DATABASE_URL="new_connection_string"

# 重新部署應用程式
flyctl deploy

# 如果資料庫本身故障
# 聯繫資料庫提供商並檢查其狀態頁面
```

---

### 故障 3：API 響應時間過長

#### 症狀
- 頁面加載緩慢
- API 端點超時（> 30 秒）

#### 排查步驟

```bash
# 1. 檢查伺服器資源使用
flyctl status

# 2. 查看慢查詢日誌
flyctl logs --follow | grep "slow_query"

# 3. 檢查 API 端點性能
curl -w "\n%{time_total}\n" https://api.example.com/endpoint

# 4. 檢查資料庫查詢
# 使用資料庫的查詢分析工具

# 5. 檢查網路延遲
ping -c 10 ecanapi.fly.dev
```

#### 解決方案

```javascript
// 識別並優化慢查詢
// 1. 添加數據庫索引
db.collection.createIndex({ field: 1 });

// 2. 優化 N+1 查詢
// 使用 populate（MongoDB）或 joins（SQL）

// 3. 實施快取
const cache = new Map();
const cachedData = cache.get(key) || fetchAndCache(key);

// 4. 分頁大型結果集
const users = await User.find()
  .skip((page - 1) * limit)
  .limit(limit);
```

---

### 故障 4：內存洩漏

#### 症狀
- 應用程式崩潰
- 內存使用不斷增加

#### 排查步驟

```bash
# 1. 檢查內存使用趨勢
flyctl logs --follow | grep "Memory"

# 2. 生成堆快照
node --inspect app.js

# 3. 使用 Chrome DevTools 分析
# chrome://inspect

# 4. 檢查未清理的事件監聽器
```

#### 解決方案

```typescript
// 移除事件監聽器
window.addEventListener('scroll', handleScroll);

// 要清理：
window.removeEventListener('scroll', handleScroll);

// 或使用 useEffect cleanup
useEffect(() => {
  const handler = () => { /* ... */ };
  window.addEventListener('scroll', handler);

  return () => {
    window.removeEventListener('scroll', handler);
  };
}, []);

// 清理 setInterval
const interval = setInterval(() => { /* ... */ }, 1000);
// 要清理：
clearInterval(interval);

// 檢查循環引用
// 避免在全局作用域儲存大型物件
```

---

### 故障 5：認證和授權失敗

#### 症狀
- 登入後仍被重導至登入頁面
- Token 驗證失敗

#### 排查步驟

```bash
# 1. 檢查 JWT_SECRET
echo $JWT_SECRET

# 2. 驗證 token 有效性
flyctl logs --follow | grep -i token

# 3. 檢查 Cookie 設定
# 在瀏覽器 DevTools 中查看
# Application > Cookies

# 4. 驗證 token 過期時間
# 用 https://jwt.io 解碼 token
```

#### 解決方案

```typescript
// 檢查 token 過期時間
const decoded = jwt.decode(token);
console.log('過期時間：', new Date(decoded.exp * 1000));

// 刷新 token
async function refreshToken(oldToken: string) {
  return jwt.sign(
    { userId: decoded.userId },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// 檢查 Cookie 設定
Cookies.set('jwtToken', token, {
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,  // 無法通過 JavaScript 訪問
  sameSite: 'Strict',
  expires: 7,
});
```

---

### 故障 6：支付失敗

#### 症狀
- 支付驗證失敗
- 事務中止

#### 排查步驟

```bash
# 1. 檢查支付網關連接
curl -I https://payment-gateway.example.com

# 2. 驗證 API 密鑰
echo $PAYMENT_API_KEY

# 3. 檢查事務日誌
flyctl logs --follow | grep -i payment

# 4. 驗證金額和幣種
# 確保使用正確的幣種（TWD）

# 5. 檢查支付網關狀態
# 訪問其狀態頁面
```

#### 解決方案

```typescript
// 實施支付重試邏輯
async function processPaymentWithRetry(
  amount: number,
  maxRetries: number = 3
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await paymentGateway.charge(amount);
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      // 指數退避
      const delay = Math.pow(2, i) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

// 記錄所有支付嘗試
auditLogger.log({
  action: 'payment_attempt',
  details: {
    amount,
    attempt: i,
    status: success ? 'success' : 'failed',
    error: error?.message,
  },
});
```

---

## 🔄 備份和恢復

### 資料庫備份

#### 自動備份設定

```bash
# 每天午夜執行備份
# 使用 cron 任務

# MongoDB
0 0 * * * mongodump --uri="$DATABASE_URL" --out=/backups/$(date +\%Y\%m\%d)

# PostgreSQL
0 0 * * * pg_dump $DATABASE_URL > /backups/db_$(date +\%Y\%m\%d).sql
```

#### 手動備份

```bash
# MongoDB
mongoexport --uri="$DATABASE_URL" --collection=users --out=users.json

# PostgreSQL
pg_dump $DATABASE_URL > backup.sql

# 上傳到雲存儲
aws s3 cp backup.sql s3://my-backups/$(date +%Y%m%d).sql
```

### 恢復流程

```bash
# 1. 停止應用程式
flyctl scale count=0

# 2. 恢復資料庫
# MongoDB
mongorestore --uri="$DATABASE_URL" /backups/

# PostgreSQL
psql $DATABASE_URL < backup.sql

# 3. 驗證資料
# 檢查記錄數量和完整性

# 4. 重啟應用程式
flyctl scale count=1

# 5. 進行健康檢查
curl https://myweb.fly.dev/health
```

---

## 📋 故障恢復檢查清單

### 應急回應流程

```markdown
## 立即行動（前 15 分鐘）

[ ] 確認故障存在和範圍
[ ] 通知團隊成員
[ ] 啟動事務管理流程
[ ] 開始記錄日誌和狀態

## 分析階段（15-45 分鐘）

[ ] 檢查監控和告警
[ ] 查看應用程式日誌
[ ] 檢查伺服器資源
[ ] 檢查依賴服務狀態
[ ] 確定根本原因

## 修復階段（45 分鐘 - 恢復時間）

[ ] 實施臨時解決方案（如果可用）
[ ] 執行硬重啟或重新部署
[ ] 验证修复效果
[ ] 監控相關指標

## 恢復後（恢復後 24 小時內）

[ ] 進行事後分析
[ ] 識別改進方案
[ ] 實施預防措施
[ ] 更新文檔
[ ] 團隊回顧會議
```

### 檢查清單範本

```markdown
## 構建階段

[ ] 未發現未捕獲的異常
[ ] 日誌記錄適當且正確
[ ] 超時和重試邏輯到位
[ ] 錯誤恢復路徑已測試

## 部署前

[ ] 備份策略已建立
[ ] 恢復流程已測試
[ ] 監控和告警已設定
[ ] 災難恢復計劃已文檔化
[ ] 團隊已培訓

## 定期檢查

[ ] 每月測試備份恢復
[ ] 每季度回顧災難恢復計劃
[ ] 每年進行完整的故障轉移測試
```

---

## 📞 應急聯絡方式

| 角色 | 名字 | 電話 | 郵件 |
|------|------|------|------|
| 技術主管 | 待填 | 待填 | 待填 |
| 開發主管 | 待填 | 待填 | 待填 |
| 運維主管 | 待填 | 待填 | 待填 |
| CEO | 待填 | 待填 | 待填 |

**更新日期**：每季度更新聯絡方式

---

## 📊 事故日誌範本

發生任何嚴重故障時，應記錄以下信息：

```
事故 ID：[自動生成]
發現時間：[UTC]
解決時間：[UTC]
服務受影響：[ServiceName]
影響用戶數：[Number]
優先級：[P1/P2/P3/P4]

## 症狀
[詳細描述]

## 根本原因
[故障原因分析]

## 解決方案
[應用的解決方案]

## 預防措施
[未來如何防止]

## 事後分析
[從事故中學到的]

負責人：[Name]
審批：[Manager]
```

---

## 🧪 災難恢復演習

### 季度性演習計劃

```markdown
## Q1：資料庫故障演習
- 團隊：後端 + DevOps
- 時間：2-4 小時
- 場景：主資料庫故障，需要從備份恢復
- 目標：驗證備份有效性和恢復流程

## Q2：網路分割演習
- 團隊：DevOps + 架構
- 時間：2-4 小時
- 場景：應用程式與資料庫之間的網路中斷
- 目標：測試重試邏輯和超時處理

## Q3：應用程式故障演習
- 團隊：全部工程師
- 時間：2-4 小時
- 場景：應用程式崩潰，需要重新部署
- 目標：驗證部署流程和回滾機制

## Q4：完整故障轉移演習
- 團隊：所有成員
- 時間：4-6 小時
- 場景：完整的區域故障，需要故障轉移到備用區域
- 目標：驗證完整的災難恢復計劃
```

---

## 📈 恢復時間目標 (RTO) 和恢復點目標 (RPO)

| 系統組件 | RTO | RPO | 說明 |
|----------|-----|-----|------|
| **Web 應用程式** | 15 分 | 5 分 | 重新部署舊版本 |
| **API 伺服器** | 15 分 | 5 分 | 重新啟動或重新部署 |
| **資料庫** | 30 分 | 1 小時 | 從備份恢復 |
| **文件儲存** | 1 小時 | 24 小時 | 從雲存儲恢復 |
| **完整應用** | 1 小時 | 1 小時 | 完整的故障轉移 |

---

## 📚 相關資源

- [Fly.io 故障排除](https://fly.io/docs/getting-started/)
- [Next.js 故障排除](https://nextjs.org/docs/troubleshooting)
- [Node.js 最佳實踐](https://nodejs.org/en/docs/)
- [AWS 災難恢復指南](https://aws.amazon.com/disaster-recovery/)

---

## 🎯 改進和更新

此文檔應在以下情況下更新：

- [ ] 發生任何重大事故後
- [ ] 每季度進行一次回顧
- [ ] 技術棧有重大變更時
- [ ] 新增或移除關鍵依賴時
- [ ] 發現新的故障模式時

**最後更新**：[日期]
**下次審查**：[日期]
**負責人**：[Name]
