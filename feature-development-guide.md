# feature-development-guide.md

此檔案提供在 MyWeb 專案中開發新功能的完整指南和最佳實踐。

---

## 🚀 新增功能的完整工作流程

### 第一階段：規劃和設計

#### 1. 明確需求

```markdown
## 功能說明書模板

### 功能名稱
使用者個人資料編輯

### 受眾
已登入的會員

### 需求描述
使用者可以編輯個人資料，包括名稱、頭像、電話號碼。

### 成功標準
- [ ] 使用者可以修改名稱
- [ ] 使用者可以上傳頭像
- [ ] 使用者可以修改電話號碼
- [ ] 編輯成功後顯示確認提示
- [ ] 驗證所有必填欄位

### 相關 API 端點
- `PUT /api/users/:id` - 更新使用者資料

### 安全考慮
- 只有該使用者可以編輯自己的資料
- 驗證檔案大小和類型（圖片）
```

#### 2. UI/UX 設計規劃

```markdown
### 頁面結構
```
/profile/edit
├── Header
├── Main Content
│   ├── 個人資料表單
│   │   ├── 名稱輸入欄
│   │   ├── 頭像上傳
│   │   ├── 電話號碼輸入欄
│   │   ├── 保存按鈕
│   │   └── 取消按鈕
│   └── 成功/錯誤提示
└── Footer
```

### 色彩和樣式
- 使用琥珀色主題（amber-600）
- 按鈕必須可點擊和禁用狀態
- 表單驗證錯誤訊息為紅色
```

### 第二階段：代碼實作

#### 1. 創建型別定義檔案

```typescript
// types/profile.ts
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  updatedAt: Date;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  bio?: string;
  avatar?: string; // Base64 編碼的圖片
}

export interface ProfileApiResponse {
  success: boolean;
  message: string;
  data?: UserProfile;
}
```

#### 2. 創建 API 服務

```typescript
// lib/api/profileApi.ts
import { apiClient } from '@/lib/api';
import type { UserProfile, UpdateProfileRequest } from '@/types/profile';

export class ProfileApi {
  /**
   * 獲取使用者的個人資料
   * @param userId - 使用者 ID
   * @returns 使用者資料或錯誤
   */
  static async getProfile(userId: string) {
    return apiClient.get<UserProfile>(`/users/${userId}/profile`);
  }

  /**
   * 更新使用者的個人資料
   * @param userId - 使用者 ID
   * @param data - 要更新的資料
   * @param token - JWT Token
   * @returns 更新後的使用者資料或錯誤
   */
  static async updateProfile(
    userId: string,
    data: UpdateProfileRequest,
    token: string
  ) {
    return apiClient.put<UserProfile>(
      `/users/${userId}/profile`,
      data,
      { Authorization: `Bearer ${token}` }
    );
  }

  /**
   * 上傳使用者頭像
   * @param userId - 使用者 ID
   * @param file - 圖片檔案
   * @param token - JWT Token
   * @returns 上傳結果
   */
  static async uploadAvatar(
    userId: string,
    file: File,
    token: string
  ): Promise<{ success: boolean; message: string; url?: string }> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/avatar`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || '上傳失敗',
        };
      }

      return {
        success: true,
        message: '上傳成功',
        url: data.url,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '上傳進行中發生錯誤',
      };
    }
  }
}
```

#### 3. 創建頁面元件

```typescript
// app/profile/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProfileEditForm from './ProfileEditForm';
import type { UserProfile } from '@/types/profile';

