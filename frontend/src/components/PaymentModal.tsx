import { useState } from "react";
import { useSignAndExecuteTransaction } from "@iota/dapp-kit";
import { ParkingSpace } from "../types/parking";
import { createParkingPaymentTx } from "../contracts/parking";
import { TransactionLink } from "./TransactionLink";
import "./PaymentModal.css";

interface Props {
  space: ParkingSpace;
  onClose: () => void;
}

export default function PaymentModal({ space, onClose }: Props) {
  const [hours, setHours] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [txDigest, setTxDigest] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const formatIOTA = (mist: number) => {
    return (mist / 1_000_000_000).toFixed(4);
  };

  const totalCost = space.hourlyRate * hours;

  const handlePayment = () => {
    setStatus("loading");
    setErrorMsg("");

    const tx = createParkingPaymentTx(space.id, BigInt(space.hourlyRate), hours);

    signAndExecute(
      { transaction: tx as any },
      {
        onSuccess: (result) => {
          console.log("支付成功", result);
          setStatus("success");
          setTxDigest(result.digest);
        },
        onError: (error) => {
          console.error("支付失敗", error);
          setStatus("error");
          setErrorMsg(error instanceof Error ? error.message : "交易失敗");
        },
      }
    );
  };

  const handleClose = () => {
    if (status !== "loading") {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>支付停車費</h2>
          <button className="close-btn" onClick={handleClose} disabled={status === "loading"}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {status === "idle" && (
            <>
              <div className="space-info">
                <h3>📍 {space.location}</h3>
                <p className="space-id">
                  車位 ID: {space.id.slice(0, 10)}...{space.id.slice(-8)}
                </p>
              </div>

              <div className="payment-form">
                <div className="form-group">
                  <label htmlFor="hours">停車時數</label>
                  <div className="hours-input">
                    <button
                      className="hour-btn"
                      onClick={() => setHours(Math.max(1, hours - 1))}
                      disabled={hours <= 1}
                    >
                      -
                    </button>
                    <input
                      id="hours"
                      type="number"
                      min="1"
                      max="24"
                      value={hours}
                      onChange={(e) => setHours(Math.max(1, Math.min(24, parseInt(e.target.value) || 1)))}
                    />
                    <button
                      className="hour-btn"
                      onClick={() => setHours(Math.min(24, hours + 1))}
                      disabled={hours >= 24}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="cost-breakdown">
                  <div className="cost-row">
                    <span>時租費率:</span>
                    <span>{formatIOTA(space.hourlyRate)} IOTA/小時</span>
                  </div>
                  <div className="cost-row">
                    <span>停車時數:</span>
                    <span>{hours} 小時</span>
                  </div>
                  <div className="cost-row total">
                    <span>總計:</span>
                    <span className="total-amount">{formatIOTA(totalCost)} IOTA</span>
                  </div>
                </div>

                <div className="fee-info">
                  💡 費用將自動分配給車位持有者和停車場營運商
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn-cancel" onClick={handleClose}>
                  取消
                </button>
                <button className="btn-confirm" onClick={handlePayment}>
                  確認支付
                </button>
              </div>
            </>
          )}

          {status === "loading" && (
            <div className="status-container">
              <div className="spinner-large"></div>
              <h3>處理交易中...</h3>
              <p>請在錢包中確認交易</p>
            </div>
          )}

          {status === "success" && (
            <div className="status-container success">
              <div className="success-icon">✓</div>
              <h3>支付成功！</h3>
              <p>您已成功支付 {hours} 小時的停車費</p>
              <div className="tx-info">
                <TransactionLink digest={txDigest} />
              </div>
              <button className="btn-close" onClick={handleClose}>
                關閉
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="status-container error">
              <div className="error-icon">✕</div>
              <h3>支付失敗</h3>
              <p className="error-message">{errorMsg}</p>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={handleClose}>
                  關閉
                </button>
                <button className="btn-retry" onClick={() => setStatus("idle")}>
                  重試
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
