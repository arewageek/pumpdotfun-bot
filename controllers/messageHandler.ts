import { InlineKeyboard, type Context } from "grammy";
import { createTokenViaPfsdk } from "../helpers/pfsdk";
import { format } from "../utils/number-formatter";
import prisma from "../lib/prisma";

const errorResponse =
  "Sorry i didn' catch that. Let's start all over ─── What's the name of the token?";

export const handleTokenName = async (ctx: Context) => {
  try {
    const name = ctx.message?.text!;
    const chatId = ctx.chatId!;

    await prisma.tokenCache.create({
      data: { creator: chatId?.toString(), name },
    });

    await ctx.reply("What is the symbol of your token?", {
      reply_markup: { force_reply: true },
    });
  } catch (error) {
    console.log({ error });
    ctx.reply(errorResponse, { reply_markup: { force_reply: true } });
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

    ctx.reply(
      "Cool, now I'd like you to share a little story about your project",
      { reply_markup: { force_reply: true } }
    );
  } catch (error) {
    ctx.reply(errorResponse, { reply_markup: { force_reply: true } });
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

    ctx.reply("Perfect, now I'd like you to share a link to the token's logo");
  } catch (error) {
    console.log({ error });
    ctx.reply(errorResponse, { reply_markup: { force_reply: true } });
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
      imageUri: ctx.message?.text!,
    });

    let reply = "";

    if (response.success) {
      reply = `🎉 Token created successfully! View it here: https://pump.fun/${response.data}`;
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
