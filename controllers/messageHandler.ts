import { InlineKeyboard, type Context } from "grammy";
import { createTokenViaPfsdk } from "../helpers/pfsdk";
import { format } from "../utils/number-formatter";

const errorResponse =
  "Sorry i didn' catch that. Let's start all over ─── What's the name of the token?";

export const handleTokenName = async (ctx: Context) => {
  try {
    const tokenName = ctx.message?.text;

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
    const symbol = ctx.message?.text;

    ctx.reply(
      "Cool, now I'd like you to share a little story about your project",
      { reply_markup: { force_reply: true } }
    );
  } catch (error) {
    ctx.reply(errorResponse, { reply_markup: { force_reply: true } });
  }
};

export const handleTokenMint = async (ctx: Context) => {
  try {
    const chatId = ctx.chatId;
    // const response = await createToken();
    const response = await createTokenViaPfsdk(chatId?.toString()!);

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
