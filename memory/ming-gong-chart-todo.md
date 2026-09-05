# 歲星臨命圖 — 前端待辦（2026-05-11）

## 已完成（後端）
- DB 表：`YearStarMap` + `YearFlowStar` 各 144 筆（NeonDB 已執行）
- DB 表：`BaziMingGongStars` 12 筆 + `BaziShenSha12` 12 筆（NeonDB 已執行）
- 端點：`GET /api/Consultation/ming-gong-chart?year={year}`
- 已部署 Fly.io（commit e1e9dcb）

## API 回傳格式

```json
{
  "chart": "ASCII 文字圖（歲星臨命圖 4×4 格）",
  "year": 2026,
  "flowYear": "丙午",
  "mingGong": "寅",
  "mingGongStar": "天權星（吉）",
  "palaces": [
    {
      "palName": "命宮",
      "branch": "寅",
      "starChar": "天",
      "dir": "東北",
      "flowId": 3,
      "goodStar": "天德 將星",
      "badStar": "白虎",
      "yearGod": "青龍",
      "yearGodDesc": "論斷詩文...",
      "yearGodType": "事業,貴人"
    },
    // ...12 宮
  ]
}
```

## 前端待辦

### 位置
- 在 `app/member/page.tsx` 新增「歲星臨命圖」區塊
- 或獨立頁面 `app/member/ming-gong-chart/page.tsx`

### UI 規格
- 12 宮格（4×4，中央空白 2×2）
- 每格顯示：宮名 + 地支 + 年神名 + 吉凶色標（吉=金/綠，凶=紅）
- 點擊格子展開：吉星/凶星/年神論斷詩
- 上方：命宮星名 + 流年干支 + 年份選擇（當年/未來）
- 下方說明：命宮論斷（BaziMingGongStar.Description）

### 12 宮格排列（傳統順序）
```
[ 官祿[9] ][ 遷移[8] ][ 疾厄[7] ][ 夫妻[6] ]
[ 福德[10]][ 空       ][ 空       ][ 奴僕[5] ]
[ 相貌[11]][ 空       ][ 空       ][ 男女[4] ]
[ 命宮[0] ][ 財帛[1]  ][ 兄弟[2]  ][ 田宅[3] ]
```
（palaces 陣列 index 0=命宮，逆時針排）

### 色彩規則
| LuckLevel | 顯示色 |
|-----------|--------|
| 大吉      | amber-400 |
| 吉        | green-400 |
| 中性      | gray-400  |
| 小凶      | orange-400 |
| 凶        | red-400   |
| 大凶      | red-600   |

### API 呼叫
```typescript
const res = await fetch(
  `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/Consultation/ming-gong-chart?year=${year}`,
  { headers: { Authorization: `Bearer ${token}` } }
);
const data = await res.json();
// data.palaces[0..11] 對應 12 宮
```

## 其他待辦
- 流月神煞整合進流年命書 Ch.5（用戶說「我想想」，暫緩）
