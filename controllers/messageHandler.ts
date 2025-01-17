import { InlineKeyboard, type Context } from "grammy";
import meme from "../helpers/transactions";
import { response } from "express";
import users from "./users.controllers";
import { format } from "../lib/number-formatter";

export const handleTokenCA = async (ctx: Context) => {
  const ca = ctx.message?.text!;
  const chatId = ctx.chatId!;
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

  const res = await meme.data(ca, chatId);
  const token = res.data;
  const balance = res.meta?.balance!;

  if (!token) {
    ctx.reply(
      `Oops\! 🤭🤭\n\nCould not find the contract address you provided`
    );
    return false;
  }

  const reply = `Buy \*${token.name}\* ─── \`$${token.symbol}\` 📈🚀
  \n\`${token.address}\`\n(Tap on CA to copy)
  \n\*Balance: $${balance.toLocaleString()}\*
  \n\*Price: $${Number(token.price)
    .toFixed(6)
    .toLocaleString()} ─── Liq: $${format(
    Number(token.liquidity.toFixed(2))
  )} ─── MC: $${format(Number(token.marketCap.toFixed(2)))}\*
  \nTwitter | Telegram | Website
  \n24Hr Vol: \*$${format(
    Number(token.tradeVolume24h.toFixed(2))
  )} ─── ${format(Number(token.tradeUserCount))} trades\* \nBuys: \*${format(
    Number(token.buyCount24h.toFixed(2))
  )}\* ─── Sells: \*${format(Number(token.sellCount24h.toFixed(2)))}\*
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
  const chatId = ctx.chatId!;

  let reply = `Processing your transaction...`;
  ctx.reply(reply);

  const trx = await meme.buy(chatId, amount);
  if (!trx.success) {
    reply = trx.message!;
  } else {
    const response = trx.data;
    reply = `\*Transaction successful!\* 🚀
    \nMarket Cap: \`$${format(response?.buy.mc!)}\`
    \nBase Price: \`$${format(response?.buy.price!, 6)}\`
    \nQuantity Purchased: \`${format(response?.quantity!, 2)}\`
    `;
  }

  trx && ctx.reply(reply, { parse_mode: "Markdown" });
};

export const handleTokenPreview = (ca: string, ctx: Context) => {
  ctx.reply("ca");
  console.log({ responseFromMessageHandler: "token preview callback" });
  return "content";
};
