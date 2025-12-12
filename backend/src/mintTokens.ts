import {
  createBurnInstruction,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
} from "@solana/spl-token";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import dotenv from "dotenv";
dotenv.config();

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const raw = String(process.env.PRIVATE_KEY);
const privateKey = new Uint8Array(bs58.decode(raw));

const keypair = Keypair.fromSecretKey(privateKey);
const tokenMint = new PublicKey(process.env.MINT!);
const tokenAssMint = new PublicKey(process.env.ASS_TOKEN_AC!);

const DECIMALS = 10 ** 6;


export const mintTokens = async (fromAddress: string, amount: number) => {
  try {
    // const amt = amount * 10 ** 6;
    const recepientPubKey = new PublicKey(fromAddress);

    const recepientAta = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      tokenMint,
      recepientPubKey
    );

    await mintTo(
      connection,
      keypair,
      tokenMint,
      recepientAta.address,
      keypair,
      amount
    );
    console.log(`Minted ${amount} token`);
    console.log("Mint:", tokenMint.toBase58());
    console.log("Recipient:", recepientPubKey.toBase58());
    console.log("Recipient ATA:", recepientAta.address.toBase58());
  } catch (error) {
    console.log(error);
  }
};

const lamportsToToken = (lamports: number) => {
  return lamports / 1_000_000_000;
};


export const burnTokens = async (
  toTokenAccount: string,   
  lamports: number          
) => {
  try {
    const tokenAmount = lamportsToToken(lamports) * DECIMALS;

    const tx = new Transaction().add(
      createBurnInstruction(
        new PublicKey(toTokenAccount),
        tokenMint,
        keypair.publicKey,
        tokenAmount
      )
    );

    const sig = await sendAndConfirmTransaction(connection, tx, [keypair]);

    console.log(`Burned ${tokenAmount} tokens from ATA ${toTokenAccount}`);
    console.log(`Signature: ${sig}`);

  } catch (error) {
    console.log("burnTokens error:", error);
  }
};


// when the user sends the native sols back

export const sendNativeTokens = async (fromAddress: string, amount: number) => {
  try {
    const tx = new Transaction();

    tx.add(
      SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: new PublicKey(fromAddress),
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    const sig = await sendAndConfirmTransaction(connection, tx, [keypair]);
    if (sig) {
      console.log(`signature from send back sol: ${sig}`);
    }
  } catch (error) {
    console.log("from send native tokens: ", error);
  }
};
