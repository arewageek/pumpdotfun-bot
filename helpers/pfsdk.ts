import Fun, { type TokenMeta } from "pfsdk";
import {
  Connection,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import prisma from "../lib/prisma";
import { jwtDecrypt } from "../utils/jwt";
import { base58_to_binary, binary_to_base58 } from "base58-js";

/**
  Interface for token buys
**/
interface ITokenBuyParams {
  trader: string | Keypair;
  token: string | Keypair;
  amount: number;
  isFormatted?: boolean;
  isInitialBuy: boolean;
}

export const initialize = async () => {
  const connection = new Connection(clusterApiUrl("mainnet-beta"));
  const fun = new Fun(connection);

  return { connection, fun };
};

export const createTokenViaPfsdk = async ({
  chatId,
  name,
  symbol,
  description,
  imageUri,
  amount,
}: {
  chatId: string;
  name: string;
  symbol: string;
  description: string;
  imageUri: string;
  amount: number;
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

    // const imageeSource = "../meow.jpeg";

    const metaBuffer: Buffer = Buffer.from(imageUri || "../meow.jpeg", "utf-8");
    const imageBlob: Blob = new Blob([metaBuffer], {
      type: "images/jpg",
    });

    const image: File = new File([imageBlob], "tokenImage.jpg");

    const tokenMeta: TokenMeta = {
      name,
      symbol,
      description,
      image,
      keypair: token,
      // socials if any...
    };

    console.log({ tokenMeta });
    /**
     * If insufficient SOL is provided, the function will throw an error
     *
     * This will return a TransactionInstruction instance
     * so you can freely assign the instruction to any type
     * of transaction that you like.
     *
     * ex. Transaction | VersionedTransaction
     * **/

    const { fun } = await initialize();

    const createInstruct = await fun.compileCreateTokenInstruction({
      creator: creator.publicKey,
      tokenMeta,
    });

    const creatorData = await prisma.user.findFirst({ where: { chatId } });
    const creatorId = creatorData?.id!;

    await prisma.token.create({
      data: {
        name,
        symbol,
        creatorId,
        description,
        supply: "100000000",
      },
    });

    const handleTokenBuy = await buyToken({
      trader: creator as Keypair,
      token,
      amount,
      isFormatted: true,
      isInitialBuy: true,
    });

    if (!handleTokenBuy.success) {
      return {
        success: true,
        message: "Token mint was successful but faile to initiate purchase",
      };
    }

    return { success: true, data: createInstruct };
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

export const buyToken = async ({
  trader,
  token,
  amount,
  isFormatted,
  isInitialBuy = false,
}: ITokenBuyParams): Promise<{
  success: boolean;
  data?: any;
  message?: string;
}> => {
  try {
    const { fun } = await initialize();

    let traderKeypair: Keypair, tokenKeypair: Keypair, amountFormatted: BigInt;
    if (!isFormatted) {
      traderKeypair = jwtTokenToKeypair(trader as string);
      tokenKeypair = jwtTokenToKeypair(token as string);
      amountFormatted = BigInt(amount);
    } else {
      traderKeypair = trader as Keypair;
      tokenKeypair = token as Keypair;
      amountFormatted = BigInt(amount);
    }

    const buy = await fun.compileBuyInstruction(
      {
        trader: traderKeypair.publicKey,
        token: tokenKeypair.publicKey,
        solAmount: BigInt(amount * LAMPORTS_PER_SOL),
      },
      isInitialBuy
    );

    return { success: true, data: buy };
  } catch (error) {
    console.log({ error });
    return {
      success: false,
      message: "An error occurred during token purchase",
    };
  }
};

// handle conversions
export const jwtTokenToKeypair = (jwtToken?: string) => {
  const secretKey = jwtDecrypt(jwtToken!);
  const keypair = Keypair.fromSecretKey(base58_to_binary(secretKey.toString()));

  return keypair;
};
