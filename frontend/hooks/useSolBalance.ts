"use client";
import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export function useSolBalance() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!connected || !publicKey) return;

    let cancelled = false;

    const fetch = async () => {
      const lamports = await connection.getBalance(publicKey);
      if (!cancelled) {
        setBalance(lamports / LAMPORTS_PER_SOL);
      }
    };

    fetch();

    return () => {
      cancelled = true;
    };
  }, [connected, publicKey, connection]);

  return connected && publicKey ? balance : 0;
}
