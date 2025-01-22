import { AnchorProvider } from "@coral-xyz/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  PumpFunSDK,
  type CreateTokenMetadata,
  type TokenMetadata,
} from "pumpdotfun-sdk";
import fs from "fs";
import path from "path";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";

export interface IMetadata {
  name: string;
  symbol: string;
  supply: number;
}

export interface IResponse {
  success: boolean;
  message?: string;
}

interface IRes extends IResponse {
  data: any;
}

// Default keypair path
const DEFAULT_KEYPAIR_PATH = path.resolve("./keypair.json");

// Helper: Get or create a keypair
export const getOrCreateKeypair = (
  keypairPath = DEFAULT_KEYPAIR_PATH
): Keypair => {
  if (fs.existsSync(keypairPath)) {
    const secretKey = JSON.parse(fs.readFileSync(keypairPath, "utf-8"));
    return Keypair.fromSecretKey(new Uint8Array(secretKey));
  }

  const keypair = Keypair.generate();
  fs.writeFileSync(keypairPath, JSON.stringify(Array.from(keypair.secretKey)));
  console.log(`Keypair created and saved to ${keypairPath}`);
  return keypair;
};

// Helper: Get the provider
export const getProvider = () => {
  if (!process.env.HELIUS_RPC_URL) {
    throw new Error("Please set HELIUS_RPC_URL in your .env file");
  }

  const connection = new Connection(process.env.HELIUS_RPC_URL);
  const wallet = new NodeWallet(getOrCreateKeypair());

  return new AnchorProvider(connection, wallet, { commitment: "finalized" });
};

export const getSPLBalance = async (
  connection: Connection,
  walletAddress: PublicKey,
  tokenMintAddress: PublicKey
): Promise<number> => {
  const tokenAccountAddress = await getAssociatedTokenAddress(
    tokenMintAddress,
    walletAddress
  );
  const tokenAccount = await getAccount(connection, tokenAccountAddress);
  return Number(tokenAccount.amount);
};

/**
 * Print the SPL token balance of a given wallet.
 * @param {Connection} connection The Solana connection object.
 * @param {PublicKey} walletAddress The wallet's public key.
 * @param {PublicKey} tokenMintAddress The token mint address.
 */
export const printSPLBalance = async (
  connection: Connection,
  walletAddress: PublicKey,
  tokenMintAddress: PublicKey
) => {
  const balance = await getSPLBalance(
    connection,
    walletAddress,
    tokenMintAddress
  );
  console.log(`Token Balance: ${balance}`);
};

// Helper: Print SOL balance
export const printSOLBalance = async (
  connection: Connection,
  walletAddress: PublicKey
) => {
  const balance = await connection.getBalance(walletAddress);
  console.log(`SOL Balance: ${(balance / LAMPORTS_PER_SOL).toFixed(2)} SOL`);
};

// Function: Create a token
export const createToken = async (): Promise<IResponse> => {
  try {
    console.log("\n\n\n\n\n\n\n\n\n Creating new token \n\n\n\n\n\n");

    const creator = Keypair.generate();
    const mint = Keypair.generate();

    const meta = {
      name: "Arewa",
      symbol: "ARW",
      description: "",
      file: "../keypair.json",
    };

    const metaBuffer = Buffer.from("../meow.jpeg", "utf-8");
    const fileBlob = new Blob([metaBuffer], { type: "application/json" });

    const tokenMetadata: CreateTokenMetadata = {
      name: meta.name,
      symbol: meta.symbol,
      description: `Token: ${meta.name}`,
      twitter: "",
      file: fileBlob,
    };

    const supply = 1000;

    const sdk = new PumpFunSDK();

    const create = await sdk.createAndBuy(
      creator,
      mint,
      tokenMetadata,
      BigInt(0.0001 * LAMPORTS_PER_SOL),
      BigInt(supply),
      {
        unitLimit: 250000,
        unitPrice: 250000,
      }
    );

    if (create.success) {
      console.log("Success:", `https://pump.fun/${mint.publicKey.toBase58()}`);
      await printSPLBalance(sdk.connection, mint.publicKey, creator.publicKey);
      return { success: true, message: "Token created successfully" };
    }

    return { success: false, message: "Create and Buy failed" };
  } catch (error: any) {
    console.error("Error in token creation:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};
