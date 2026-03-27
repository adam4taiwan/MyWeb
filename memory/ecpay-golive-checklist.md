---
name: ECPay 上線待辦清單
description: 綠界科技正式帳號審核通過後，開通訂閱與點數付款的完整步驟
type: project
---

# ECPay 上線待辦清單

## 訂閱付款流程說明（審核通過後自動完成）

1. 使用者點「訂閱 XXX 會員」
2. 前端呼叫 `POST /api/Payment/create-subscription-checkout?planCode=GOLD`
3. 後端產生 ECPay 表單參數（含 `CustomField3=SUB_GOLD`）
4. 前端自動 POST 至 ECPay 付款頁
5. 使用者刷卡完成
6. ECPay Server-to-Server 呼叫 `POST /api/Payment/ecpay-return` Webhook
7. 後端驗簽（CheckMacValue）通過 → 建立 `UserSubscriptions` 記錄，Status=active
8. ECPay 跳轉到 `ecpay-result` → 自動 redirect 至 `/member?payment=success`
9. 使用者看到成功頁面，訂閱等級立即生效

**結論：全自動，無需人工操作。**

---

## 開通步驟（審核通過後執行）

### Step 1 - 取得正式商家資料
從綠界科技後台取得：
- MerchantID（正式特店編號）
- HashKey
- HashIV

### Step 2 - 設定 Fly.io Secrets
```bash
fly secrets set \
  ECPAY_MERCHANT_ID="正式MerchantID" \
  ECPAY_HASH_KEY="正式HashKey" \
  ECPAY_HASH_IV="正式HashIV" \
  --app ecanapi
```

### Step 3 - 修改 appsettings.json（PaymentUrl 改正式環境）
```json
"ECPay": {
  "Enabled": true,
  "MerchantId": "...",
  "HashKey": "...",
  "HashIV": "...",
  "PaymentUrl": "https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5",
  "ReturnUrl": "https://ecanapi.fly.dev/api/Payment/ecpay-return"
}
```
> 測試環境用 `https://stage.ecpay.com.tw/...`，正式環境改為 `https://payment.ecpay.com.tw/...`

### Step 4 - 重新部署 Ecanapi
```bash
cd /home/adamtsai/projects/Ecanapi
fly deploy
```

### Step 5 - 功能驗收測試
- [ ] 訂閱銅/銀/金會員：付款後跳回 /member，訂閱等級正確顯示
- [ ] 排盤工具 /disk：命書選單顯示折扣後點數
- [ ] 點數購買：付款後點數正確入帳
- [ ] Webhook 收到通知後 `UserSubscriptions` 有新記錄（查 DB 確認）

---

## 待改善項目（非緊急）

- [ ] 訂閱成功後 redirect 到 `/member?payment=success` 目前顯示「儲值成功！點數已入帳」
  - 應改為「訂閱成功！歡迎加入 XXX 會員」，並自動跳至「訂閱方案」Tab
  - 修改位置：`PaymentController.cs` 的 `orderResultUrl` 改為 `?subscription=success`
  - 前端 `app/member/page.tsx` 新增 `subscription=success` 的判斷

- [ ] 訂閱續訂優惠：目前無 early-renew 折扣機制

- [ ] 訂閱到期前 30/7 天 Email 提醒（需串接 SendGrid）
