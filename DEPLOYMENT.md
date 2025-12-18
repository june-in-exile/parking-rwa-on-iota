# 停車場 RWA 系統部署指南

## ✅ 合約編譯狀態

**最後編譯時間:** 2025-12-18
**編譯狀態:** ✅ 成功
**警告:** 2 個（可忽略）

### 編譯輸出
```
BUILDING parking_system
✅ 編譯成功
```

## 📋 部署前檢查清單

- [x] 合約編譯成功
- [x] 添加必要的 Event（PaymentEvent, TransferEvent）
- [x] 修復權限驗證問題
- [ ] 部署到 IOTA 測試網
- [ ] 記錄 PACKAGE_ID
- [ ] 創建 ParkingLot 並記錄 LOT_ID
- [ ] 更新前端常數

## 🚀 部署步驟

### 1. 準備環境變數

確保 `.env` 檔案包含以下內容：
```bash
OPERATOR_ADDRESS=YOUR_OPERATOR_ADDRESS
OPERATOR_PRIVATE_KEY=YOUR_OPERATOR_PRIVATE_KEY
```

### 2. 部署合約

```bash
cd move
iota client publish --gas-budget 100000000
```

### 3. 記錄部署資訊

部署成功後，記錄以下資訊：

- **PACKAGE_ID**: `0x...` （從部署輸出中獲取）
- **升級 Cap ID**: `0x...`

### 4. 創建 ParkingLot

使用部署的合約創建停車場：

```bash
iota client call \
  --package <PACKAGE_ID> \
  --module parking_rwa \
  --function create_lot \
  --gas-budget 10000000
```

記錄 **LOT_ID**: `0x...`

### 5. 鑄造測試停車格

```bash
iota client call \
  --package <PACKAGE_ID> \
  --module parking_rwa \
  --function mint_space \
  --args \"A1\" 1000000000 \
  --gas-budget 10000000
```

參數說明：
- `"A1"`: 停車格位置/編號
- `1000000000`: 每小時費率（1 IOTA = 1,000,000,000 Nano IOTA）

記錄 **SPACE_ID**: `0x...`

### 6. 更新前端常數

編輯 `frontend/src/constants/ids.ts`：

```typescript
export const PACKAGE_ID = "0x<your_package_id>";
export const LOT_ID = "0x<your_lot_id>";
```

## 🧪 測試合約功能

### 測試支付功能

```bash
iota client call \
  --package <PACKAGE_ID> \
  --module parking_rwa \
  --function pay_for_parking \
  --args <LOT_ID> <SPACE_ID> 2 \
  --gas-budget 10000000
```

這會支付 2 小時的停車費。

### 測試轉讓功能

```bash
iota client call \
  --package <PACKAGE_ID> \
  --module parking_rwa \
  --function transfer_space \
  --args <SPACE_ID> <NEW_OWNER_ADDRESS> \
  --gas-budget 10000000
```

## 📊 合約 API 參考

### 公開函數

#### `create_lot(ctx: &mut TxContext)`
創建停車場營運物件。
- **權限**: 任何人
- **返回**: 創建 ParkingLot 共享物件

#### `mint_space(location: String, hourly_rate: u64, ctx: &mut TxContext)`
鑄造停車格 NFT。
- **參數**:
  - `location`: 車位編號（如 "A1", "B2"）
  - `hourly_rate`: 每小時費率（Nano IOTA）
- **權限**: 任何人（建議添加營運商權限檢查）
- **返回**: 將 ParkingSpace 轉移給調用者

#### `pay_for_parking(lot: &ParkingLot, space: &mut ParkingSpace, hours: u64, payment: Coin<IOTA>, ctx: &mut TxContext)`
支付停車費並自動分潤。
- **參數**:
  - `lot`: ParkingLot 物件引用
  - `space`: ParkingSpace 物件可變引用
  - `hours`: 停車時數
  - `payment`: 支付的 IOTA Coin
- **分潤**: 80% 給營運商，20% 給車位持有者
- **事件**: 發出 PaymentEvent

#### `transfer_space(space: &mut ParkingSpace, to: address, ctx: &mut TxContext)`
轉讓停車格收益權。
- **參數**:
  - `space`: ParkingSpace 物件可變引用
  - `to`: 新持有者地址
- **權限**: 只有當前 owner 可調用
- **事件**: 發出 TransferEvent

## 🔍 事件監聽

### PaymentEvent
```rust
struct PaymentEvent {
    space_id: ID,
    payer: address,
    hours: u64,
    total_amount: u64,
    owner_share: u64,
    operator_share: u64,
}
```

### TransferEvent
```rust
struct TransferEvent {
    space_id: ID,
    from: address,
    to: address,
}
```

## 📝 注意事項

1. **Gas Budget**: 建議設置充足的 gas budget，避免交易失敗
2. **費率單位**: hourly_rate 使用 Nano IOTA（1 IOTA = 10^9 Nano IOTA）
3. **權限管理**: 目前 mint_space 沒有權限限制，任何人都可以鑄造
4. **測試網**: 建議先在測試網充分測試後再部署到主網

## 🔗 相關連結

- [IOTA 官方文檔](https://docs.iota.org/)
- [Move 語言文檔](https://move-language.github.io/move/)
- [IOTA Move 框架](https://github.com/iotaledger/iota)

## 🐛 已知問題

無

## ✅ 最新更新 (2025-12-18)

- ✅ 修復 transfer_space 權限驗證問題
- ✅ 添加 PaymentEvent 和 TransferEvent
- ✅ 合約編譯成功
- ✅ 所有核心功能實現完成
