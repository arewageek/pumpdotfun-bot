import fs from "fs";
import path from "path";

import Fun, { type TokenMeta } from "pfsdk";
import {
  Connection,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
} from "@solana/web3.js";
import prisma from "../lib/prisma";
import { jwtDecrypt } from "../utils/jwt";
import { base58_to_binary } from "base58-js";

export const initialize = async () => {
  const connection = new Connection(clusterApiUrl("mainnet-beta"));
  const fun = new Fun(connection);

  return { connection, fun };
};

export const createTokenViaPfsdk = async ({
  chatId,
}: {
  chatId: string;
}): Promise<{
  success: boolean;
  data?: any;
  message?: string;
}> => {
  try {
    const user = await prisma.user.findFirst({ where: { chatId } });
    const creatorWalletToken = user?.wallet;
    const creatorWalletSecret = await jwtDecrypt(creatorWalletToken!);
    const keypair = Keypair.fromSecretKey(
      base58_to_binary(creatorWalletSecret as string)
    );
    const creator = keypair;
    const token = Keypair.generate();

    const imagePath = path.resolve(__dirname, "../eye.jpg");
    const imageBuffer = fs.readFileSync(imagePath);
    const image: File = new File([imageBuffer], "tokenIage.jpg", {
      type: "image/jpeg",
    });

    const tokenMeta: TokenMeta = {
      name: "Hopium",
      symbol: "PIUM",
      description: "Hopium",
      image: image,
      keypair: token,
      // socials if any...
      twitter: "https://x.com",
      telegram: "https://x.com",
      website: "https://x.com",
    };

    console.log({ tokenMeta });

    const { fun, connection } = await initialize();

    const feePayerBalance = await connection.getBalance(creator.publicKey);
    console.log("Fee payer balance:", feePayerBalance / LAMPORTS_PER_SOL);

    const transaction = new Transaction();

    const createInstruct = await fun.compileCreateTokenInstruction({
      creator: creator.publicKey,
      tokenMeta,
    });

    transaction.add(createInstruct);
    console.log({ transaction });

    transaction.feePayer = creator.publicKey;

    transaction.recentBlockhash = (
      await connection.getRecentBlockhash()
    ).blockhash;

    transaction.sign(creator, token);
    console.log({ transaction });

    // simulate transaction

    const simulation = await connection.simulateTransaction(transaction, [
      creator,
      token,
    ]);
    if (simulation.value.err) {
      console.error("Simulation failed:", simulation.value.err);
      throw new Error("Transaction simulation failed");
    }
    console.log("Simulation succeeded:", simulation.value.logs);

    if (simulation.value.err) {
      console.error("Simulation failed:", simulation.value.err);
    } else {
      console.log("Simulation succeeded:", simulation.value.logs);
    }

    console.log({ simulation });

    const signature = await connection.sendTransaction(transaction, [
      creator,
      token,
    ]);
    console.log("Transaction signature:", signature);

    await connection.confirmTransaction(signature, "processed");
    console.log("Transaction confirmed:", signature);

    return {
      success: true,
      data: {
        tokenCreation: signature,
      },
    };
  } catch (error: any) {
    console.log({ error });
    const isBalanceErrorDecider =
      " account has insufficient funds for rent exemption. Required: ";

    const isBalanceError = error.message.includes(isBalanceErrorDecider);
    console.log({ error: error.message, isBalanceError });

    const errorComponents = error.message.split(isBalanceErrorDecider);

    const wallet = errorComponents[0];
    const required = errorComponents[1].split(",")[0];
    const available = errorComponents[1].split(": ")[1];

    const amount = 0;

    return {
      success: false,
      message: isBalanceError
        ? "You do not have sufficient SOL to create a token"
        : "An error occurred during token creation",
      data: {
        wallet,
        required: Number(required) / LAMPORTS_PER_SOL + amount,
        available: Number(available) / LAMPORTS_PER_SOL,
      },
    };
  }
};
