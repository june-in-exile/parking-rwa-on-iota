import { IotaClientProvider, WalletProvider } from "@iota/dapp-kit";
import { getFullnodeUrl } from "@iota/iota-sdk/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ParkingApp from "./components/ParkingApp";
import "@iota/dapp-kit/dist/index.css";

const queryClient = new QueryClient();
const network = (import.meta.env.VITE_IOTA_NETWORK as "testnet" | "mainnet" | "devnet") || "testnet";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <IotaClientProvider networks={{ [network]: { url: getFullnodeUrl(network) } }} defaultNetwork={network}>
        <WalletProvider autoConnect>
          <ParkingApp />
        </WalletProvider>
      </IotaClientProvider>
    </QueryClientProvider>
  );
}

export default App;
