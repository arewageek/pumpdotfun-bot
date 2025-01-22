import Fun, { type TokenMeta } from "pfsdk";
import {
  Connection,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

export const createTokenViaPfsdk = async (
  name?: string,
  symbol?: string,
  description?: string
): Promise<{
  success: boolean;
  data?: any;
  message?: string;
}> => {
  try {
    const creator = Keypair.generate();
    const token = Keypair.generate();

    // const imageeSource = "../meow.jpeg";

    const metaBuffer = Buffer.from("../meow.jpeg", "utf-8");
    const imageBlob = new Blob([metaBuffer], { type: "application/json" });

    const image = new File([imageBlob], "image.jpg");

    const tokenMeta: TokenMeta = {
      name: "ABC",
      symbol: "DEF",
      description: "GHI",
      image,
      keypair: token,
      // socials if any...
    };

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

    return { success: true, data: createInstruct };
  } catch (error: any) {
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
