# createCollection 測試案例說明

這個測試檔案 (`createCollection.test.ts`) 為 `createCollection.ts` 模組提供了完整的測試覆蓋。

## 測試覆蓋範圍

### 🏗️ Collection 創建
- 驗證集合創建時的正確初始化
- 檢查 data_path 和 fields 的設定
- 確認默認值的正確性

### 🔍 查詢建構器
- 測試 `buildArgs()` 方法的邏輯
- 驗證過濾器和排序參數的組合
- 檢查空參數的處理

### 📋 克隆功能
- 測試深拷貝的正確性
- 確保克隆對象的獨立性
- 驗證數據一致性

### 🔧 Where 條件
- **基本條件**: `where(field, value)`
- **操作符條件**: `where(field, operator, value)`
  - `>`, `>=`, `<`, `<=`, `==`, `!==`
- **特殊條件**:
  - `whereContains()` - 包含查詢
  - `whereIn()` - 範圍內查詢
  - `whereNotIn()` - 範圍外查詢
  - `whereBetween()` - 區間查詢
  - `whereNotBetween()` - 區間外查詢

### 📊 排序功能
- `sortBy()` - 升序排序
- `sortByDesc()` - 降序排序
- 支援字串字段和函數排序

### 📄 分頁功能
- `take()` - 限制筆數
- `skip()` - 跳過筆數
- `forPage()` - 分頁查詢
- `splice()` - 切片操作
- 處理已設定限制的情況

### 🛣️ 數據路徑
- `dataPath()` - 自定義數據路徑
- 支援巢狀路徑結構

### 📋 查詢負載
- `getQueryPayload()` - 生成查詢參數
- 驗證 GraphQL 查詢結構
- 包含 meta 資訊和參數

### 📦 批次數據
- 批次數據模式的支援
- 批次模式下的步驟處理
- 直接使用預載數據

### 🔄 方法步驟
- 延遲執行的步驟記錄
- 鏈式操作的正確性
- 步驟順序的維護

### 📡 數據抓取
- `fetchData()` - 數據抓取邏輯
- 巢狀數據路徑處理
- GraphQL 查詢建構

### ⚙️ 數據處理
- `processData()` - 數據處理流程
- 結合遠程查詢和本地處理

### 🎯 最終方法
- `all()` - 獲取所有數據
- `first()` - 獲取第一筆數據

### 🧪 邊界情況
- 空欄位對象處理
- 多重條件組合
- 複雜查詢測試
- 錯誤情況處理

## 測試統計

- **總測試數量**: 42 個
- **測試分組**: 10 個主要分組
- **覆蓋率**: 幾乎所有公共方法和重要私有方法

## 運行測試

```bash
# 運行所有測試
npm test

# 只運行 createCollection 測試
npm test -- createCollection.test.ts

# 監視模式運行測試
npm run test:watch -- createCollection.test.ts
```

## Mock 說明

測試使用了以下 Mock:
- **Axios**: 模擬 HTTP 客戶端
- **query**: 模擬 GraphQL 查詢函數
- **collect.js**: 使用真實的集合處理庫

這確保了測試的隔離性和可靠性，同時保持了與真實使用情況的一致性。
