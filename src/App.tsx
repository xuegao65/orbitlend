import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mainnet, sepolia } from "wagmi/chains";
import "@rainbow-me/rainbowkit/styles.css";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Questionnaire from "./components/Questionnaire";
import AIAgent from "./components/AIAgent";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const config = getDefaultConfig({
  appName: "Orbitlen",
  projectId: "f89e6c05b91178e0923e480bde16555b",
  chains: [mainnet, sepolia],
  ssr: true,
});

const endpoint =
  "https://devnet.helius-rpc.com/?api-key=f84a6f24-1feb-4290-bc2f-4fc95cf5e7f0";
const wallets = [new PhantomWalletAdapter()];

function App() {
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
              <RainbowKitProvider modalSize="compact">
                <div className="min-h-screen bg-gray-900">
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/questionnaire" element={<Questionnaire />} />
                    <Route path="/ai-agent" element={<AIAgent />} />
                    <Route path="/portfolio" element={<Home />} />
                  </Routes>
                </div>
              </RainbowKitProvider>
            </QueryClientProvider>
          </WagmiProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
