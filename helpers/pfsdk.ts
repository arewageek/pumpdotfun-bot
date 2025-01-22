import Fun, { type TokenMeta } from "pfsdk";
import {
  Connection,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import prisma from "../lib/prisma";
import { jwtDecrypt } from "../utils/jwt";
import { base58_to_binary } from "base58-js";

export const createTokenViaPfsdk = async ({
  chatId,
  name,
  symbol,
  description,
  imageUri,
}: {
  chatId: string;
  name: string;
  symbol: string;
  description: string;
  imageUri: string;
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

    const connection = new Connection(clusterApiUrl("mainnet-beta"));
    const fun = new Fun(connection);

    /**
     * If insufficient SOL is provided, the function will throw an error
     *
     * This will return a TransactionInstruction instance
     * so you can freely assign the instruction to any type
     * of transaction that you like.
     *
     * ex. Transaction | VersionedTransaction
     * **/
    const createInstruct = await fun.compileCreateTokenInstruction({
      creator: creator.publicKey,
      tokenMeta,
    });

    console.log({ createInstruct });

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
        required: Number(required) / LAMPORTS_PER_SOL,
        available: Number(available) / LAMPORTS_PER_SOL,
      },
    };
  }
};
