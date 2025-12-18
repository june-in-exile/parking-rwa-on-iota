# Parking RWA on IOTA

這是一個基於 IOTA 網絡構建的停車位 RWA (Real World Asset) 專案。本專案利用 IOTA SDK 與 dApp Kit 進行開發。

## 環境需求

- **Node.js**: 建議使用 v18 或更高版本。
- **套件管理器**: npm, yarn 或 pnpm。

## 安裝說明

1. **克隆專案**
   ```bash
   git clone <repository-url>
   cd "Parking RWA on IOTA"
   ```

2. **安裝依賴套件**
   ```bash
   npm install
   ```

## 環境變數設定

專案依賴環境變數來運行。請在專案根目錄下建立 `.env` 文件（可參考 `.env.example` 若存在）。

根據 `.gitignore` 的設定，支援以下環境變數文件：
- `.env` (預設)
- `.env.local`
- `.env.development.local`
- `.env.test.local`
- `.env.production.local`

## 操作說明

由於 `package.json` 中的腳本配置可能因開發階段而異，請查看 `package.json` 中的 `"scripts"` 區塊以獲取確切指令。一般常見指令如下：

- **啟動開發伺服器**：
  ```bash
  npm run dev
  # 或
  npm start
  ```

- **建置生產版本**：
  ```bash
  npm run build
  ```

## 測試

若要執行測試並查看程式碼覆蓋率（Coverage），請執行：

```bash
npm test
```

## 技術棧

- **@iota/sdk**: IOTA 核心 SDK，用於與節點互動。
- **@iota/dapp-kit**: 用於構建 dApp 前端並整合錢包功能。
- **@mysten/bcs**: 用於處理 Move 語言相關的數據序列化。