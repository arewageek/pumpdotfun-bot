import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import prisma from "../lib/prisma";
import { jwtDecrypt, jwtEncrypt } from "../utils/jwt";
import { base58_to_binary, binary_to_base58 } from "base58-js";
import type { IWallet } from "../interface";

export async function createWallet(chatId: number): Promise<{
  success: boolean;
  message?: string;
  data?: { public: string; private: string };
}> {
  try {
    const key = Keypair.generate();

    const wallet = {
      public: key.publicKey.toBase58(),
      private: binary_to_base58(key.secretKey),
    };

    const tokenizedWallet = await jwtEncrypt(wallet.private);
    console.log({ tokenizedWallet });

    await prisma.user.create({
      data: {
        chatId: chatId.toString(),
        wallet: tokenizedWallet,
      },
    });

    return { success: true, data: wallet };
  } catch (error: any) {
    console.error("Error creating wallet:", error);
    return {
      success: false,
      message: error.message || "Failed to create wallet.",
    };
  }
}

export async function importWallet(keyPhrase: string): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    // Implement wallet import logic here
    throw new Error("Wallet import functionality is not implemented yet.");
  } catch (error: any) {
    console.error("Error importing wallet:", error);
    return {
      success: false,
      message: error.message || "Failed to import wallet.",
    };
  }
}

export async function retrieveWallet(chatId: number): Promise<{
  success: boolean;
  message?: string;
  data?: IWallet & { balance?: number };
  isNewWallet?: boolean;
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { chatId: chatId.toString() },
    });

    let walletToken;
    let isNewWallet = false;

    if (!user || user.wallet == "") {
      const create = await createWallet(chatId);
      walletToken = create.data?.private;
      isNewWallet = true;
    } else {
      // await prisma.user.deleteMany({});
      console.log({ user });
      walletToken = (await jwtDecrypt(user.wallet)).valueOf();
    }

    const key = Keypair.fromSecretKey(base58_to_binary(walletToken as string));
    const publicKey = key.publicKey.toBase58();

    console.log({ publicKey, secret: walletToken });

    // Fetch the wallet balance using the public key
    const balance = await getWalletBalance(publicKey);

    const response = {
      success: true,
      data: {
        public: publicKey,
        token: walletToken as string,
        balance: balance, // Include the balance in the response
      },
      isNewWallet: isNewWallet,
    };

    return response;
  } catch (error: any) {
    console.error("Error retrieving wallet: ", error);
    return {
      success: false,
      message: error.message || "Failed to retrieve wallet.",
    };
  }
}

export async function getWalletBalance(publicKey: string): Promise<number> {
  try {
    const connection = new Connection("https://api.mainnet-beta.solana.com"); // Update with your RPC endpoint

    const balance = await connection.getBalance(new PublicKey(publicKey));
    return balance / 1e9; // Convert from lamports (if using Solana) to SOL
  } catch (error) {
    console.error("Error fetching wallet balance: ", error);
    throw new Error("Unable to fetch wallet balance.");
  }
}
