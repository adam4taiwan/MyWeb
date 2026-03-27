# monitoring-and-logging-guide.md

本檔案定義 MyWeb 應用程式的監控、日誌記錄和告警策略。

---

## 📊 監控架構概述

```
┌─────────────────────────────────────────┐
│         應用程式 (MyWeb)                 │
│  ├─ 性能指標                           │
│  ├─ 錯誤和異常                         │
│  └─ 用戶活動                           │
└────────────────┬────────────────────────┘
                 │
        ┌────────▼──────────┐
        │  日誌收集器        │
        │  (Logger)         │
        └────────┬──────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼──┐  ┌─────▼──┐  ┌─────▼──┐
│ 文件  │  │ 控制台  │  │ 遠端   │
│ 日誌  │  │ 輸出    │  │ 服務   │
└──────┘  └────────┘  └────────┘
             (本地)      (Sentry/
                         Datadog等)
```

---

## 🔍 日誌策略

### 日誌級別

| 級別 | 用途 | 範例 | 日常檢查 |
|------|------|------|--------|
| **ERROR** | 系統錯誤和異常 | 資料庫連接失敗、未捕獲的異常 | ✅ 必須監控 |
| **WARN** | 警告和潛在問題 | 已棄用方法、資源不足 | ✅ 定期檢查 |
| **INFO** | 一般信息 | 應用程式啟動、用戶登入 | 📌 關鍵操作 |
| **DEBUG** | 除錯信息 | 變數值、函式執行 | ❌ 生產環境禁用 |

### 自訂日誌系統

```typescript
// lib/logger.ts
type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLog(entry: LogEntry): string {
    return JSON.stringify({
      timestamp: entry.timestamp,
      level: entry.level.toUpperCase(),
      message: entry.message,
      ...entry.context,
      ...(entry.error && {
        error: {
          message: entry.error.message,
          stack: entry.error.stack,
        },
      }),
    });
  }

  private async sendToRemote(entry: LogEntry) {
    // 發送到遠端日誌服務（如 Sentry、Datadog）
    if (process.env.SENTRY_DSN) {
      try {
        await fetch('https://your-sentry.io/api/..', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        });
      } catch (error) {
        console.error('無法發送日誌到遠端:', error);
      }
    }
  }

  error(message: string, context?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      context,
      error,
    };

    console.error(this.formatLog(entry));

    // 生產環境發送到遠端
    if (!this.isDevelopment) {
      this.sendToRemote(entry);
    }
  }

  warn(message: string, context?: Record<string, any>) {
    const entry: LogEntry = { timestamp: new Date().toISOString(), level: 'warn', message, context };
    console.warn(this.formatLog(entry));
  }

  info(message: string, context?: Record<string, any>) {
    const entry: LogEntry = { timestamp: new Date().toISOString(), level: 'info', message, context };
    console.log(this.formatLog(entry));
  }

  debug(message: string, context?: Record<string, any>) {
    if (this.isDevelopment) {
      const entry: LogEntry = { timestamp: new Date().toISOString(), level: 'debug', message, context };
      console.log(this.formatLog(entry));
    }
  }
}

export const logger = new Logger();
```

### 在應用程式中使用日誌

```typescript
// API 路由示例
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    logger.info('用戶登入請求', { endpoint: '/api/auth/login' });

    const body = await request.json();
    const { email, password } = body;

    // 驗證輸入
    if (!email || !password) {
      logger.warn('登入請求缺少必要字段', { email: email ? '有' : '無', password: password ? '有' : '無' });
      return Response.json({ error: '缺少必要字段' }, { status: 400 });
    }

    // 進行認證
    const user = await authenticateUser(email, password);

    logger.info('用戶成功登入', {
      userId: user.id,
      email: user.email,
    });

    return Response.json({ token: generateToken(user) });
  } catch (error) {
    logger.error(
      '登入過程中發生錯誤',
      { endpoint: '/api/auth/login' },
      error as Error
    );

    return Response.json(
      { error: '登入失敗' },
      { status: 500 }
    );
  }
}
```

---

## 📈 性能監控

### 1. **應用程式性能監控 (APM)**

