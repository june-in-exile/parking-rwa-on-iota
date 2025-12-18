#!/bin/bash

# 停車場 RWA 合約測試腳本
# 使用方法: ./scripts/test-contract.sh

set -e

echo "🚀 開始測試停車場 RWA 合約..."
echo ""

# 檢查是否設置了環境變數
if [ -z "$PACKAGE_ID" ]; then
    echo "❌ 請先設置 PACKAGE_ID 環境變數"
    echo "   export PACKAGE_ID=0x..."
    exit 1
fi

echo "📦 PACKAGE_ID: $PACKAGE_ID"
echo ""

# 步驟 1: 創建停車場
echo "1️⃣ 創建停車場 (ParkingLot)..."
CREATE_LOT_OUTPUT=$(iota client call \
    --package "$PACKAGE_ID" \
    --module parking_rwa \
    --function create_lot \
    --gas-budget 10000000 2>&1)

echo "$CREATE_LOT_OUTPUT"

# 提取 LOT_ID (需要手動從輸出中複製)
echo ""
echo "⚠️  請從上面的輸出中複製 ParkingLot 的 Object ID"
echo "   然後執行: export LOT_ID=0x..."
echo ""

# 等待用戶設置 LOT_ID
read -p "按 Enter 繼續到下一步（確保已設置 LOT_ID）..."

if [ -z "$LOT_ID" ]; then
    echo "❌ 請先設置 LOT_ID 環境變數"
    exit 1
fi

echo "🏢 LOT_ID: $LOT_ID"
echo ""

# 步驟 2: 鑄造停車格
echo "2️⃣ 鑄造停車格 NFT..."
MINT_OUTPUT=$(iota client call \
    --package "$PACKAGE_ID" \
    --module parking_rwa \
    --function mint_space \
    --args "A1" 1000000000 \
    --gas-budget 10000000 2>&1)

echo "$MINT_OUTPUT"

echo ""
echo "⚠️  請從上面的輸出中複製 ParkingSpace 的 Object ID"
echo "   然後執行: export SPACE_ID=0x..."
echo ""

# 等待用戶設置 SPACE_ID
read -p "按 Enter 繼續到下一步（確保已設置 SPACE_ID）..."

if [ -z "$SPACE_ID" ]; then
    echo "❌ 請先設置 SPACE_ID 環境變數"
    exit 1
fi

echo "🅿️  SPACE_ID: $SPACE_ID"
echo ""

# 步驟 3: 測試支付功能
echo "3️⃣ 測試支付停車費（2 小時）..."
PAY_OUTPUT=$(iota client call \
    --package "$PACKAGE_ID" \
    --module parking_rwa \
    --function pay_for_parking \
    --args "$LOT_ID" "$SPACE_ID" 2 \
    --gas-budget 10000000 2>&1)

echo "$PAY_OUTPUT"
echo ""

# 步驟 4: 查詢物件狀態
echo "4️⃣ 查詢停車格狀態..."
iota client object "$SPACE_ID"
echo ""

echo "✅ 測試完成！"
echo ""
echo "📝 記錄以下資訊到 frontend/src/constants/ids.ts:"
echo "   PACKAGE_ID: $PACKAGE_ID"
echo "   LOT_ID: $LOT_ID"
echo ""
