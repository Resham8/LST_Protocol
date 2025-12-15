"use client";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Card } from "./ui/card";
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useSolBalance } from "@/hooks/useSolBalance";
import { useLstBalance } from "@/hooks/useLstBalance";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

const VAULT_PUBKEY = new PublicKey(process.env.NEXT_PUBLIC_VAULT!);
const MINT = new PublicKey(process.env.NEXT_PUBLIC_MINT!);
const VAULT_ATA = new PublicKey(process.env.NEXT_PUBLIC_VAULT_ATA!);
const DECIMALS = 10 ** 6;

export default function StakingCard() {
  const [mode, setMode] = useState<"stake" | "unstake">("stake");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { publicKey, connected, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const solBalance = useSolBalance();
  const lstBalance = useLstBalance();

  const stakeSol = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!publicKey) {
        alert("Wallet not connected");
      }

      const amountInLamports = Number(amount) * LAMPORTS_PER_SOL;
      
      if (isNaN(amountInLamports) || amountInLamports <= 0) {
        console.log("Please enter a valid amount");
      }
      
      const MIN_RENT = 0.001 * LAMPORTS_PER_SOL;
      if (amountInLamports + MIN_RENT > solBalance * LAMPORTS_PER_SOL) {
        console.log("Insufficient balance (including transaction fees)");
      }

      console.log("Creating stake transaction...");

      // Get latest blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

      const tx = new Transaction({
        feePayer: publicKey,
        blockhash,
        lastValidBlockHeight,
      }).add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: VAULT_PUBKEY,
          lamports: amountInLamports,
        })
      );

      console.log("Sending transaction...");
      const sig = await sendTransaction(tx, connection);
      console.log("Transaction sent:", sig);

      console.log("Waiting for confirmation...");
      await connection.confirmTransaction({
        signature: sig,
        blockhash,
        lastValidBlockHeight,
      });

      console.log("Stake confirmed:", sig);
      setSuccess(`Successfully staked ${amount} SOL! Tx: ${sig.slice(0, 8)}...`);
      setAmount("");
    } catch (error: any) {
      console.error("Stake error:", error);
      
      if (error?.message?.includes("User rejected")) {
        setError("Transaction was rejected");
      } else if (error?.message?.includes("insufficient")) {
        setError("Insufficient balance for this transaction");
      } else {
        setError(error?.message || "Staking failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const unstake = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!publicKey) {
        console.log("Wallet not connected");
      }

      const amountInTokens = Number(amount) * DECIMALS;
      
      // Validate amount
      if (isNaN(amountInTokens) || amountInTokens <= 0) {
        console.log("Please enter a valid amount");
      }
      
      if (amountInTokens > lstBalance * DECIMALS) {
        console.log("Insufficient stSOL balance");
      }

      console.log("Creating unstake transaction...");

      const userAta = await getAssociatedTokenAddress(MINT, publicKey);

      // Get latest blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

      const tx = new Transaction({
        feePayer: publicKey,
        blockhash,
        lastValidBlockHeight,
      }).add(
        createTransferInstruction(
          userAta,
          VAULT_ATA,
          publicKey,
          amountInTokens
        )
      );

      console.log("Sending transaction...");
      const sig = await sendTransaction(tx, connection);
      console.log("Transaction sent:", sig);

      // Wait for confirmation
      console.log("Waiting for confirmation...");
      await connection.confirmTransaction({
        signature: sig,
        blockhash,
        lastValidBlockHeight,
      });
      
      console.log("Unstake confirmed:", sig);
      setSuccess(`Successfully unstaked ${amount} stSOL! Tx: ${sig.slice(0, 8)}...`);
      setAmount("");
    } catch (error: any) {
      console.error("Unstake error:", error);
      
      if (error?.message?.includes("User rejected")) {
        setError("Transaction was rejected");
      } else if (error?.message?.includes("insufficient")) {
        setError("Insufficient balance for this transaction");
      } else if (error?.message?.includes("could not find account")) {
        setError("Token account not found. You may need to initialize it first.");
      } else {
        setError(error?.message || "Unstaking failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const currentBalance = mode === "unstake" ? lstBalance : solBalance;
  const currentToken = mode === "unstake" ? "stSOL" : "SOL";

  const handleSubmit = async () => {
    if (!connected || !amount || Number.parseFloat(amount) <= 0 || isLoading) {
      return;
    }
    
    if (mode === "unstake") {
      await unstake();
    } else {
      await stakeSol();
    }
  };

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
        
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-600">
            {success}
          </div>
        )}

        <div className="flex gap-2 p-1 bg-secondary/40 rounded-lg border border-border/30">
          <button
            onClick={() => {
              setMode("stake");
              setAmount("");
              setError(null);
              setSuccess(null);
            }}
            disabled={isLoading}
            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all disabled:opacity-50 ${
              mode === "stake"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Stake
          </button>
          <button
            onClick={() => {
              setMode("unstake");
              setAmount("");
              setError(null);
              setSuccess(null);
            }}
            disabled={isLoading}
            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all disabled:opacity-50 ${
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
              disabled={isLoading}
              className="h-16 text-2xl font-medium bg-secondary/30 border-border/40 placeholder:text-muted-foreground/40 disabled:opacity-50 disabled:cursor-not-allowed pr-16"
              step="0.000001"
              min="0"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
              {currentToken}
            </div>
          </div>
          {connected && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Available: {currentBalance.toFixed(6)} {currentToken}</span>
              <button
                className="text-primary hover:text-primary/80 font-medium disabled:opacity-50"
                disabled={isLoading}
                onClick={() => {                  
                  const maxAmount = mode === "stake" 
                    ? Math.max(0, currentBalance - 0.001)
                    : currentBalance;
                  setAmount(maxAmount.toFixed(6));
                }}
              >
                Max
              </button>
            </div>
          )}
        </div>

        {connected && (
          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border/30">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">L</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Your staked balance
              </span>
            </div>
            <div className="text-right">
              <div className="text-base font-semibold text-foreground">
                {lstBalance.toFixed(6)} stSOL
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!connected || !amount || Number.parseFloat(amount) <= 0 || isLoading}
          className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
        >
          {isLoading 
            ? "Processing..." 
            : !connected
            ? "Connect Wallet"
            : mode === "stake"
            ? "Stake SOL"
            : "Unstake SOL"}
        </Button>
      </div>
    </Card>
  );
}