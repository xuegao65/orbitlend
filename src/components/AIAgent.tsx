import { useState, useEffect } from "react";
import { PublicKey, Connection } from "@solana/web3.js";
import { Market } from "@project-serum/serum";

const WitAIUrl = "https://api.wit.ai/message?v=20241224&q=";
const witAIAuth = "Bearer " + import.meta.env.VITE_WIT_AI_TOKEN;

// Define interfaces
interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface TransferEntities {
  to_addr?: string;
  amount?: string;
  transfer_token?: string;
}

interface BalanceEntities {
  balance_token?: string;
}

interface Entity {
  value: string;
}

interface WitAIEntity {
  body: string;
  confidence: number;
  value: string;
  // ... other fields if needed
}

interface WitAIResponse {
  entities: {
    [key: string]: WitAIEntity[];
  };
  intents: Array<{
    confidence: number;
    name: string;
  }>;
  text: string;
  traits: {
    [key: string]: Array<{
      confidence: number;
      value: string;
    }>;
  };
}

// Serum market addresses for RAY/USDC and WIF/USDC pairs
const RAY_USDC_MARKET = new PublicKey(
  "2xiv8A5xrJ7RnGdxXB42uFEkYHJjszEhaJyKKt4WaLep"
); // RAY/USDC market
const WIF_USDC_MARKET = new PublicKey(
  "8PhnCfgqpgFM7ZJvttGdBVMXHuU4Q23ACxCvWkbs1M71"
); // WIF/USDC market

const AIAgent = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your DeFi investment assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [market, setMarket] = useState<Market | null>(null);
  const [connection, setConnection] = useState<Connection | null>(null);

  useEffect(() => {
    const initializeMarket = async () => {
      try {
        const conn = new Connection(import.meta.env.VITE_RPC as string);
        setConnection(conn);

        // Initialize Serum market for RAY/USDC
        const market = await Market.load(
          conn,
          RAY_USDC_MARKET,
          {},
          "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin" // Serum DEX program ID
        );
        setMarket(market);
      } catch (error) {
        console.error("Error initializing market:", error);
      }
    };

    initializeMarket();
  }, []);

  const handleTransfer = async (
    to: string,
    amount: number,
    tokenMint: PublicKey
  ) => {
    try {
      if (!market || !connection) throw new Error("Market not initialized");

      // Implement transfer logic using @project-serum/serum
      // This is a placeholder - implement according to your needs
      return "Transfer functionality to be implemented";
    } catch (error) {
      console.error("Transfer error:", error);
      throw error;
    }
  };

  const getBalance = async (tokenAccount: PublicKey) => {
    try {
      if (!connection) throw new Error("Connection not initialized");

      const balance = await connection.getTokenAccountBalance(tokenAccount);
      return balance.value.uiAmount;
    } catch (error) {
      console.error("Balance check error:", error);
      throw error;
    }
  };

  const extractEntityValue = (
    witResponse: WitAIResponse,
    entityKey: string
  ): string | undefined => {
    const fullKey = `${entityKey}:${entityKey}`;
    return witResponse.entities[fullKey]?.[0]?.value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      let assistantMessage: Message = {
        role: "assistant",
        timestamp: new Date(),
        content: "",
      };

      // Check if it's a simple token response
      const simpleToken = input.trim().toLowerCase();
      if (simpleToken === "ray" || simpleToken === "wif") {
        try {
          let balance;
          if (simpleToken === "ray") {
            balance = await getBalance(userARay);
          } else if (simpleToken === "wif") {
            balance = await getBalance(userAWIF);
          }
          assistantMessage.content = `Your ${simpleToken.toUpperCase()} balance is: ${balance}`;
          setMessages((prev) => [...prev, assistantMessage]);
          return;
        } catch (error) {
          assistantMessage.content = `Sorry, I couldn't fetch your ${simpleToken.toUpperCase()} balance at the moment.`;
          setMessages((prev) => [...prev, assistantMessage]);
          return;
        }
      }

      // wit AI parse for other requests
      let witAIRes = await fetch(WitAIUrl + input.trim(), {
        headers: { Authorization: witAIAuth },
      });
      const witAIData: WitAIResponse = await witAIRes.json();
      console.log("Full Wit.AI Response:", JSON.stringify(witAIData, null, 2));

      if (!witAIData.intents || witAIData.intents.length === 0) {
        console.log("No intents found in response");
        assistantMessage.content =
          "I'm sorry, I couldn't understand your request. Please try rephrasing it.";
        setMessages((prev) => [...prev, assistantMessage]);
        return;
      }

      const intentName = witAIData.intents[0].name;

      if (intentName === "transfer") {
        const amount = extractEntityValue(witAIData, "amount");
        const token = extractEntityValue(witAIData, "transfer_token");
        const toAddr = extractEntityValue(witAIData, "to_addr");

        assistantMessage.content = `I'll help you transfer ${amount || ""} ${
          token || ""
        } to ${toAddr || ""}. (Implementation pending)`;
      } else if (intentName === "balance") {
        const token =
          extractEntityValue(witAIData, "transfer_token") ||
          extractEntityValue(witAIData, "balance_token");

        if (token) {
          try {
            let balance;
            if (token.toLowerCase() === "ray") {
              balance = await getBalance(userARay);
            } else if (token.toLowerCase() === "wif") {
              balance = await getBalance(userAWIF);
            }
            assistantMessage.content = `Your ${token.toUpperCase()} balance is: ${balance}`;
          } catch (error) {
            assistantMessage.content = `Sorry, I couldn't fetch your ${token.toUpperCase()} balance at the moment.`;
          }
        } else {
          assistantMessage.content =
            "Which token's balance would you like to check? (RAY or WIF)";
        }
      } else {
        assistantMessage.content =
          "I'm sorry, I don't know how to handle that request yet.";
      }

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Rest of your component (UI render) remains the same
  return (
    <div className="h-[calc(100vh-64px)] bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold text-blue-500">
            Orbitlen AI Assistant
          </h1>
        </div>
      </div>

      {/* Messages Container */}
      <div
        className="flex-1 overflow-y-auto p-4"
        style={{ height: "calc(100% - 130px)" }}
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-200"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
                    <span className="text-sm font-medium text-blue-400">
                      AI Assistant
                    </span>
                  </div>
                )}
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-50 mt-2 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-100"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-800 p-4 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about DeFi investment strategies..."
              className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center
                ${
                  isLoading || !input.trim()
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-700"
                }`}
            >
              <span>Send</span>
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIAgent;
