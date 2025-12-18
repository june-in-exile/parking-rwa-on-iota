# Parking RWA Frontend

基於 IOTA 區塊鏈的停車格資產化（RWA）前端應用

## 功能特色

✅ **錢包連接** - 支援 IOTA 錢包連接
✅ **停車格瀏覽** - 查看所有可用停車格
✅ **停車費支付** - 支付停車費用（按小時計費）
✅ **車位購買** - 購買停車格 NFT 資產
✅ **車位管理** - 設定售價、轉讓給他人
✅ **收益看板** - 查看持有資產和收益

## 技術棧

- **React 18** + **TypeScript** - UI 框架
- **Vite** - 建構工具
- **@iota/dapp-kit** - IOTA 錢包整合
- **@iota/iota-sdk** - IOTA SDK
- **@tanstack/react-query** - 數據狀態管理

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

複製 `.env.example` 為 `.env` 並填入實際的合約地址：

```bash
cp .env.example .env
```

編輯 `.env` 文件：

```env
VITE_IOTA_NETWORK=testnet
VITE_PACKAGE_ID=0x你的合約Package_ID
VITE_LOT_ID=0x你的停車場LOT_ID
```

### 3. 啟動開發伺服器

```bash
npm run dev
```

訪問 http://localhost:3000

### 4. 建構生產版本

```bash
npm run build
```

## 專案結構

```
frontend/
├── src/
│   ├── components/        # React 組件
│   │   ├── ParkingApp.tsx       # 主應用
│   │   ├── WalletConnect.tsx    # 錢包連接
│   │   ├── ParkingSpaceList.tsx # 停車格列表
│   │   ├── ParkingSpaceCard.tsx # 停車格卡片
│   │   ├── PaymentModal.tsx     # 支付彈窗
│   │   ├── MySpaces.tsx         # 我的停車格
│   │   └── MySpaceCard.tsx      # 我的停車格卡片
│   ├── hooks/             # 自定義 Hooks
│   │   └── useParking.ts        # 停車格數據 Hook
│   ├── contracts/         # 合約交互函數
│   │   └── parking.ts           # 交易建構函數
│   ├── types/             # TypeScript 類型定義
│   │   └── parking.ts           # 停車格類型
│   ├── constants/         # 常數配置
│   │   └── ids.ts               # 合約 ID
│   ├── App.tsx            # App 入口
│   ├── main.tsx           # 主入口
│   └── index.css          # 全局樣式
├── index.html             # HTML 模板
├── vite.config.ts         # Vite 配置
├── tsconfig.json          # TypeScript 配置
└── package.json           # 專案配置
```

## 主要功能使用

### 連接錢包

1. 點擊「Connect Wallet」按鈕
2. 選擇您的 IOTA 錢包
3. 授權連接

### 租用停車格

1. 在「瀏覽停車格」頁面選擇一個停車格
2. 點擊「立即租用」
3. 選擇停車時數（1-24小時）
4. 確認交易並在錢包中簽名

### 購買停車格

1. 找到標記為「出售中」的停車格
2. 點擊「購買車位」
3. 確認價格並完成交易

### 管理您的停車格

1. 切換到「我的停車格」頁面
2. 選擇一個停車格
3. 可以：
   - **設定售價** - 將停車格上架出售
   - **轉讓** - 轉讓給指定地址
   - **修改價格** - 調整售價或下架（設為0）

## 合約功能說明

### pay_for_parking
支付停車費用，費用會自動分配給：
- 停車格持有者（獲得大部分收益）
- 停車場營運商（獲得佣金）

### purchase_space
購買標價出售的停車格 NFT

### set_price
車位持有者設定出售價格（0 表示不出售）

### transfer_space
車位持有者轉讓停車格給他人

## 開發提示

### 更新合約 ID

在 `src/constants/ids.ts` 中更新：

```typescript
export const PACKAGE_ID = "0x你的Package_ID";
export const LOT_ID = "0x你的LOT_ID";
```

### 調試

使用瀏覽器開發者工具查看：
- Console 輸出
- Network 請求
- React DevTools

### 常見問題

**Q: 為什麼看不到停車格？**
A: 確認合約已部署並且 PACKAGE_ID 已正確設定

**Q: 交易失敗怎麼辦？**
A: 檢查：
1. 錢包是否有足夠的 IOTA
2. 合約地址是否正確
3. 網路連接是否正常

**Q: 如何獲取測試 IOTA？**
A: 訪問 IOTA Testnet Faucet 獲取測試代幣

## License

MIT
