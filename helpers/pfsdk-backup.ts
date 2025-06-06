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
import { base58_to_binary, binary_to_base58 } from "base58-js";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

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

// Add this helper function (reuse from the earlier example)
async function ensureAssociatedTokenAccountExists(
  connection: Connection,
  transaction: Transaction,
  payer: Keypair, // Fee payer (creator in this case)
  owner: Keypair, // Owner of the token account
  mint: Keypair // Token mint
) {
  const associatedTokenAddress = await getAssociatedTokenAddress(
    mint.publicKey,
    owner.publicKey
  );

  const accountInfo = await connection.getAccountInfo(associatedTokenAddress);

  if (!accountInfo) {
    console.log("Associated token account does not exist. Creating ATA...");
    const createATAInstruction = createAssociatedTokenAccountInstruction(
      payer.publicKey,
      associatedTokenAddress,
      owner.publicKey,
      mint.publicKey
    );
    transaction.add(createATAInstruction);
  } else {
    console.log(
      "Associated token account already exists:",
      associatedTokenAddress.toBase58()
    );
  }

  return associatedTokenAddress;
}

export const createTokenViaPfsdk = async ({
  chatId,
}: // name,
// symbol,
// description,
// imageUri,
// amount,
// website,
// telegram,
// twitter,
{
  chatId: string;
  // name: string;
  // symbol: string;
  // description: string;
  // imageUri: string;
  // amount: number;
  // twitter?: string;
  // telegram?: string;
  // website?: string;
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

    const metaBuffer: Buffer = Buffer.from("../meow.jpeg", "utf-8");
    const imageBlob: Blob = new Blob([metaBuffer], {
      type: "images/jpg",
    });

    const image: File = new File([imageBlob], "tokenImage.jpg");

    // const tokenMeta: TokenMeta = {
    //   name,
    //   symbol,
    //   description,
    //   image,
    //   keypair: token,
    //   // socials if any...
    //   twitter,
    //   telegram,
    //   website,
    // };

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
    /**
     * If insufficient SOL is provided, the function will throw an error
     *
     * This will return a TransactionInstruction instance
     * so you can freely assign the instruction to any type
     * of transaction that you like.
     *
     * ex. Transaction | VersionedTransaction
     * **/

    const { fun, connection } = await initialize();

    const feePayerBalance = await connection.getBalance(creator.publicKey);
    console.log("Fee payer balance:", feePayerBalance / LAMPORTS_PER_SOL);

    const transaction = new Transaction();

    // const associatedTokenAddress = await ensureAssociatedTokenAccountExists(
    //   connection,
    //   transaction,
    //   creator,
    //   creator, // Owner is the same as the creator in this case
    //   token // Token mint
    // );

    // console.log("Associated Token Address:", associatedTokenAddress.toBase58());

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

    const options = {
      commitment: "confirmed", // Or "finalized" for stronger guarantees
      preflightCommitment: "processed",
      skipPreflight: false,
      maxRetries: 10, // Retry mechanism for confirmation
    };

    const simulation = await connection.simulateTransaction(transaction, [
      creator,
      token,
    ]);
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

    await connection.confirmTransaction(signature, "confirmed");
    console.log("Transaction confirmed:", signature);

    // console.log({ createInstruct: createInstruct });

    // const handleTokenBuy = await buyToken({
    //   trader: creator as Keypair,
    //   token,
    //   amount,
    //   isFormatted: true,
    //   isInitialBuy: true,
    // });

    // console.log({ handleTokenBuy: handleTokenBuy.data });

    // const creatorData = await prisma.user.findFirst({ where: { chatId } });
    // const creatorId = creatorData?.id!;

    // await prisma.token.create({
    //   data: {
    //     name,
    //     symbol,
    //     creatorId,
    //     description,
    //     supply: "100000000",
    //   },
    // });

    // if (!handleTokenBuy.success) {
    //   return {
    //     success: true,
    //     message: "Token mint was successful but failed to initiate purchase",
    //   };
    // }

    return {
      success: true,
      data: {
        tokenCreation: signature,
        // tokenPurchase: handleTokenBuy.data,
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

    return { success: true, data: buy.keys.toString() };
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
