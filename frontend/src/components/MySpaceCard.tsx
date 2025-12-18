import { useState } from "react";
import { useSignAndExecuteTransaction } from "@iota/dapp-kit";
import { ParkingSpace } from "../types/parking";
import { createSetPriceTx, createTransferSpaceTx } from "../contracts/parking";
import ListForSaleModal from "./ListForSaleModal";
import "./MySpaceCard.css";

interface Props {
  space: ParkingSpace;
  onActionSuccess: () => void;
}

type ActionType = "transfer" | null;

export default function MySpaceCard({ space, onActionSuccess }: Props) {
  const [actionType, setActionType] = useState<ActionType>(null);
  const [addressInput, setAddressInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isListModalOpen, setIsListModalOpen] = useState(false);

  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const formatIOTA = (mist: number) => {
    return (mist / 1_000_000).toFixed(2);
  };

  const handleCancelListing = () => {
    setIsLoading(true);
    setMessage("正在下架...");

    const tx = createSetPriceTx(space.id, BigInt(0));

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: () => {
          setMessage("下架成功！");
          setIsLoading(false);
          onActionSuccess();
        },
        onError: (error) => {
          console.error("下架失敗", error);
          setMessage("下架失敗: " + (error instanceof Error ? error.message : "未知錯誤"));
          setIsLoading(false);
        },
      }
    );
  };

  const handleTransfer = () => {
    if (!addressInput || !addressInput.startsWith("iota")) {
      setMessage("請輸入有效的 IOTA 地址");
      return;
    }

    setIsLoading(true);
    setMessage("");

    const tx = createTransferSpaceTx(space.id, addressInput);

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: () => {
          setMessage("轉讓成功！");
          setIsLoading(false);
          setAddressInput("");
          setActionType(null);
          onActionSuccess();
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
    <>
      {isListModalOpen && (
        <ListForSaleModal
          space={space}
          onClose={() => setIsListModalOpen(false)}
          onSuccess={() => {
            onActionSuccess();
            setIsListModalOpen(false);
          }}
        />
      )}
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
            {space.price > 0 ? (
              <button
                className="btn-action btn-cancel-sale"
                onClick={handleCancelListing}
                disabled={isLoading}
              >
                {isLoading ? '下架中...' : '下架'}
              </button>
            ) : (
              <button
                className="btn-action"
                onClick={() => setIsListModalOpen(true)}
                disabled={isLoading}
              >
                出售
              </button>
            )}
            <button
              className="btn-action"
              onClick={() => setActionType("transfer")}
              disabled={isLoading}
            >
              轉讓
            </button>
          </div>
        )}

        {actionType === "transfer" && (
          <div className="action-panel">
            <h4>轉讓停車格</h4>
            <p className="hint">請輸入接收者的 IOTA 地址</p>
            <input
              type="text"
              placeholder="iota..."
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
    </>
  );
}
