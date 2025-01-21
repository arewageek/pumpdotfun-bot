import { Keypair, PublicKey } from "@solana/web3.js";
import prisma from "../lib/prisma";
import { jwtDecrypt, jwtEncrypt } from "../utils/jwt";
import { base58_to_binary, binary_to_base58 } from "base58-js";

export interface IWallet {
  private: Uint8Array;
  public: PublicKey;
}

/**
 * Create a new wallet and store it securely.
 * @param {number} chatId - The user's chat ID.
 * @returns {Promise<{ success: boolean; message?: string; data?: { public: PublicKey; private: Uint8Array } }>}
 */
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

    // const tokenizedWallet = await jwtEncrypt(wallet.private);

    // await prisma.user.update({
    //   where: { chatId },
    //   data: {
    //     wallet:
    //       "eyJhbGciOiJIUzI1NiJ9.M29wVlp1QUxwTmZhZ1p3ZWFWVkJONXVhY0pFWm5ZOUdZZjNLYnljTTNDZWJFQUxRZlh6QTV3VXNMcTgza0UzMWpYaXNFZUpDdjJvQVlwSzFnYVRBZUFvRQ.6qyrgopaZ3QIb8N7Im5nIz7tfU1aL3jJ4B14aYky_bo",
    //   },
    // });

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
    const user = await prisma.user.findUnique({ where: { chatId } });
    let wallet;

    if (!user) {
      const create = await createWallet(chatId);
      wallet = create.data;
    } else {
      wallet = JSON.parse(await jwtDecrypt(user.wallet));
    }

    console.log({ wallet: await wallet });

    return { success: true, data: await wallet };
  } catch (error: any) {
    console.error("Error retrieving wallet:", error);
    return {
      success: false,
      message: error.message || "Failed to retrieve wallet.",
    };
  }
}
