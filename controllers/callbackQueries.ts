import { InlineKeyboard, type Context } from "grammy";
import { retrieveWallet } from "../helpers/account";
import { botResponses } from "../utils/responses";
import { store } from "./messageHandler";
import type { IWallet } from "../interface";

// start-bot context
export const StartContext = async (ctx: Context) => {
  try {
    const sender = ctx.chat?.first_name;

    const welcomMessage = `\*Hey, ${sender}, Welcome to Solana Token Minter\* 🤗
        \nThis bots let's you create and trade solana meme tokens right from telegram, taking away the complexities involved with interacting with this token
        \nYou can interact with this bot using the commands made available for you below
        `;

    ctx.reply(welcomMessage, {
      parse_mode: "MarkdownV2",
      reply_markup: new InlineKeyboard()
        .text("Wallet 💳", "wallet")
        .text("Buy Token 🟢", "buy-token")
        .row()
        .text("Create Token 📈", "start-create"),
    });
  } catch (error) {
    console.log({ startMessageError: error });
  }
};

// initialize token creation context
export const StartTokenCreationContext = async (ctx: Context) => {
  ctx.reply("What is the name of this token you want to create?", {
    reply_markup: { force_reply: true },
  });
};

// wallet context
export const WalletContext = async (ctx: Context) => {
  try {
    const chatId = ctx.chat?.id;

    if (!chatId) {
      throw new Error("Chat ID not found");
    }

    let walletResult: IWallet;
    let message: string;

    if (!store.has("wallet")) {
      const wallet = await retrieveWallet(chatId);
      store.write("wallet", wallet);
      walletResult = wallet.data!;

      if (wallet.success && wallet.data) {
        console.log("Fetched from server!!");
        message = wallet.isNewWallet
          ? `🎉 A new wallet has been created for you! \n🪙 Wallet address: \`${wallet.data.public}\``
          : `🪙 Your wallet address: \`${wallet.data.public}\``;

        store.write("wallet", walletResult);
      } else {
        throw new Error("Failed to create a new wallet");
      }
    } else {
      walletResult = store.read("wallet") as IWallet;
      console.log("Fetched locally!!");
      message = `🪙 Your wallet address: \`${walletResult.public}\``;
    }

    await ctx.reply(message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error({ walletContextError: error });
    await ctx.reply("❌ An error occurred while accessing the wallet.");
  }
};

export const BuyTokenCallback = (ctx: Context) => {
  ctx.reply(botResponses.tokenCA, {
    reply_markup: { force_reply: true },
  });
};
