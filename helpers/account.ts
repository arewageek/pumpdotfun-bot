import { Keypair, PublicKey } from "@solana/web3.js";
import prisma from "../lib/prisma";
import { jwtDecrypt, jwtEncrypt } from "../utils/jwt";
import { base58_to_binary, binary_to_base58 } from "base58-js";

export interface IWallet {
  private: Uint8Array;
  public: PublicKey;
}

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

export async function retrieveWallet(
  chatId: number
): Promise<{ success: boolean; message?: string; data?: IWallet }> {
  try {
    const user = await prisma.user.findUnique({
      where: { chatId: chatId.toString() },
    });
    let walletAddress;

    if (!user) {
      const create = await createWallet(chatId);
      walletAddress = create.data?.private;
    } else {
      walletAddress = await jwtDecrypt(user.wallet.valueOf());
    }

    const key = Keypair.fromSecretKey(
      base58_to_binary(walletAddress as string)
    );

    console.log({ keypair: Keypair.generate() });
    const publicKey = key.publicKey;

    // console.log({ walletFromRetrieverCode: publicKey });

    return {
      success: true,
      data: { public: publicKey, private: key.secretKey },
    };
  } catch (error: any) {
    console.error("Error retrieving wallet: ", error);
    return {
      success: false,
      message: error.message || "Failed to retrieve wallet.",
    };
  }
}
