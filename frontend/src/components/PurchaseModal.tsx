import { useState } from "react";
import { useSignAndExecuteTransaction } from "@iota/dapp-kit";
import { ParkingSpace } from "../types/parking";
import { createPurchaseSpaceTx } from "../contracts/parking";
import "./PurchaseModal.css";

interface Props {
  space: ParkingSpace;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PurchaseModal({ space, onClose, onSuccess }: Props) {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // IOTA 使用 MIST 作為最小單位 (1 IOTA = 1,000,000,000 MIST)
  const formatIOTA = (mist: number) => {
    return (mist / 1_000_000_000).toFixed(4);
  };

  const handlePurchase = async () => {
    setIsPurchasing(true);
    setError(null);

    try {
      const tx = createPurchaseSpaceTx(space.id, space.price);

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log("購買成功:", result);
            setIsPurchasing(false);
            if (onSuccess) {
              onSuccess();
            }
            onClose();
          },
          onError: (err) => {
            console.error("購買失敗:", err);
            setError(err instanceof Error ? err.message : "購買失敗，請稍後再試");
            setIsPurchasing(false);
          },
        }
      );
    } catch (err) {
      console.error("交易建立失敗:", err);
      setError(err instanceof Error ? err.message : "交易建立失敗");
      setIsPurchasing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>購買停車格</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="purchase-info">
            <div className="info-section">
              <h3>停車格資訊</h3>
              <div className="info-item">
                <span className="label">位置:</span>
                <span className="value">{space.location}</span>
              </div>
              <div className="info-item">
                <span className="label">時租費率:</span>
                <span className="value">{formatIOTA(space.hourlyRate)} IOTA/小時</span>
              </div>
              <div className="info-item">
                <span className="label">當前持有者:</span>
                <span className="value monospace">
                  {space.owner.slice(0, 8)}...{space.owner.slice(-6)}
                </span>
              </div>
            </div>

            <div className="price-section">
              <h3>購買價格</h3>
              <div className="price-display">
                <span className="price-amount">{formatIOTA(space.price)}</span>
                <span className="price-currency">IOTA</span>
              </div>
            </div>

            <div className="warning-section">
              <p>⚠️ 購買後您將成為此停車格的所有者，並可獲得該停車格的租金收益（20%）。</p>
              <p>💡 營運商將收取租金的 80% 作為佣金。</p>
            </div>
          </div>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={onClose}
            disabled={isPurchasing}
          >
            取消
          </button>
          <button
            className="btn-primary"
            onClick={handlePurchase}
            disabled={isPurchasing}
          >
            {isPurchasing ? "購買中..." : `確認購買 ${formatIOTA(space.price)} IOTA`}
          </button>
        </div>
      </div>
    </div>
  );
}
