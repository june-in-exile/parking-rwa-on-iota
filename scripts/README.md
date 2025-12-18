# 測試腳本使用指南

## 📋 test-contract.sh 功能說明

這個腳本會自動執行完整的停車場 RWA 系統測試流程，包括：

1. ✅ **自動讀取 .env 設定**
2. ✅ **創建停車場** (Operator)
3. ✅ **鑄造停車格** (Operator)
4. ✅ **購買停車格** (Alice)
5. ✅ **支付停車費** (Bob)
6. ✅ **自動提取 Object ID**
7. ✅ **自動更新 .env 檔案**

---

## 🚀 快速開始

### 步驟 1: 準備環境

1. **複製 .env.example 為 .env**
   ```bash
   cp .env.example .env
   ```

2. **編輯 .env 填入您的資訊**
   ```bash
   # 合約部署資訊（部署後填入）
   PACKAGE_ID=0x...

   # Operator（營運商）錢包
   OPERATOR_ADDRESS=0x...
   OPERATOR_PRIVATE_KEY=...

   # Alice（用戶）錢包
   ALICE_ADDRESS=0x...
   ALICE_PRIVATE_KEY=...

   # Bob（駕駛人）錢包
   BOB_ADDRESS=0x...
   BOB_PRIVATE_KEY=...
   ```

### 步驟 2: 部署合約

```bash
cd move
iota client publish --gas-budget 100000000
```

記錄 **PACKAGE_ID** 並更新到 `.env` 檔案中。

### 步驟 3: 執行測試腳本

```bash
./scripts/test-contract.sh
```

---

## 🎯 腳本執行流程

### 自動執行部分

腳本會自動執行以下操作：

```
┌─────────────────────────────────────────┐
│ 1️⃣ 讀取 .env 環境變數                   │
├─────────────────────────────────────────┤
│ 2️⃣ Operator 創建停車場                  │
│   └─ 自動提取 LOT_ID                     │
├─────────────────────────────────────────┤
│ 3️⃣ Operator 鑄造停車格（A1）            │
│   └─ 自動提取 SPACE_ID                   │
├─────────────────────────────────────────┤
│ 4️⃣ 等待 Alice 購買停車格 ⏸️             │
│   └─ 顯示執行命令                        │
├─────────────────────────────────────────┤
│ 5️⃣ 等待 Bob 支付停車費 ⏸️               │
│   └─ 顯示執行命令                        │
├─────────────────────────────────────────┤
│ 6️⃣ 查詢停車格狀態                       │
├─────────────────────────────────────────┤
│ 7️⃣ 自動更新 .env 檔案                   │
│   └─ 儲存 LOT_ID 和 SPACE_ID            │
└─────────────────────────────────────────┘
```

### 需要手動操作部分

#### Alice 購買停車格
當腳本顯示以下訊息時：
```
⚠️  請切換到 Alice 的錢包執行以下命令：

iota client call \
  --package 0x... \
  --module parking_rwa \
  --function purchase_space \
  --args 0x... \
  --gas-budget 20000000
```

**操作步驟**：
1. 複製顯示的命令
2. 開啟新的終端視窗
3. 切換到 Alice 的錢包環境
4. 執行命令
5. 回到腳本視窗按 Enter 繼續

#### Bob 支付停車費
當腳本顯示以下訊息時：
```
⚠️  請切換到 Bob 的錢包執行以下命令：

iota client call \
  --package 0x... \
  --module parking_rwa \
  --function pay_for_parking \
  --args 0x... 0x... 2 \
  --gas-budget 20000000
```

**操作步驟**：同上

---

## 🔍 自動提取功能

腳本會自動從交易輸出中提取 Object ID：

### 成功提取
```
🔍 正在嘗試自動提取 LOT_ID...
✅ 自動提取到 LOT_ID: 0xabc123...
```

### 需要手動輸入
如果自動提取失敗：
```
⚠️  無法自動提取 LOT_ID
   請手動從上面的輸出中複製 ParkingLot 的 Object ID

請輸入 LOT_ID: _
```

此時請從上方交易輸出中找到 Object ID 並輸入。

---

## 📝 .env 自動更新

測試完成後，腳本會自動更新 `.env` 檔案：

```bash
📝 更新 .env 檔案...
✅ .env 檔案已更新

📝 重要資訊：
  PACKAGE_ID: 0x...
  LOT_ID: 0x...
  SPACE_ID: 0x...
```

**備份說明**：
- 腳本會自動備份為 `.env.backup`
- 如果更新失敗，可以從備份還原

---

## 🐛 故障排除

### 問題 1: 無法讀取 .env
```
❌ 請先設置環境變數
```

**解決方法**：
1. 確認 `.env` 檔案存在於專案根目錄
2. 確認已填入 `PACKAGE_ID`
3. 重新執行腳本

### 問題 2: 交易失敗
```
Error: Insufficient gas
```

**解決方法**：
1. 確認錢包有足夠的 IOTA
2. 增加 `--gas-budget` 參數值
3. 檢查網路連接

### 問題 3: 自動提取失敗

**解決方法**：
1. 手動從交易輸出中找到 `objectId`
2. 複製完整的 Object ID（包含 `0x`）
3. 貼上到提示輸入處

### 問題 4: LOT_ID 或 SPACE_ID 不能為空
```
❌ LOT_ID 不能為空
```

**解決方法**：
1. 重新執行腳本
2. 仔細查看交易輸出
3. 手動輸入正確的 Object ID

---

## 📊 預期結果

成功執行後，您應該看到：

### Operator 收益
- 出售停車格：**+10 IOTA**
- 停車費分潤（80%）：**+1.6 IOTA**
- **總收益：11.6 IOTA**

### Alice 收益
- 購買停車格：**-10 IOTA**
- 停車費分潤（20%）：**+0.4 IOTA**
- **淨收益：-9.6 IOTA**（需要更多次停車才能回本）

### Bob 支出
- 停車 2 小時：**-2 IOTA**

---

## 🔧 進階使用

### 手動設置 LOT_ID
如果您已經創建過停車場：
```bash
export LOT_ID=0x...
./scripts/test-contract.sh
```

腳本會跳過創建停車場步驟。

### 只測試特定步驟
您可以註解掉不需要的部分，只執行特定測試。

### 調整參數
編輯腳本中的參數：
```bash
# 修改停車格位置
--args "$LOT_ID" "B2" 1000000000 10000000000

# 修改停車時數
--args $LOT_ID $SPACE_ID 5
```

---

## 📚 相關文檔

- [DEPLOYMENT.md](../DEPLOYMENT.md) - 完整部署指南
- [BUSINESS_FLOW.md](../BUSINESS_FLOW.md) - 業務流程說明
- [README.md](../README.md) - 系統設計方案

---

## ✅ 測試檢查清單

執行測試前，請確認：

- [ ] 已安裝 IOTA CLI
- [ ] 已部署合約並獲得 PACKAGE_ID
- [ ] 已建立 .env 檔案並填入資訊
- [ ] Operator 錢包有足夠的測試幣
- [ ] Alice 錢包有足夠的測試幣（至少 10 IOTA）
- [ ] Bob 錢包有足夠的測試幣（至少 2 IOTA）
- [ ] 腳本有執行權限（`chmod +x scripts/test-contract.sh`）

---

**祝測試順利！** 🚀
