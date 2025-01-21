import { InlineKeyboard, type Context } from "grammy";
import { createToken, getProvider } from "../helpers/pumpfun";
import { PumpFunSDK } from "pumpdotfun-sdk";
import { Keypair } from "@solana/web3.js";
import { createWallet, retrieveWallet } from "../helpers/account";

// start-bot context
export const StartContext = async (ctx: Context) => {
  try {
    const sender = ctx.chat?.first_name;

    const welcomMessage = `\*Hey, ${sender}, Welcome to Pumpdotfun Bot\* 🤗
        \nThis bots let's you create and trade solana meme tokens right from telegram, taking away the complexities involved with interacting with this token
        \nYou can interact with this bot using the commands made available for you below
        `;

    ctx.reply(welcomMessage, {
      parse_mode: "MarkdownV2",
      reply_markup: new InlineKeyboard()
        .text("Wallet 🟢", "wallet")
        .text("Create Token 📈", "create"),
    });
  } catch (error) {
    console.log({ startMessageError: error });
  }
};
// create-token context
export const CreateTokenContext = async (ctx: Context) => {
  try {
    const provider = getProvider();
    const sdk = new PumpFunSDK(provider);

    const testAccount = Keypair.generate();
    const mint = Keypair.generate();

    const file = new File(["Sample meme token"], "token.png", {
      type: "image/png",
    });

    const metadata = {
      name: "My Meme Token",
      symbol: "MMT",
      supply: 1000,
    };

    const response = await createToken(metadata, sdk, testAccount, mint, file);

    if (response.success) {
      await ctx.reply(
        `🎉 Token created successfully! View it here: https://pump.fun/${mint.publicKey.toBase58()}`
      );
    } else {
      await ctx.reply("❌ Failed to create token. Please try again later.");
    }
  } catch (error) {
    console.error({ createTokenError: error });
    await ctx.reply("❌ An error occurred while creating the token.");
  }
};

// wallet context

export const WalletContext = async (ctx: Context) => {
  try {
    const chatId = ctx.chat?.id;

    if (!chatId) {
      throw new Error("Chat ID not found");
    }

    const walletResult = await retrieveWallet(chatId);

    if (walletResult.success && walletResult.data) {
      const walletAddress = walletResult.data.public.toString();
      const message = `🪙 Your wallet address: \`${walletAddress}\``;
      await ctx.reply(message, { parse_mode: "MarkdownV2" });
    } else {
      const newWalletResult = await createWallet(chatId);

      if (newWalletResult.success && newWalletResult.data) {
        const newWalletAddress = newWalletResult.data.public.toString();
        const message = `🎉 A new wallet has been created for you! \n🪙 Wallet address: \`${newWalletAddress}\``;
        await ctx.reply(message, { parse_mode: "MarkdownV2" });
      } else {
        throw new Error(
          newWalletResult.message || "Failed to create a new wallet"
        );
      }
    }
  } catch (error) {
    console.error({ walletContextError: error });
    await ctx.reply("❌ An error occurred while accessing the wallet.");
  }
};
