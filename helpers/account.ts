import { Keypair, PublicKey } from "@solana/web3.js";
import prisma from "../lib/prisma";
import { jwtDecrypt, jwtEncrypt } from "../utils/jwt";

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
  data?: { public: PublicKey; private: Uint8Array };
}> {
  try {
    const key = Keypair.generate();
    const wallet: IWallet = { public: key.publicKey, private: key.secretKey };

    const tokenizedWallet = await jwtEncrypt(wallet);

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

/**
 * Import an existing wallet using a key phrase (currently not implemented).
 * @param {string} keyPhrase - The key phrase of the wallet.
 */
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

/**
 * Retrieve a wallet associated with a user's chat ID.
 * @param {number} chatId - The user's chat ID.
 * @returns {Promise<{ success: boolean; message?: string; data?: IWallet }>}
 */
export async function retrieveWallet(
  chatId: number
): Promise<{ success: boolean; message?: string; data?: IWallet }> {
  try {
    const user = await prisma.user.findUnique({
      where: { chatId: chatId.toString() },
    });
    let wallet;

    if (!user) {
      wallet = createWallet(chatId);
      console.log("\n\n\n\n\nCreating new wallet\n\n\n\n\n");
    } else {
      wallet = JSON.parse(await jwtDecrypt(user.wallet));
      console.log("\n\n\n\n\nUsing an existing wallet\n\n\n\n\n");
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
