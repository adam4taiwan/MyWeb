# SendGrid 邮件服务配置指南

## 📋 概述

本项目使用 **SendGrid** 作为邮件发送服务，实现咨询表单的自动邮件通知功能。

### 成本说明
✅ **完全免费** - 免费账户每天可发送 100 封邮件（足以满足初期需求）

---

## 🚀 快速开始

### 1️⃣ 注册 SendGrid 账户

访问: https://sendgrid.com/free

**注册步骤：**
1. 点击 "Start for Free" 按钮
2. 填写邮箱、密码和基本信息
3. 完成邮箱验证
4. 初次登录会提示做一些基础设置（可跳过）

✅ **无需信用卡即可使用免费额度**

---

### 2️⃣ 获取 API Key

**步骤：**

1. 登录 SendGrid 控制面板
2. 点击左侧菜单 **Settings** → **API Keys**
3. 点击 **Create API Key** 按钮
4. 填写信息：
   - **API Key Name**: `MyWeb Consultation` (中文可)
   - **API Key Permissions**: 选择 **Full Access**（简单方案）或 **Restricted Access** → 仅勾选 `Mail Send`（安全方案）
5. 点击 **Create & Copy**
6. 复制显示的 API Key（格式: `SG.xxxxxxxxxxxx...`）

⚠️ **重要：** API Key 只会显示一次，务必妥善保存！

---

## 🔧 本地开发配置

### 方式 A: 使用真实 SendGrid（推荐快速测试）

1. **修改 `.env.local` 文件：**

```bash
SENDGRID_API_KEY=SG.your_actual_api_key_here
```

2. **替换为您的 API Key**

   - 打开 `.env.local` 文件
   - 找到 `SENDGRID_API_KEY=` 这一行
   - 将 `your-sendgrid-api-key-here` 替换为上面复制的 API Key

3. **保存文件并重启开发服务器**

```bash
npm run dev
```

4. **测试邮件发送**

   - 打开 http://localhost:3000
   - 导航到咨询页面
   - 点击"电子邮件咨询"
   - 填写表单并提交
   - 检查您的邮箱（admin@example.com 和表单中的邮箱）

### 方式 B: 使用 MailHog 本地邮件测试（不调用SendGrid）

如果想在开发中完全不接触 SendGrid，可以使用本地邮件服务 MailHog。

```bash
# 安装 Docker（如果还未安装）
# macOS: brew install docker 或下载 Docker Desktop
# Linux: sudo apt install docker.io

# 启动 MailHog
docker run -d \
  -p 1025:1025 \
  -p 8025:8025 \
  --name mailhog \
  mailhog/mailhog

# 打开 MailHog UI
# http://localhost:8025
```

然后修改 `app/api/consultation/send-email/route.ts` 中的 SMTP 配置使用本地 MailHog，但这需要改用 `nodemailer` 库。

---

## 📤 生产环境部署（Fly.io）

### 步骤：

1. **生成新的 API Key**（建议生产用独立 Key）

   - 在 SendGrid 控制面板重复步骤 2️⃣ 的过程
   - 取个清楚的名字如 `MyWeb Fly.io Production`

2. **添加至 Fly.io Secrets**

```bash
# 登录 Fly.io CLI
fly auth login

# 添加 SendGrid API Key 到 secrets
fly secrets set SENDGRID_API_KEY=SG.your_production_key_here

# 验证已添加
fly secrets list
```

3. **部署应用**

```bash
fly deploy
```

---

## ✅ 检查清单

### 本地开发
- [ ] 注册了 SendGrid 免费账户
- [ ] 获取了 API Key（SG.xxx 格式）
- [ ] 添加到 `.env.local` 文件
- [ ] 重启了 `npm run dev`
- [ ] 测试了邮件发送（查看邮箱）

### 生产部署
- [ ] 生成了专用的生产 API Key
- [ ] 使用 `fly secrets set` 添加到 Fly.io
- [ ] 已确认 Fly.io Secrets 中有 `SENDGRID_API_KEY`
- [ ] 使用 `fly deploy` 部署

---

## 🐛 常见问题排查

### 问题 1: 邮件发送失败 - "Invalid from email address"

**原因：** SendGrid 默认发件人地址无效

**解决：**
1. 在 SendGrid 控制面板，点击 **Settings** → **Sender Authentication**
2. 点击 **Verify a Single Sender**
3. 输入您的邮箱地址（建议用 adam4taiwan@gmail.com）
4. 完成邮箱验证

然后将 API 代码中的 `from` 改为验证过的地址：
```typescript
from: 'verified-email@gmail.com'
```

### 问题 2: 收不到邮件

**检查顺序：**
1. 查看浏览器控制台（F12）是否有 JavaScript 错误
2. 查看 `npm run dev` 的终端输出，看 API 是否返回了错误
3. 检查垃圾邮件文件夹
4. 确认 `.env.local` 中的 API Key 没有多余空格或换行

### 问题 3: 免费额度用完了（发送 100+ 邮件）

**升级方案：**
1. 在 SendGrid 控制面板，点击 **Billing**
2. 选择 **Pay As You Go** 计划（大约 $0.0001 per email）
3. 添加信用卡信息

**估算成本：**
- 1,000 封/月 ≈ ¥0.6
- 10,000 封/月 ≈ ¥6
- 100,000 封/月 ≈ ¥60

---

## 📊 监控邮件发送

### SendGrid 控制面板

1. 登录 https://app.sendgrid.com
2. 点击 **Mail** → **Sends**
3. 查看所有发送的邮件统计、打开率、点击率等

### 代码中的日志

检查 `npm run dev` 终端输出，会看到：
```
✅ 邮件发送成功 - 管理员和客户邮件已发送
❌ 邮件发送失败: [错误信息]
```

---

## 🔐 安全最佳实践

### ✅ 已实施

- 使用环境变量存储 API Key（不在代码中硬编码）
- 表单验证（验证邮箱格式、必填字段）
- 错误处理（不向用户显示敏感错误细节）

### 建议进一步改进

1. **Rate Limiting**（防止滥用）
   ```typescript
   // 限制每个 IP 每分钟最多 5 个请求
   ```

2. **请求签名验证**（防止恶意请求）

3. **发件人域名认证**（增加投递率）
   - 在 SendGrid 中验证您的域名

4. **邮件模板**（使用 SendGrid 动态模板，而不是硬编码 HTML）

---

## 📚 相关资源

- SendGrid 官方文档: https://docs.sendgrid.com/
- SendGrid Node.js 库: https://github.com/sendgrid/sendgrid-nodejs
- Fly.io 环境变量: https://fly.io/docs/reference/secrets/

---

## 后续优化方向

### Phase 2: 高级功能
- [ ] 邮件模板系统（使用 SendGrid 动态模板）
- [ ] 异步邮件队列（减少请求响应时间）
- [ ] 邮件发送重试机制
- [ ] 邮件送达回执追踪

### Phase 3: 集成其他通知
- [ ] LINE / WeChat 通知
- [ ] SMS 短信通知
- [ ] 数据库记录所有咨询

---

## 支持

如有问题，请检查：
1. SendGrid 官方文档
2. 代码中的错误消息
3. 邮件垃圾文件夹

祝顺利！🎉
