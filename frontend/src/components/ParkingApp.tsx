import { useState } from "react";
import { useCurrentAccount } from "@iota/dapp-kit";
import WalletConnect from "./WalletConnect";
import ParkingSpaceList from "./ParkingSpaceList";
import MySpaces from "./MySpaces";
import MintSpaceForm from "./MintSpaceForm";
import SecondaryMarketplace from "./SecondaryMarketplace";
import "./ParkingApp.css";

export default function ParkingApp() {
  const currentAccount = useCurrentAccount();
  const [activeTab, setActiveTab] = useState<"browse" | "market" | "myspaces" | "mint">("market");

  if (!currentAccount) {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1>🅿️ Parking RWA on IOTA</h1>
          <p>停車格資產化平台</p>
        </header>
        <div className="connect-prompt">
          <h2>歡迎使用停車格 RWA 平台</h2>
          <p>請先連接您的 IOTA 錢包以開始使用</p>
          <WalletConnect />
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1>🅿️ Parking RWA on IOTA</h1>
        </div>
        <WalletConnect />
      </header>

      <nav className="tab-nav">
        <button
          className={`tab-button ${activeTab === "market" ? "active" : ""}`}
          onClick={() => setActiveTab("market")}
        >
          二級市場
        </button>
        <button
          className={`tab-button ${activeTab === "browse" ? "active" : ""}`}
          onClick={() => setActiveTab("browse")}
        >
          所有停車格
        </button>
        <button
          className={`tab-button ${activeTab === "myspaces" ? "active" : ""}`}
          onClick={() => setActiveTab("myspaces")}
        >
          我的停車格
        </button>
        <button
          className={`tab-button ${activeTab === "mint" ? "active" : ""}`}
          onClick={() => setActiveTab("mint")}
        >
          鑄造停車格
        </button>
      </nav>

      <main className="app-main">
        {activeTab === "browse" && <ParkingSpaceList setActiveTab={setActiveTab} />}
        {activeTab === "market" && <SecondaryMarketplace setActiveTab={setActiveTab} />}
        {activeTab === "myspaces" && <MySpaces setActiveTab={setActiveTab} />}
        {activeTab === "mint" && <MintSpaceForm setActiveTab={setActiveTab} />}
      </main>
    </div>
  );
}