```typescript
// lib/monitoring/apm.ts
export class PerformanceMonitor {
  private marks = new Map<string, number>();

  /**
   * 開始測量
   */
  start(label: string) {
    this.marks.set(label, performance.now());
    console.debug(`[Performance] 開始測量：${label}`);
  }

  /**
   * 結束測量並返回耗時
   */
  end(label: string): number {
    const startTime = this.marks.get(label);

    if (!startTime) {
      console.warn(`[Performance] 未找到開始標記：${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(label);

    console.debug(`[Performance] ${label}：${duration.toFixed(2)}ms`);

    // 發送到監控服務（如果超過閾值）
    if (duration > 1000) {
      this.reportSlowOperation(label, duration);
    }

    return duration;
  }

  private reportSlowOperation(label: string, duration: number) {
    // 記錄或發送到監控服務
    if (process.env.NODE_ENV === 'production') {
      sendToMonitoringService({
        type: 'slow_operation',
        label,
        duration,
      });
    }
  }
}

export const apm = new PerformanceMonitor();
```

### 2. **API 響應時間監控**

```typescript
// middleware/performanceMonitoring.ts
import { NextRequest, NextResponse } from 'next/server';
import { apm } from '@/lib/monitoring/apm';

export async function middleware(request: NextRequest) {
  const label = `${request.method} ${request.nextUrl.pathname}`;
  apm.start(label);

  const response = NextResponse.next();

  apm.end(label);

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

### 3. **資源使用監控**

```typescript
// lib/monitoring/resources.ts
export class ResourceMonitor {
  /**
   * 監控內存使用
   */
  getMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      return {
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + ' MB',
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + ' MB',
        external: Math.round(usage.external / 1024 / 1024) + ' MB',
      };
    }
    return null;
  }

  /**
   * 監控 EventLoop 延遲
   */
  startEventLoopMonitoring() {
    let lastCheck = Date.now();

    setInterval(() => {
      const now = Date.now();
      const delay = now - lastCheck - 1000; // 應該是 ~1000ms

      if (delay > 100) {
        logger.warn('EventLoop 延遲', {
          delay: `${delay}ms`,
          memoryUsage: this.getMemoryUsage(),
        });
      }

      lastCheck = now;
    }, 1000);
  }
}

export const resourceMonitor = new ResourceMonitor();
```

---

## 🚨 告警和通知

### 1. **定義告警規則**

```typescript
// lib/monitoring/alerts.ts
interface AlertRule {
  name: string;
  condition: () => boolean;
  severity: 'critical' | 'high' | 'medium' | 'low';
  action: () => void;
}

class AlertManager {
  private rules: AlertRule[] = [];

  registerRule(rule: AlertRule) {
    this.rules.push(rule);
  }

  async checkAll() {
    for (const rule of this.rules) {
      if (rule.condition()) {
        await this.triggerAlert(rule);
      }
    }
  }

  private async triggerAlert(rule: AlertRule) {
    console.error(`[ALERT] ${rule.severity.toUpperCase()}: ${rule.name}`);

    // 執行告警操作
    rule.action();

    // 發送通知（郵件、Slack 等）
    await this.notifyAdmins(rule);
  }

  private async notifyAdmins(rule: AlertRule) {
    // 實作通知邏輯
    // 例如：發送 Slack 消息、發送電郵等
  }
}

export const alertManager = new AlertManager();

// 註冊告警規則
alertManager.registerRule({
  name: '高 CPU 使用率',
  condition: () => {
    // 檢查 CPU 使用率
    return false; // 實作實際檢查
  },
  severity: 'critical',
  action: () => {
    logger.error('檢測到高 CPU 使用率');
  },
});

alertManager.registerRule({
  name: 'API 響應時間過長',
  condition: () => {
    // 檢查平均響應時間
    return false; // 實作實際檢查
  },
  severity: 'high',
  action: () => {
    logger.warn('API 響應時間超過閾值');
  },
});
```

### 2. **集成 Sentry 進行錯誤追蹤**

```typescript
// lib/monitoring/sentry-init.ts
import * as Sentry from '@sentry/nextjs';

export function initSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // 只在生產環境啟用
    enabled: process.env.NODE_ENV === 'production',
  });
}

// 使用
try {
  // 某個操作
} catch (error) {
  Sentry.captureException(error);
}
```

---

## 📊 監控儀表板和指標

### 關鍵業務指標 (KPIs)

```typescript
// lib/monitoring/metrics.ts
interface Metric {
  name: string;
  value: number;
  timestamp: Date;
  tags?: Record<string, string>;
}

class MetricsCollector {
  private metrics: Metric[] = [];

  /**
   * 記錄活躍用戶數
   */
  recordActiveUsers(count: number) {
    this.metrics.push({
      name: 'active_users',
      value: count,
      timestamp: new Date(),
    });
  }

  /**
   * 記錄 API 調用
   */
  recordApiCall(endpoint: string, duration: number, success: boolean) {
    this.metrics.push({
      name: 'api_call',
      value: duration,
      timestamp: new Date(),
      tags: {
        endpoint,
        status: success ? 'success' : 'failure',
      },
    });
  }

  /**
   * 記錄交易
   */
  recordTransaction(amount: number, success: boolean) {
    this.metrics.push({
      name: 'transaction',
      value: amount,
      timestamp: new Date(),
      tags: {
        status: success ? 'success' : 'failure',
      },
    });
  }

  /**
   * 獲取指定時間範圍的指標
   */
  getMetrics(name: string, startTime: Date, endTime: Date) {
    return this.metrics.filter(
      (m) => m.name === name && m.timestamp >= startTime && m.timestamp <= endTime
    );
  }

  /**
   * 發送指標到監控服務
   */
  async flush() {
    if (this.metrics.length === 0) return;

    try {
      await fetch(`${process.env.METRICS_ENDPOINT}/api/metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.metrics),
      });

      this.metrics = [];
    } catch (error) {
      console.error('無法發送指標:', error);
    }
  }
}

