"use client";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Card } from "./ui/card";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export default function StakingCard() {
  const { connection } = useConnection();
  const [mode, setMode] = useState<"stake" | "unstake">("stake");
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const { publicKey, connected } = useWallet();

  useEffect(() => {
    if (!connected || !publicKey) return;

    const fetchBalance = async () => {
      const blc = await connection.getBalance(publicKey);
      setBalance(blc / LAMPORTS_PER_SOL);
    };

    fetchBalance();
  }, [connected, publicKey, connection]);

  return (
    <Card className="w-full max-w-md bg-card/60 backdrop-blur-xl border-border/50 shadow-2xl">
      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <svg
                viewBox="0 0 397.7 311.7"
                className="size-5 fill-primary"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1z" />
                <path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1z" />
                <path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Liquid Stake
              </h1>
              <p className="text-sm text-muted-foreground">
                Earn rewards on SOL
              </p>
            </div>
          </div>

          <WalletMultiButton />
        </div>
        <div className="flex gap-2 p-1 bg-secondary/40 rounded-lg border border-border/30">
          <button
            onClick={() => setMode("stake")}
            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
              mode === "stake"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Stake
          </button>
          <button
            onClick={() => setMode("unstake")}
            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
              mode === "unstake"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Unstake
          </button>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Amount</label>
          <div className="relative">
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-16 text-2xl font-medium bg-secondary/30 border-border/40 placeholder:text-muted-foreground/40 disabled:opacity-50 disabled:cursor-not-allowed pr-16"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
              SOL
            </div>
          </div>
          {connected && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Available: {balance} SOL</span>
              <button
                className="text-primary hover:text-primary/80 font-medium"
                onClick={() => {
                  setAmount(balance.toString());
                }}
              >
                Max
              </button>
            </div>
          )}
        </div>
{/* 
        <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border/30">
          <span className="text-sm text-muted-foreground">Current APY</span>
          <span className="text-lg font-semibold text-primary">7.2%</span>
        </div> */}

        <Button
          // onClick={}/
          disabled={!connected || !amount || Number.parseFloat(amount) <= 0}
          className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
        >
          {!connected
            ? "Connect Wallet"
            : mode === "stake"
            ? "Stake SOL"
            : "Unstake SOL"}
        </Button>
      </div>
    </Card>
  );
}
