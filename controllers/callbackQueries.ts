import { InlineKeyboard, type Context } from "grammy";
import { createToken, getProvider } from "../helpers/pumpfun";
import { PumpFunSDK } from "pumpdotfun-sdk";
import { Keypair } from "@solana/web3.js";
import { createWallet, retrieveWallet } from "../helpers/account";
import { createTokenViaPfsdk } from "../helpers/pfsdk";
import { format } from "../utils/number-formatter";
import { botResponses } from "../utils/responses";
import prisma from "../lib/prisma";

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

// create-token context
export const CreateTokenContext = async (ctx: Context) => {};

export const TokenNameContext = (ctx: Context) => {
  ctx.reply("What is the name of your token?");
};
export const TokenSymbolContext = (ctx: Context) => {
  ctx.reply("What is the symbol for the token");
};
export const TokenDescriptionContext = (ctx: Context) => {
  ctx.reply("Share a small story behind your token");
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
      const walletAddress = walletResult.data.public;
      const message = `🪙 Your wallet address: \`${walletAddress}\``;
      await ctx.reply(message, { parse_mode: "MarkdownV2" });
    } else {
      const newWalletResult = await createWallet(chatId);

      if (newWalletResult.success && newWalletResult.data) {
        const newWalletAddress = newWalletResult.data.public.toString();
        const message = `🎉 A new wallet has been created for you! \n🪙 Wallet address: \`${newWalletAddress}\``;
        await ctx.reply(message, { parse_mode: "Markdown" });
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

export const BuyTokenCallback = (ctx: Context) => {
  ctx.reply(botResponses.tokenCA, {
    reply_markup: { force_reply: true },
  });
};