export const metricsCollector = new MetricsCollector();

// 定期發送指標
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    metricsCollector.flush();
  }, 60000); // 每分鐘
}
```

---

## 🔐 訪問日誌和稽核

### 1. **記錄用戶操作**

```typescript
// lib/audit-log.ts
interface AuditLog {
  userId: string;
  action: string;
  resource: string;
  timestamp: Date;
  details?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

class AuditLogger {
  async log(auditLog: AuditLog) {
    // 記錄到資料庫
    await db.auditLogs.insert({
      ...auditLog,
      timestamp: new Date(),
    });

    // 如果是敏感操作，記錄警告
    if (['delete', 'update_payment', 'admin_action'].includes(auditLog.action)) {
      logger.warn(`審計日誌：${auditLog.action}`, {
        userId: auditLog.userId,
        resource: auditLog.resource,
      });
    }
  }
}

export const auditLogger = new AuditLogger();

// 使用示例
auditLogger.log({
  userId: 'user123',
  action: 'update_profile',
  resource: 'user/profile',
  details: { fields: ['name', 'avatar'] },
});
```

### 2. **敏感操作監控**

```typescript
// 記錄所有支付操作
export async function procesPayment(userId: string, amount: number) {
  try {
    // 執行支付
    const result = await paymentGateway.charge(amount);

    // 記錄審計日誌
    await auditLogger.log({
      userId,
      action: 'payment_processed',
      resource: 'payment',
      details: {
        amount,
        transactionId: result.id,
        status: result.status,
      },
    });

    return result;
  } catch (error) {
    // 記錄失敗
    await auditLogger.log({
      userId,
      action: 'payment_failed',
      resource: 'payment',
      details: {
        amount,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw error;
  }
}
```

---

## 🔍 日誌分析和查詢

### 查詢日誌示例

```bash
# 查看最近的錯誤
tail -f /var/log/myapp/error.log

# 搜尋特定用戶的活動
grep "userId:user123" /var/log/myapp/audit.log

# 統計 API 響應時間
cat /var/log/myapp/api.log | grep "api_call" | jq '.duration' | average

# 查看特定時間範圍的日誌
grep "2024-03-04" /var/log/myapp/error.log | wc -l
```

---

## 📋 監控檢查清單

### 開發時

```markdown
[ ] 為所有關鍵操作添加日誌
[ ] 設定適當的日誌級別
[ ] 測試日誌輸出
[ ] 實施錯誤追蹤（如 Sentry）
```

### 部署時

```markdown
[ ] 配置日誌收集
[ ] 設定告警規則
[ ] 配置監控儀表板
[ ] 設定備份和保留策略
[ ] 測試告警通知
```

### 部署後

```markdown
[ ] 監控錯誤率
[ ] 追蹤性能指標
[ ] 審查稽核日誌
[ ] 檢查告警
[ ] 定期分析日誌
```

---

## 📚 推薦工具

| 工具 | 用途 |
|------|------|
| **Sentry** | 錯誤追蹤和監控 |
| **Datadog** | 綜合監控和分析 |
| **ELK Stack** | 日誌管理和分析 |
| **Prometheus** | 性能監控 |
| **Grafana** | 監控儀表板 |
| **LogRocket** | 前端監控和重播 |
| **New Relic** | APM 和監控 |

---

## 📚 參考資源

- [Sentry 文檔](https://docs.sentry.io/)
- [Datadog 文檔](https://docs.datadoghq.com/)
- [Node.js 日誌最佳實踐](https://nodejs.org/en/docs/)
