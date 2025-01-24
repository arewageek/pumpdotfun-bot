import { InlineKeyboard, MemorySessionStorage, type Context } from "grammy";
import { buyToken, createTokenViaPfsdk } from "../helpers/pfsdk";
import { format } from "../utils/number-formatter";
import prisma from "../lib/prisma";
import { botResponses } from "../utils/responses";

interface ITokenBuyStore {
  ca?: string;
  amount?: string;
}

const store = new MemorySessionStorage();

export const handleTokenName = async (ctx: Context) => {
  try {
    const name = ctx.message?.text!;
    const chatId = ctx.chatId!;

    await prisma.tokenCache.create({
      data: { creator: chatId?.toString(), name },
    });

    await ctx.reply(botResponses.symbol, {
      reply_markup: { force_reply: true },
    });
  } catch (error) {
    console.log({ error });
    ctx.reply(botResponses.error, { reply_markup: { force_reply: true } });
  }
};

export const handleTokenSymbol = async (ctx: Context) => {
  try {
    const symbol = ctx.message?.text!;
    const chatId = ctx.chatId?.toString()!;

    const token = await prisma.tokenCache.findFirst({
      where: { creator: chatId },
    });
    await prisma.tokenCache.update({
      where: { id: token?.id },
      data: { symbol },
    });

    ctx.reply(botResponses.description, {
      reply_markup: { force_reply: true },
    });
  } catch (error) {
    ctx.reply(botResponses.error, { reply_markup: { force_reply: true } });
  }
};

export const handleTokenDescription = async (ctx: Context) => {
  try {
    const chatId = ctx.chatId?.toString()!;
    const description = ctx.message?.text;

    const token = await prisma.tokenCache.findFirst({
      where: { creator: chatId },
    });
    await prisma.tokenCache.update({
      where: { id: token?.id },
      data: { description },
    });

    ctx.reply(botResponses.image, {
      reply_markup: { force_reply: true },
    });
  } catch (error) {
    console.log({ error });
    ctx.reply(botResponses.error, { reply_markup: { force_reply: true } });
  }
};

export const handleTokenLogo = async (ctx: Context) => {
  try {
    const url = ctx.message?.text;
    const chatId = ctx.chatId?.toString()!;

    const token = await prisma.tokenCache.findFirst({
      where: { creator: chatId },
    });

    await prisma.tokenCache.update({
      where: { id: token?.id },
      data: { image: url },
    });

    ctx.reply(botResponses.image, { reply_markup: { force_reply: true } });
  } catch (error) {
    console.log({ error });

    ctx.reply(botResponses.mint, { reply_markup: { force_reply: true } });
  }
};

export const handleTokenMint = async (ctx: Context) => {
  try {
    const chatId = ctx.chatId?.toString()!;

    const token = await prisma.tokenCache.findFirst({
      where: { creator: chatId },
    });

    // prevent repeated data
    await prisma.tokenCache.deleteMany({ where: { creator: chatId } });

    // const response = await createToken();
    const response = await createTokenViaPfsdk({
      chatId: chatId?.toString()!,
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

    // await prisma.tokenBuySession.create({
    //   data: { tokenCA: ca, chatId: ctx.chatId?.toString()! },
    // });

    ctx.reply(botResponses.tokenBuyAmount, {
      reply_markup: { force_reply: true },
    });
  } catch (error) {
    console.log({ error });
    ctx.reply(botResponses.error, { reply_markup: { force_reply: true } });
  }
};

export const handleTokenBuyAmount = async (ctx: Context) => {
  try {
    const amount = ctx.message?.text;

    if (!store.has("token-buy")) {
      return ctx.reply("Please provide the token's contract address first");
    } else {
      const prev = store.read("token-buy") as ITokenBuyStore;
      prev.amount = amount;
      store.write("token-buy", prev);
    }

    // console.log({ store: store.readAllEntries()[0] });

    // return;

    // const token = await prisma.tokenBuySession.findFirst({
    //   where: { chatId: ctx.chatId?.toString()! },
    // });
    // const trader = await prisma.user.findFirst({
    //   where: { chatId: ctx.chatId?.toString()! },
    // });

    const response = await buyToken({
      trader: trader?.wallet as string,
      token: token?.tokenCA!,
      amount: Number(amount),
      isInitialBuy: false,
      isFormatted: false,
    });

    if (response.success) {
      ctx.reply("Token purchase was successful!!");
    }
  } catch (error) {
    console.log({ error });
    ctx.reply(botResponses.error, { reply_markup: { force_reply: true } });
  }
};
