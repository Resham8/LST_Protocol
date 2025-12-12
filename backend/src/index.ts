import express from "express";
import { mintTokens, burnTokens, sendNativeTokens } from "./mintTokens.js";

const app = express();
app.use(express.json());

const VAULT = process.env.VAULT;
const ATA_TOKEN_AC = process.env.ASS_TOKEN_AC;

interface NativeTransfer {
  fromUserAccount: string;
  toUserAccount: string;
  amount: number;
}

interface TokenTransfer {
  fromUserAccount: string;
  toUserAccount: string;
  toTokenAccount: string;
  tokenAmount: number;
}

app.post("/helius", async (req, res) => {
  const body = req.body;

  const nativeTransfers: NativeTransfer[] = body.nativeTransfers || [];
  const tokenTransfers: TokenTransfer[] = body.tokenTransfers || [];

  const incomingSol = nativeTransfers.find(
    (t: NativeTransfer) => t.toUserAccount === VAULT
  );

  const incomingToken = tokenTransfers.find(
    (t: TokenTransfer) => t.toUserAccount === VAULT && t.toTokenAccount === ATA_TOKEN_AC
  );

  try {
    if (incomingSol) {
      await mintTokens(incomingSol.fromUserAccount, incomingSol.amount);
      return res.json({ message: "Minted tokens" });
    }

    if (incomingToken) {
      await burnTokens(
        incomingToken.toTokenAccount,
        incomingToken.tokenAmount * 1_000_000_000
      );

      await sendNativeTokens(
        incomingToken.fromUserAccount,
        incomingToken.tokenAmount
      );

      return res.json({ message: "Redeemed tokens" });
    }

    return res.json({ message: "processed" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "internal error" });
  }
});

app.listen(3000, () => console.log("server running on 3000"));
