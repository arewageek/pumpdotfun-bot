import { InlineKeyboard, type Context } from "grammy";
import { fetchTokenData } from "../helpers/token-api";

export const handleTokenCA = async (ctx: Context) => {
  const ca = ctx.message?.text;
  const data = await fetchTokenData(ca!);
  const token = data.data;

  const response = `\`${token?.name} ($${token?.symbol})\`🚀🚀
        \n\`${token?.address}\`
        \nBalance: \*0 Sol ($0)\*
        \nPrice: \*$${Number(token?.price_usd!).toFixed(
          6
        )}\* \| Liq: \*$${Number(
    token?.total_reserve_in_usd
  ).toLocaleString()}\* \| FDV: \*$${Number(token?.fdv_usd).toLocaleString()}\*
        \
        `;

  token
    ? ctx.reply(response, {
        parse_mode: "Markdown",
        reply_markup: new InlineKeyboard()
          .text("Buy 🟢", "buy")
          .text("Sell 🔴", "sell"),
      })
    : ctx.reply(
        "Oops! 🤭🤭\n\nCould not find the contract address you provided"
      );
};

export const handleFundWallet = async (ctx: Context) => {
  const amount = Number(ctx.message?.text);
  const response = `Your wallet has been credited with $${amount.toLocaleString()}`;
  ctx.reply(response);
};

export const handleFundWithdrawal = async (ctx: Context) => {
  const amount = Number(ctx.message?.text);
  const response = `Your wallet has been debited with $${amount.toLocaleString()}`;
  ctx.reply(response);
};
