# 停車場 RWA 系統設計方案

1. 系統架構概要本系統利用 Move 語言的 Object-centric (以物件為中心) 特性，將停車格資產化。用戶透過持有「停車格 NFT」獲得該車位的收益分潤

2. 鏈上合約設計 (IOTA Move)
    核心物件類型
    - ParkingSpace (停車格物件):
      - `id`: UID (鏈上唯一識別碼)
      - `location`: String (地址/車位編號)
      - `hourly_rate`: u64 (每小時費用，單位為 Nano IOTA)
      - `owner`: address (當前收益權持有者)

    - ParkingLot (停車場營運物件):
      - `id`: UID (鏈上唯一識別碼)
      - `operator`: address (營運商地址)
      - `commission_rate`: u64 (營運商抽成比例，預設 80%)
      - `spaces`: Table/Vector (關聯的所有車位 ID)

    核心功能 (Functions)
    1. `mint_parking_space`: 由營運商調用，初始化車位並發行給自己。
    2. `pay_for_parking`:
       - 輸入: 車位 ID、停放時數、支付金額 (Coin<IOTA>)。
       - 邏輯:驗證金額是否等於 $hourly\_rate \times hours$。將總額的 20% 撥付給 ParkingSpace.owner。將總額的 80% 撥付給 ParkingLot.operator。
    3. `transfer_space`: 允許用戶在二級市場交易車位物件，變更 owner 欄位以轉移收益權。

3. 前端模擬流程
   - 資產展示: 從鏈上拉取該營運商下所有的 ParkingSpace 物件，顯示地址與費率。
   - 支付介面:
       1. 用戶選擇一個 Space ID。
       2. 輸入預計停車時數（預設 1 小時）。
       3. 自動計算: $Total = Rate \times Hours$。
       4. 觸發錢包: 調用 pay_for_parking 合約指令，發起交易簽署。
   - 收益看板: 持有者可看到自己擁有的車位編號及歷史收到的分潤金額。

## Architecture

```
parking-rwa-on-iota/
├── move/                # IOTA Move 合約
│   ├── sources/         # .move 源代碼
│   └── Move.toml        # 合約配置
├── frontend/            # React / Next.js 應用
│   ├── src/
│   │   ├── hooks/       # 錢包連接與合約交互邏輯 (IOTA SDK)
│   │   ├── components/  # 支付 UI、車位清單、收益看板
│   │   └── api/         # 模擬物聯網(IoT)或快取數據
├── indexer/             # (選配) 監聽鏈上事件並存入數據庫，加速前端讀取
└── README.md
```

A. 智能合約層 (Move)
資產層 (Resource Layer)：定義 ParkingSpace NFT。

邏輯層 (Logic Layer)：處理分潤計算（20% / 80%）與資產轉讓。

存儲層 (Storage Layer)：利用 IOTA 的物件存儲，將車位狀態存在鏈上，確保不可篡改。

B. 前端整合層 (Frontend)
錢包對接：使用 @iota/dapp-kit 整合錢包（如 Enoki 或 IOTA Wallet）。

狀態管理：

使用 useSWR 或 React Query 定期抓取鏈上車位物件狀態。

計算當前 IOTA 餘額與應付金額。

交易封裝：將 TransactionBlock 模組化，讓前端只需帶入 hours 與 spaceId 參數即可發起支付。

C. 離鏈處理層 (Indexer/Backend)
問題：直接查詢鏈上大量物件可能較慢。

解決：使用 IOTA RPC 監聽 pay_for_parking 的 Event。一旦收到支付成功事件，後端可通知實體停車場的硬體（如：自動升降地鎖）解鎖。


