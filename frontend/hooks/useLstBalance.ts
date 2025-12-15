"use client";
import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

const MINT = new PublicKey(process.env.NEXT_PUBLIC_MINT!);

export function useLstBalance() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!publicKey) return;

    let cancelled = false;

    const fetch = async () => {
      const accounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { mint: MINT }
      );

      const uiAmount =
        accounts.value[0]?.account.data.parsed.info.tokenAmount.uiAmount ?? 0;

      if (!cancelled) {
        setBalance(uiAmount);
      }
    };

    fetch();

    return () => {
      cancelled = true;
    };
  }, [publicKey, connection]);

  return publicKey ? balance : 0;
}
