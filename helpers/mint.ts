import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { AnchorProvider } from "@coral-xyz/anchor";
import { base58_to_binary } from "base58-js";
import { PumpFunSDK, type CreateTokenMetadata } from "pumpdotfun-sdk";

import fs from "fs";
import path from "path";

const KEYS_FOLDER = __dirname + "/.keys";
const SLIPPAGE_BASIS_POINTS = 100n;

const getProvider = () => {
  if (!process.env.HELIUS_RPC_URL) {
    throw new Error("Please set HELIUS_RPC_URL in .env file");
  }

  const connection = new Connection(process.env.HELIUS_RPC_URL || "");
  const wallet = new NodeWallet(new Keypair());
  return new AnchorProvider(connection, wallet, { commitment: "finalized" });
};

const initialize = () => {
  const provider = getProvider();
  const sdk: PumpFunSDK = new PumpFunSDK(provider);
  const connection = provider.connection;

  return { provider, sdk, connection };
};

export const createAndBuyToken = async () => {
  const imagePath = path.resolve(__dirname, "../eye.jpg");
  const imageBuffer = fs.readFileSync(imagePath);
  const file: File = new File([imageBuffer], "tokenIage.jpg", {
    type: "image/jpeg",
  });

  const tokenMetadata: CreateTokenMetadata = {
    name: "Hopium",
    symbol: "PIUM",
    description: "Blood. Sweat. Tears",
    file,
  };

  const token = new Keypair();

  const secret = process.env.SECRET!;
  const secretUint = base58_to_binary(secret);
  const creator = Keypair.fromSecretKey(secretUint);

  const { sdk } = initialize();

  const createResults = await sdk.createAndBuy(
    creator,
    token,
    tokenMetadata,
    BigInt(0.0001 * LAMPORTS_PER_SOL),
    SLIPPAGE_BASIS_POINTS,
    {
      unitLimit: 250000,
      unitPrice: 250000,
    }
  );

  if (createResults.success) {
    console.log("Success:", `https://pump.fun/${token.publicKey.toBase58()}`);
    // printSPLBalance(sdk.connection, mint.publicKey, testAccount.publicKey);
  } else {
    console.log("Create and Buy failed");
  }
};
