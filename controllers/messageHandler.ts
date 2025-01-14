import { InlineKeyboard, type Context } from "grammy";
import { fetchTokenData } from "../helpers/token-api";
import token from "../helpers/solanatracker";
import meme from "../helpers/meme-api";
import { response } from "express";
import users from "./users.controllers";

export const handleTokenCA = async (ctx: Context) => {
  const ca = ctx.message?.text;
  //   const data = await fetchTokenData(ca!);
  //   const token = data.data;

  //   const response = `\`${token.name} ($${token.symbol})\`🚀🚀
  //         \n\`${token.address}\`
  //         \nBalance: \*0 Sol ($0)\*
  //         \nPrice: \*$${Number(token.price_usd!).toFixed(
  //           6
  //         )}\* \| Liq: \*$${Number(
  //     token.total_reserve_in_usd
  //   ).toLocaleString()}\* \| FDV: \*$${Number(token.fdv_usd).toLocaleString()}\*
  //         \
  //         `;

  //   token
  //     ? ctx.reply(response, {
  //         parse_mode: "Markdown",
  //         reply_markup: new InlineKeyboard()
  //           .text("Buy 🟢", "buy")
  //           .text("Sell 🔴", "sell"),
  //       })
  //     : ctx.reply(
  //         "Oops! 🤭🤭\n\nCould not find the contract address you provided"
  //       );

  const res = await meme.data(ca!);
  const token = res.data;
  console.log({ updatedResponse: res });

  if (!token) {
    ctx.reply(
      `Oops\! 🤭🤭\n\nCould not find the contract address you provided`
    );
    return false;
  }

  const reply = `Buy \*${token.name}\* ─── \`$${token.symbol}\` 📈🚀
  \n\`${token.address}\`\n(Tap on CA to copy)
  \n\*Price: $${Number(token.price)
    .toFixed(6)
    .toLocaleString()} ─── Liq: $${Number(
    token.liquidity.toFixed(2).toLocaleString()
  )} ─── MC: $${Number(token.marketCap.toFixed(2)).toLocaleString()}\*
  \nTwitter | Telegram | Website
  \n24Hr Vol: \*$${Number(
    token.tradeVolume24h.toFixed(2)
  ).toLocaleString()} ─── ${Number(
    token.tradeUserCount
  ).toLocaleString()} trades\* \nBuys: \*${Number(
    token.buyCount24h
  ).toLocaleString()}\* ─── Sells: \*${Number(
    token.sellCount24h
  ).toLocaleString()}\*
  \nTop 10: \*${Number(token.top10Holder).toLocaleString()}%\*
  `;
  ctx.reply(reply, {
    parse_mode: "Markdown",
    reply_markup: new InlineKeyboard()
      .text("⬅ Back", "back")
      .text("⟲ Refresh", "refresh")
      .row()
      .text("Buy 🟢", "buy"),
  });
};

export const handleFundWallet = async (ctx: Context) => {
  const amount = Number(ctx.message?.text);
  const chatId = ctx.chatId!;
  const response = await users.fund({ chatId, amount });
  const reply = {
    success: `Your wallet has been credited with $${amount.toLocaleString()}`,
    failed: `Failed to fund wallet`,
  };
  ctx.reply(response.success ? reply.success : reply.failed);
};

export const handleFundWithdrawal = async (ctx: Context) => {
  const amount = Number(ctx.message?.text);
  const chatId = ctx.chatId!;
  const response = await users.withdraw({ chatId, amount });
  const reply = response.success
    ? `Your wallet has been debited with $${amount.toLocaleString()}`
    : response.message || "Failed to withdraw from your wallet";
  ctx.reply(reply);
};

export const handleTokenBuy = async (ctx: Context) => {
  const amount = Number(ctx.message?.text);
  let reply = `Processing your transaction...`;
  ctx.reply(reply);

  setTimeout(() => {
    reply = `\*Transaction successful!\* 🚀`;
    ctx.reply(reply, { parse_mode: "Markdown" });
  }, 1000);
};
