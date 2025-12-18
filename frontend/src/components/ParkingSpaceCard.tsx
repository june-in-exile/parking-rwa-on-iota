import { useState } from "react";
import { useCurrentAccount } from "@iota/dapp-kit";
import { ParkingSpace } from "../types/parking";
import PaymentModal from "./PaymentModal";
import PurchaseModal from "./PurchaseModal";
import "./ParkingSpaceCard.css";

interface Props {
  space: ParkingSpace;
  onPurchaseSuccess?: () => void;
  setActiveTab?: (tab: "browse" | "market" | "myspaces" | "mint") => void;
}

export default function ParkingSpaceCard({ space, onPurchaseSuccess, setActiveTab }: Props) {
  const currentAccount = useCurrentAccount();
  const [showPayment, setShowPayment] = useState(false);
  const [showPurchase, setShowPurchase] = useState(false);
  const isOwner = currentAccount?.address === space.owner;

  // IOTA 使用 nanoIOTA 作為最小單位 (1 IOTA = 1,000,000,000 nanoIOTA)
  const formatIOTA = (nanoIOTA: number) => {
    return (nanoIOTA / 1_000_000_000).toFixed(2);
  };

  return (
    <>
      <div className="parking-space-card">
        <div className="card-header">
          <span className="location-icon">📍</span>
          <h3 className="location">{space.location}</h3>
          {isOwner && <span className="owner-badge">我的</span>}
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

          <div className="info-row">
            <span className="label">持有者:</span>
            <span className="value monospace">
              {space.owner.slice(0, 8)}...{space.owner.slice(-6)}
            </span>
          </div>

          {space.price > 0 && (
            <div className="info-row sale-info">
              <span className="label">售價:</span>
              <span className="value price">{formatIOTA(space.price)} IOTA</span>
            </div>
          )}
        </div>

        <div className="card-actions">
          {!isOwner && (
            <button
              className="btn-primary"
              onClick={() => setShowPayment(true)}
            >
              立即租用
            </button>
          )}
          {!isOwner && space.price > 0 && (
            <button
              className="btn-secondary"
              onClick={() => setShowPurchase(true)}
            >
              購買車位
            </button>
          )}
          {isOwner && setActiveTab && (
            <button className="btn-secondary" onClick={() => setActiveTab("myspaces")}>
              管理車位
            </button>
          )}
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          space={space}
          onClose={() => setShowPayment(false)}
        />
      )}

      {showPurchase && (
        <PurchaseModal
          space={space}
          onClose={() => setShowPurchase(false)}
          onSuccess={onPurchaseSuccess}
        />
      )}
    </>
  );
}