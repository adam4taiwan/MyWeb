# api-documentation-template.md

此檔案提供 MyWeb 後端 API 文檔的標準模板和指南。

---

## 🌐 API 基本信息

**基礎 URL**：`https://ecanapi.fly.dev/api`

**認證方式**：JWT Bearer Token

**內容類型**：`application/json`

**API 版本**：v1

---

## 🔐 認證

### JWT Token 獲取

所有受保護的端點都需要在 Authorization 頭中提供有效的 JWT token。

```bash
Authorization: Bearer <your-jwt-token>
```

**Token 來源**：通過 `/api/auth/login` 端點獲取

**Token 有效期**：7 天

**Token 刷新**：登入時自動發放新 token（可選）

---

## 📋 API 端點文檔模板

每個 API 端點的文檔應遵循以下格式：

### 端點名稱

```
[HTTP METHOD] /api/路徑
```

**描述**：簡短描述此端點的功能

**認證**：是否需要認證（✅ 需要 / ❌ 不需要）

**權限**：所需的用戶角色（可選）

#### 請求

**URL 參數**：

| 參數名 | 類型 | 必需 | 說明 |
|--------|------|------|------|
| `userId` | string | ✅ | 用戶唯一識別碼 |

**查詢參數**：

| 參數名 | 類型 | 必需 | 說明 |
|--------|------|------|------|
| `page` | number | ❌ | 分頁號碼（默認 1） |
| `limit` | number | ❌ | 每頁數量（默認 20） |

**請求頭**：

```
Authorization: Bearer <token>
Content-Type: application/json
```

**請求體**（JSON）：

```json
{
  "name": "string",
  "email": "string",
  "phone": "string"
}
```

#### 響應

**成功響應** (200 OK)：

```json
{
  "success": true,
  "data": {
    "id": "user123",
    "name": "張三",
    "email": "user@example.com",
    "phone": "0912345678",
    "createdAt": "2024-03-04T10:30:00Z"
  }
}
```

**錯誤響應** (400 Bad Request)：

```json
{
  "success": false,
  "error": "無效的電郵地址"
}
```

**認證失敗** (401 Unauthorized)：

```json
{
  "success": false,
  "error": "Token 無效或已過期"
}
```

**權限不足** (403 Forbidden)：

```json
{
  "success": false,
  "error": "您沒有權限訪問此資源"
}
```

**伺服器錯誤** (500 Internal Server Error)：

```json
{
  "success": false,
  "error": "服務器內部錯誤"
}
```

#### 範例

**cURL**：

```bash
curl -X GET https://ecanapi.fly.dev/api/users/user123 \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json"
```

**JavaScript/Fetch**：

```javascript
const response = await fetch('https://ecanapi.fly.dev/api/users/user123', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer your_jwt_token',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);
```

**Python/Requests**：

```python
import requests

headers = {
    'Authorization': 'Bearer your_jwt_token',
    'Content-Type': 'application/json'
}

response = requests.get('https://ecanapi.fly.dev/api/users/user123', headers=headers)
print(response.json())
```

---

## 🔑 認證 API

### 用戶註冊

```
POST /api/auth/register
```

**描述**：創建新用戶帳戶

**認證**：❌ 不需要

#### 請求

**請求體**：

```json
{
  "name": "string (必需, 2-50 字符)",
  "email": "string (必需, 有效的電郵格式)",
  "password": "string (必需, 至少 8 字符, 包含大寫和數字)"
}
```

#### 響應

**成功** (201 Created)：

```json
{
  "success": true,
  "message": "註冊成功",
  "data": {
    "id": "user123",
    "name": "張三",
    "email": "user@example.com",
    "createdAt": "2024-03-04T10:30:00Z"
  }
}
```

---

### 用戶登入

```
POST /api/auth/login
```

**描述**：用戶登入並獲取 JWT token

**認證**：❌ 不需要

#### 請求

**請求體**：

```json
{
  "email": "string (必需)",
  "password": "string (必需)"
}
```

#### 響應