export default function ProfileEditPage() {
  const { isAuthenticated, token, user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 檢查認證
  if (!isAuthenticated) {
    return null; // AuthContext 會自動重導向
  }

  // 獲取使用者資料
  useEffect(() => {
    const fetchProfile = async () => {
      // 從上下文或 localStorage 獲取使用者 ID
      setLoading(false);
      // 實際上從 API 獲取資料
    };

    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <h1 className="text-4xl font-bold mb-8">編輯個人資料</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">載入中...</div>
          ) : (
            <ProfileEditForm
              profileData={profile}
              onSuccess={() => setError(null)}
              onError={(msg) => setError(msg)}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
```

#### 4. 創建表單元件

```typescript
// app/profile/edit/ProfileEditForm.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { ProfileApi } from '@/lib/api/profileApi';
import Button from '@/components/Button';
import type { UserProfile, UpdateProfileRequest } from '@/types/profile';

interface ProfileEditFormProps {
  profileData: UserProfile | null;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export default function ProfileEditForm({
  profileData,
  onSuccess,
  onError,
}: ProfileEditFormProps) {
  const { token, user } = useAuth();
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    name: profileData?.name || '',
    phone: profileData?.phone || '',
    bio: profileData?.bio || '',
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(
    profileData?.avatar || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<UpdateProfileRequest>>({});

  // 驗證表單
  const validateForm = (): boolean => {
    const newErrors: Partial<UpdateProfileRequest> = {};

    if (!formData.name?.trim()) {
      newErrors.name = '名稱不能為空';
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = '請輸入有效的電話號碼';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 處理文件選擇
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];

    if (!file) return;

    // 驗證檔案類型和大小
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      onError('只支援 JPG、PNG 和 WebP 格式的圖片');
      return;
    }

    if (file.size > maxSize) {
      onError('檔案大小不能超過 5MB');
      return;
    }

    setAvatarFile(file);

    // 顯示預覽
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 處理表單輸入
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.currentTarget;
    setFormData({ ...formData, [name]: value });

    // 清除該欄位的錯誤
    if (errors[name as keyof UpdateProfileRequest]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

  // 提交表單
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!token || !user?.id) {
      onError('認證信息遺失');
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      // 先上傳頭像（如有新的）
      let avatarUrl = profileData?.avatar;

      if (avatarFile) {
        const uploadResult = await ProfileApi.uploadAvatar(
          user.id,
          avatarFile,
          token
        );

        if (!uploadResult.success) {
          onError(uploadResult.message);
          setIsSubmitting(false);
          return;
        }

        avatarUrl = uploadResult.url;
      }

      // 更新個人資料
      const updateData: UpdateProfileRequest = {
        ...formData,
        avatar: avatarUrl,
      };

      const response = await ProfileApi.updateProfile(
        user.id,
        updateData,
        token
      );

      if (response.success) {
        setSuccessMessage('個人資料更新成功！');
        onSuccess();
      } else {
        onError(response.message);
      }
    } catch (error) {
      onError(
        error instanceof Error ? error.message : '更新過程中發生錯誤'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow">
      {/* 成功訊息 */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      {/* 頭像上傳 */}
      <div>
        <label className="block text-lg font-semibold mb-4">頭像</label>

        {avatarPreview && (
          <div className="mb-4">
            <img
              src={avatarPreview}
              alt="頭像預覽"
              className="w-32 h-32 rounded-full object-cover border-4 border-amber-300"
            />
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          disabled={isSubmitting}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0 file:text-sm file:font-semibold
            file:bg-amber-50 file:text-amber-600 hover:file:bg-amber-100"
        />
        <p className="text-sm text-gray-500 mt-2">支援 JPG、PNG 和 WebP 格式，最大 5MB</p>
      </div>

      {/* 名稱 */}
      <div>
        <label htmlFor="name" className="block text-lg font-semibold mb-2">
          名稱 <span className="text-red-600">*</span>
        </label>
        <input
          id="name"
          type="text"
          name="name"
          value={formData.name || ''}
          onChange={handleInputChange}
          disabled={isSubmitting}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
          placeholder="輸入您的名稱"
        />
        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
      </div>

      {/* 電話號碼 */}
      <div>
        <label htmlFor="phone" className="block text-lg font-semibold mb-2">
          電話號碼
        </label>
        <input
          id="phone"
          type="tel"
          name="phone"
          value={formData.phone || ''}
          onChange={handleInputChange}
          disabled={isSubmitting}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
          placeholder="輸入您的電話號碼"
        />
        {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
      </div>

      {/* 個人簡介 */}
      <div>
        <label htmlFor="bio" className="block text-lg font-semibold mb-2">
          個人簡介
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio || ''}
          onChange={handleInputChange}
          disabled={isSubmitting}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 resize-none"
          placeholder="介紹一下您自己"
          rows={4}
        />
      </div>

      {/* 按鈕組 */}
      <div className="flex gap-4 pt-4">
        <Button
          variant="primary"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? '保存中...' : '保存變更'}
        </Button>
        <Button
          variant="secondary"
          type="button"
          disabled={isSubmitting}
          onClick={() => window.history.back()}
        >
          返回
        </Button>
      </div>
    </form>
  );
}
```

---

## 🔍 功能開發檢查清單

### 開發前準備

```markdown
[ ] 功能需求已確認
[ ] API 端點已設計或已存在
[ ] UI/UX 設計已完成
[ ] 型別定義已規劃
[ ] 認證需求已明確
```

### 代碼實作

```markdown
[ ] 型別定義檔案已創建 (types/)
[ ] API 服務方法已實作 (lib/api/)
[ ] 元件已創建
[ ] 表單驗證邏輯已實作
[ ] 錯誤處理已實作
[ ] 成功提示已實作
[ ] 認證檢查已實作
```

### 測試

```markdown
[ ] 頁面正常載入
[ ] 表單可以正常輸入
[ ] 驗證規則正常工作
[ ] API 呼叫正常執行
[ ] 錯誤提示正常顯示
[ ] 成功提示正常顯示
[ ] 行動版本響應正確
[ ] 平板版本響應正確
[ ] 桌面版本響應正確
```

### 代碼質量

```markdown
[ ] ESLint 檢查通過：npm run lint
[ ] TypeScript 編譯無誤
[ ] 沒有使用 any 類型
[ ] 沒有未使用的變數
[ ] 沒有未使用的導入
[ ] 代碼命名符合規範
[ ] 註解清晰有用
```

### 安全性

```markdown
[ ] 認證檢查已實作
[ ] 輸入驗證已實作
[ ] 檔案上傳有大小限制
[ ] 檔案類型已驗證
[ ] API 請求使用 HTTPS
[ ] 敏感信息不在代碼中
```

### 部署準備

```markdown
[ ] 環境變數已配置正確
[ ] API 端點指向正確的服務器
[ ] Cookie 安全設定正確
[ ] 所有依賴已安裝
[ ] 構建無誤：npm run build
[ ] 本地測試無誤
```

---

## 📋 常見功能實作模式

### 模式 1：簡單的資料展示

```typescript
// 優點：快速實作，最少的 API 呼叫
// 適用於：靜態內容、列表展示

const [data, setData] = useState<T | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchData();
}, []);
```

### 模式 2：複雜的表單提交

```typescript
// 優點：完整的驗證和錯誤處理
// 適用於：使用者輸入、設定修改

const [formData, setFormData] = useState<FormData>({...});
const [errors, setErrors] = useState<Partial<FormData>>({});
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (e) => {
  if (!validateForm()) return;
  // 提交
};
```

### 模式 3：分頁列表

```typescript
// 優點：效率高、用戶體驗好
// 適用於：大量資料展示

const [page, setPage] = useState(1);
const [items, setItems] = useState<T[]>([]);
const [hasMore, setHasMore] = useState(true);

useEffect(() => {
  fetchPage(page);
}, [page]);
```

---

## 🐛 常見問題和解決方案

### 問題 1：表單提交後頁面不更新

**原因：** 通常是 API 響應處理不正確

```typescript
// ✅ 解決方案
const response = await api.updateData(data);

if (response.success) {
  setData(response.data); // 更新本地狀態
  setSuccessMessage('更新成功'); // 顯示反饋
}
```

### 問題 2：認證檢查無效

**原因：** Token 過期或未正確傳遞

```typescript
// ✅ 解決方案
const { token, isAuthenticated } = useAuth();

useEffect(() => {
  if (!isAuthenticated) {
    // 重導向或顯示提示
    return;
  }
  // 繼續執行
}, [isAuthenticated]);
```

### 問題 3：Tailwind 樣式未應用

**原因：** 檔案不在 content 配置中

```javascript
// tailwind.config.js
content: [
  './{app,components,lib,types}/**/*.{js,ts,jsx,tsx}',
];
```

---

## 📚 參考資源

- [Next.js 官方文檔](https://nextjs.org/docs)
- [React 官方文檔](https://react.dev)
- [TypeScript 官方文檔](https://www.typescriptlang.org/docs/)
- [Tailwind CSS 官方文檔](https://tailwindcss.com/docs)
