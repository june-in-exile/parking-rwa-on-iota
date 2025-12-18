import { useState } from "react";
import { useSignAndExecuteTransaction } from "@iota/dapp-kit";
import { ParkingSpace } from "../types/parking";
import { createSetPriceTx, createTransferSpaceTx } from "../contracts/parking";
import "./MySpaceCard.css";

interface Props {
  space: ParkingSpace;
}

type ActionType = "setPrice" | "transfer" | null;

export default function MySpaceCard({ space }: Props) {
  const [actionType, setActionType] = useState<ActionType>(null);
  const [priceInput, setPriceInput] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const formatIOTA = (mist: number) => {
    return (mist / 1_000_000_000).toFixed(4);
  };

  const handleSetPrice = () => {
    const priceInMist = Math.floor(parseFloat(priceInput) * 1_000_000_000);
    if (isNaN(priceInMist) || priceInMist < 0) {
      setMessage("請輸入有效的價格");
      return;
    }

    setIsLoading(true);
    setMessage("");

    const tx = createSetPriceTx(space.id, priceInMist);

    signAndExecute(
      { transaction: tx as any },
      {
        onSuccess: (result) => {
          console.log("設定價格成功", result);
          setMessage("價格設定成功！");
          setIsLoading(false);
          setPriceInput("");
          setActionType(null);
          // 刷新頁面或更新狀態
          setTimeout(() => window.location.reload(), 2000);
        },
        onError: (error) => {
          console.error("設定價格失敗", error);
          setMessage("設定失敗: " + (error instanceof Error ? error.message : "未知錯誤"));
          setIsLoading(false);
        },
      }
    );
  };

  const handleTransfer = () => {
    if (!addressInput || !addressInput.startsWith("0x")) {
      setMessage("請輸入有效的 IOTA 地址");
      return;
    }

    setIsLoading(true);
    setMessage("");

    const tx = createTransferSpaceTx(space.id, addressInput);

    signAndExecute(
      { transaction: tx as any },
      {
        onSuccess: (result) => {
          console.log("轉讓成功", result);
          setMessage("轉讓成功！");
          setIsLoading(false);
          setAddressInput("");
          setActionType(null);
          // 刷新頁面或更新狀態
          setTimeout(() => window.location.reload(), 2000);
        },
        onError: (error) => {
          console.error("轉讓失敗", error);
          setMessage("轉讓失敗: " + (error instanceof Error ? error.message : "未知錯誤"));
          setIsLoading(false);
        },
      }
    );
  };

  return (
    <div className="my-space-card">
      <div className="card-header">
        <h3>📍 {space.location}</h3>
        <span className="owner-badge-my">我的</span>
      </div>

      <div className="card-body">
        <div className="info-row">
          <span className="label">時租費率:</span>
          <span className="value">{formatIOTA(space.hourlyRate)} IOTA/小時</span>
        </div>

        <div className="info-row">
          <span className="label">車位 ID:</span>
          <span className="value monospace">
            {space.id.slice(0, 8)}...{space.id.slice(-6)}
          </span>
        </div>

        {space.price > 0 ? (
          <div className="info-row sale-status">
            <span className="label">出售價格:</span>
            <span className="value price-tag">{formatIOTA(space.price)} IOTA</span>
          </div>
        ) : (
          <div className="info-row">
            <span className="label">狀態:</span>
            <span className="value">未出售</span>
          </div>
        )}
      </div>

      {!actionType && (
        <div className="card-actions">
          <button
            className="btn-action"
            onClick={() => setActionType("setPrice")}
          >
            {space.price > 0 ? "修改價格" : "設定售價"}
          </button>
          <button
            className="btn-action"
            onClick={() => setActionType("transfer")}
          >
            轉讓
          </button>
        </div>
      )}

      {actionType === "setPrice" && (
        <div className="action-panel">
          <h4>{space.price > 0 ? "修改出售價格" : "設定出售價格"}</h4>
          <p className="hint">輸入 0 可以下架</p>
          <input
            type="number"
            step="0.0001"
            min="0"
            placeholder="輸入價格 (IOTA)"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            disabled={isLoading}
          />
          {message && <p className={message.includes("成功") ? "success-msg" : "error-msg"}>{message}</p>}
          <div className="action-buttons">
            <button
              className="btn-cancel-action"
              onClick={() => {
                setActionType(null);
                setPriceInput("");
                setMessage("");
              }}
              disabled={isLoading}
            >
              取消
            </button>
            <button
              className="btn-confirm-action"
              onClick={handleSetPrice}
              disabled={isLoading || !priceInput}
            >
              {isLoading ? "處理中..." : "確認"}
            </button>
          </div>
        </div>
      )}

      {actionType === "transfer" && (
        <div className="action-panel">
          <h4>轉讓停車格</h4>
          <p className="hint">請輸入接收者的 IOTA 地址</p>
          <input
            type="text"
            placeholder="0x..."
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            disabled={isLoading}
          />
          {message && <p className={message.includes("成功") ? "success-msg" : "error-msg"}>{message}</p>}
          <div className="action-buttons">
            <button
              className="btn-cancel-action"
              onClick={() => {
                setActionType(null);
                setAddressInput("");
                setMessage("");
              }}
              disabled={isLoading}
            >
              取消
            </button>
            <button
              className="btn-confirm-action"
              onClick={handleTransfer}
              disabled={isLoading || !addressInput}
            >
              {isLoading ? "處理中..." : "確認轉讓"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
