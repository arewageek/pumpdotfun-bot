import { MemorySessionStorage, type Context } from "grammy";
import { buyToken, createTokenViaPfsdk } from "../helpers/pfsdk";
import { format } from "../utils/number-formatter";
import prisma from "../lib/prisma";
import { botResponses } from "../utils/responses";
import { retrieveWallet } from "../helpers/account";
import type { ITokenBuyStore, ITokenCreateStore, IWallet } from "../interface";

export const store = new MemorySessionStorage();

export const handleTokenName = async (ctx: Context) => {
  try {
    const name = ctx.message?.text!;

    store.delete("token-create");
    store.write("token-create", { name });

    await ctx.reply(botResponses.symbol, {
      reply_markup: { force_reply: true },
    });
  } catch (error) {
    ctx.reply(botResponses.error, { reply_markup: { force_reply: true } });
  }
};

export const handleTokenSymbol = async (ctx: Context) => {
  try {
    const symbol = ctx.message?.text!;

    if (!store.has("token-create")) throw new Error(botResponses.error2);

    const prev = store.read("token-create") as ITokenCreateStore;
    store.write("token-create", { ...prev, symbol });

    ctx.reply(botResponses.description, {
      reply_markup: { force_reply: true },
    });
  } catch (error) {
    ctx.reply(botResponses.error, { reply_markup: { force_reply: true } });
  }
};

export const handleTokenDescription = async (ctx: Context) => {
  try {
    const description = ctx.message?.text;

    if (!store.has("token-create")) throw new Error(botResponses.error2);
    const prev = store.read("token-create") as ITokenCreateStore;
    store.write("token-create", { ...prev, description });

    ctx.reply(botResponses.image, {
      reply_markup: { force_reply: true },
    });
  } catch (error) {
    ctx.reply(botResponses.error, { reply_markup: { force_reply: true } });
  }
};

export const handleTokenLogo = async (ctx: Context) => {
  try {
    const url = ctx.message?.text;

    if (!store.has("token-create")) throw new Error(botResponses.error2);

    const prev = store.read("token-create") as ITokenCreateStore;
    store.write("token-create", { ...prev, image: url });

    ctx.reply(botResponses.image, { reply_markup: { force_reply: true } });
  } catch (error) {
    ctx.reply(botResponses.mint, { reply_markup: { force_reply: true } });
  }
};

export const handleTokenMint = async (ctx: Context) => {
  try {
    if (!store.has("token-create")) throw new Error(botResponses.error2);

    const token = store.read("token-create") as ITokenCreateStore;

    const response = await createTokenViaPfsdk({
      chatId: ctx.chatId?.toString()!,
      name: token?.name!,
      symbol: token?.symbol!,
      description: token?.description!,
      imageUri: token?.image!,
      amount: Number(ctx.message?.text),
    });

    let reply = "";

    if (response.success) {
      reply = `🎉 Token created successfully! View it here: https://pump.fun/${response.data.tokenAddress}`;
    } else {
      reply = `❌ Your wallet (\*${response.data.wallet.slice(
        0,
        5
      )}...${response.data.wallet.slice(
        -3
      )}\*) does not have enough SOL for this transaction
      \n\*Required: ${format(response.data.required, 6)} SOL\*
      \n\*Available: ${format(response.data.available, 6)} SOL\*`;
    }
    ctx.reply(reply, { parse_mode: "Markdown" });
  } catch (error) {
    console.error({ createTokenError: error });
    await ctx.reply("❌ An error occurred while creating the token.");
  }
};

export const handleTokenCA = async (ctx: Context) => {
  try {
    const ca = ctx.message?.text;

    store.delete("token-buy");
    store.write("token-buy", { ca });

    ctx.reply(botResponses.tokenBuyAmount, {
      reply_markup: { force_reply: true },
    });
  } catch (error) {
    ctx.reply(botResponses.error, { reply_markup: { force_reply: true } });
  }
};

export const handleTokenBuyAmount = async (ctx: Context) => {
  try {
    const amount = ctx.message?.text;
    const chatId = ctx.chatId!;
    const tokenToBuy = store.read("token-buy") as ITokenBuyStore;

    if (!store.has("token-buy"))
      return ctx.reply("Please provide the token's contract address first");

    const prev = store.read("token-buy") as ITokenBuyStore;
    prev.amount = amount;
    store.write("token-buy", prev);

    const trader = store.has("wallet")
      ? (store.read("wallet") as IWallet)
      : (await retrieveWallet(chatId)).data;

    const response = await buyToken({
      trader: trader?.token as string,
      token: tokenToBuy.ca as string,
      amount: Number(amount),
      isInitialBuy: false,
      isFormatted: false,
    });

    if (response.success) {
      ctx.reply("Token purchase was successful!!");
    }
  } catch (error) {
    ctx.reply(botResponses.error, { reply_markup: { force_reply: true } });
  }
};