**成功** (200 OK)：

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user123",
      "name": "張三",
      "email": "user@example.com",
      "role": "member"
    }
  }
}
```

---

### 用戶登出

```
POST /api/auth/logout
```

**描述**：用戶登出並清除 token

**認證**：✅ 需要

#### 請求

**請求頭**：

```
Authorization: Bearer <token>
```

#### 響應

**成功** (200 OK)：

```json
{
  "success": true,
  "message": "登出成功"
}
```

---

## 👤 用戶 API

### 獲取用戶個人資料

```
GET /api/users/:userId
```

**描述**：獲取指定用戶的詳細信息

**認證**：✅ 需要

#### 請求

**URL 參數**：

| 參數名 | 說明 |
|--------|------|
| `userId` | 用戶唯一識別碼 |

#### 響應

```json
{
  "success": true,
  "data": {
    "id": "user123",
    "name": "張三",
    "email": "user@example.com",
    "phone": "0912345678",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "個人簡介...",
    "role": "member",
    "createdAt": "2024-03-04T10:30:00Z",
    "updatedAt": "2024-03-04T15:45:00Z"
  }
}
```

---

### 更新用戶個人資料

```
PUT /api/users/:userId/profile
```

**描述**：更新用戶個人資料

**認證**：✅ 需要

**權限**：只有用戶本人或管理員可以更新

#### 請求

**URL 參數**：

| 參數名 | 說明 |
|--------|------|
| `userId` | 用戶唯一識別碼 |

**請求體**：

```json
{
  "name": "string (可選)",
  "phone": "string (可選)",
  "bio": "string (可選)",
  "avatar": "string (可選, Base64 編碼的圖片)"
}
```

#### 響應

**成功** (200 OK)：

```json
{
  "success": true,
  "message": "個人資料已更新",
  "data": {
    "id": "user123",
    "name": "李四",
    "phone": "0912345678",
    "bio": "更新了個人簡介",
    "updatedAt": "2024-03-04T16:00:00Z"
  }
}
```

---

## 📚 講座 API

### 獲取講座列表

```
GET /api/lectures
```

**描述**：獲取所有講座

**認證**：❌ 不需要

#### 請求

**查詢參數**：

| 參數名 | 類型 | 說明 |
|--------|------|------|
| `page` | number | 頁碼（默認 1） |
| `limit` | number | 每頁數量（默認 20） |
| `category` | string | 分類篩選 |
| `instructor` | string | 講師篩選 |
| `sortBy` | string | 排序方式：date, popularity, rating |

#### 響應

```json
{
  "success": true,
  "data": {
    "lectures": [
      {
        "id": "lecture123",
        "title": "八字基礎課程",
        "description": "學習八字命理基礎知識...",
        "instructor": "王老師",
        "date": "2024-03-15T14:00:00Z",
        "duration": 120,
        "capacity": 50,
        "enrolled": 35,
        "price": 500,
        "category": "八字"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

---

### 獲取講座詳情

```
GET /api/lectures/:lectureId
```

**描述**：獲取特定講座的詳細信息

**認證**：❌ 不需要

#### 請求

**URL 參數**：

| 參數名 | 說明 |
|--------|------|
| `lectureId` | 講座唯一識別碼 |

#### 響應

```json
{
  "success": true,
  "data": {
    "id": "lecture123",
    "title": "八字基礎課程",
    "description": "詳細課程描述...",
    "instructor": {
      "id": "user456",
      "name": "王老師",
      "avatar": "..."
    },
    "date": "2024-03-15T14:00:00Z",
    "duration": 120,
    "capacity": 50,
    "enrolled": 35,
    "price": 500,
    "category": "八字",
    "syllabus": "課程大綱...",
    "reviews": {
      "average": 4.8,
      "count": 25,
      "items": [...]
    }
  }
}
```

---

### 報名講座

```
POST /api/lectures/:lectureId/enroll
```

**描述**：用戶報名參加講座

**認證**：✅ 需要

#### 請求

**URL 參數**：

| 參數名 | 說明 |
|--------|------|
| `lectureId` | 講座唯一識別碼 |

#### 響應

**成功** (201 Created)：

```json
{
  "success": true,
  "message": "報名成功",
  "data": {
    "enrollmentId": "enrollment789",
    "userId": "user123",
    "lectureId": "lecture123",
    "enrolledAt": "2024-03-04T16:30:00Z"
  }
}
```

**錯誤** (400 Bad Request)：

```json
{
  "success": false,
  "error": "講座已滿員"
}
```

---

## 💰 支付 API

### 建立訂單

```
POST /api/payments/orders
```

**描述**：建立新的支付訂單

**認證**：✅ 需要

#### 請求

**請求體**：

```json
{
  "lectureId": "lecture123",
  "amount": 500,
  "paymentMethod": "credit_card | paypal"
}
```

#### 響應

```json
{
  "success": true,
  "data": {
    "orderId": "order123",
    "amount": 500,
    "currency": "TWD",
    "status": "pending",
    "paymentUrl": "https://payment.example.com/pay?order=order123",
    "expiresAt": "2024-03-04T17:30:00Z"
  }
}
```

---

### 確認支付

```
POST /api/payments/confirm
```

**描述**：確認支付結果

**認證**：✅ 需要

#### 請求

```json
{
  "orderId": "order123",
  "transactionId": "trans_xxx"
}
```

#### 響應

```json
{
  "success": true,
  "message": "支付成功",
  "data": {
    "orderId": "order123",
    "status": "completed",
    "transactionId": "trans_xxx",
    "completedAt": "2024-03-04T16:45:00Z"
  }
}
```

---

## ✉️ 諮詢 API

### 發送諮詢請求

```
POST /api/consultations
```

**描述**：用戶提交諮詢請求

**認證**：✅ 需要

#### 請求

```json
{
  "consultationType": "message | email | video_call",
  "serviceType": "八字 | 紫微斗數 | 風水",
  "description": "諮詢內容描述...",
  "preferredTime": "2024-03-10T14:00:00Z"
}
```

#### 響應

```json
{
  "success": true,
  "message": "諮詢請求已提交",
  "data": {
    "consultationId": "consult123",
    "status": "pending",
    "createdAt": "2024-03-04T16:50:00Z",
    "assignedConsultant": null
  }
}
```

---

## 🔄 通用響應格式

所有 API 響應都遵循以下格式：

### 成功響應

```json
{
  "success": true,
  "data": {
    // 實際數據
  },
  "message": "可選的成功提示信息"
}
```

### 錯誤響應

```json
{
  "success": false,
  "error": "詳細的錯誤信息",
  "code": "ERROR_CODE",
  "details": {
    // 可選的詳細信息
  }
}
```

---

## 📊 HTTP 狀態碼

| 代碼 | 說明 | 場景 |
|------|------|------|
| **200** | OK | 請求成功 |
| **201** | Created | 資源已創建 |
| **204** | No Content | 請求成功但無響應體 |
| **400** | Bad Request | 請求參數無效 |
| **401** | Unauthorized | 缺少或無效的認證 |
| **403** | Forbidden | 權限不足 |
| **404** | Not Found | 資源不存在 |
| **409** | Conflict | 衝突（如重複的電郵） |
| **429** | Too Many Requests | 請求過於頻繁 |
| **500** | Internal Server Error | 伺服器錯誤 |
| **503** | Service Unavailable | 服務不可用 |

---

## 🔍 錯誤代碼

| 代碼 | HTTP 狀態 | 說明 |
|------|----------|------|
| `INVALID_INPUT` | 400 | 輸入驗證失敗 |
| `UNAUTHORIZED` | 401 | 缺少認證 |
| `INVALID_TOKEN` | 401 | Token 無效或過期 |
| `FORBIDDEN` | 403 | 權限不足 |
| `NOT_FOUND` | 404 | 資源不存在 |
| `DUPLICATE_EMAIL` | 409 | 電郵已存在 |
| `RATE_LIMIT_EXCEEDED` | 429 | 請求過於頻繁 |
| `INTERNAL_ERROR` | 500 | 伺服器內部錯誤 |

---

## 🔄 分頁

返回列表的端點支持分頁：

**查詢參數**：

```
?page=1&limit=20
```

**響應格式**：

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## ⏱️ 速率限制

API 實施了速率限制以防止濫用：

| 端點類型 | 限制 |
|----------|------|
| 公開端點 | 100 請求/小時 |
| 認證端點 | 1000 請求/小時 |
| 登入端點 | 5 次/15 分鐘 |

當超過限制時，API 返回 `429 Too Many Requests`。

---

## 🧪 測試工具

### Postman 集合

建議使用 Postman 進行 API 測試。

1. 導入集合：`postman-collection.json`
2. 設定環境變數：
   - `baseUrl`: `https://ecanapi.fly.dev/api`
   - `token`: 您的 JWT token
3. 執行請求和測試

### cURL 示例

```bash
# 設定環境變數
export BASE_URL="https://ecanapi.fly.dev/api"
export TOKEN="your_jwt_token"

# 登入
curl -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# 獲取用戶信息
curl -X GET $BASE_URL/users/user123 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📞 支持和反饋

如有任何問題或建議，請聯繫技術支持：

- 郵件：support@myweb.fly.dev
- 文檔反饋：docs-feedback@myweb.fly.dev

---

## 📝 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| v1.0 | 2024-03-04 | 初始版本 |

