import { ConnectButton, useCurrentAccount } from "@iota/dapp-kit";
import "./WalletConnect.css";

export default function WalletConnect() {
  const currentAccount = useCurrentAccount();

  return (
    <div className="wallet-connect">
      <ConnectButton />
      {currentAccount && (
        <div className="account-info">
          <span className="account-label">已連接:</span>
          <span className="account-address">
            {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
          </span>
        </div>
      )}
    </div>
  );
}
