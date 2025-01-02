import { Link } from "react-router-dom";
import React from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { Connection } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";

const Navbar = () => {
  const endpoint =
    "https://devnet.helius-rpc.com/?api-key=f84a6f24-1feb-4290-bc2f-4fc95cf5e7f0";
  const wallets = [new PhantomWalletAdapter()];

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-500">
                OrbitLenAI
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md"
            >
              Home
            </Link>
            <Link
              to="/questionnaire"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md"
            >
              Questionnaire
            </Link>
            <Link
              to="/ai-agent"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md"
            >
              AI Agent
            </Link>
            <Link
              to="/portfolio"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md"
            >
              Portfolio
            </Link>
            <ConnectionProvider endpoint={endpoint}>
              <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                  <WalletMultiButton />
                </WalletModalProvider>
              </WalletProvider>
            </ConnectionProvider>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default React.memo(Navbar);
