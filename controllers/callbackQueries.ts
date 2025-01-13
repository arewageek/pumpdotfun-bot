import { InlineKeyboard, type Context } from "grammy";

// start-bot context
export const StartContext = async (ctx: Context) => {
  const sender = ctx.chat?.first_name;
  // const chatId = ctx.chat.id;
  // const sendMessage = await ctx.replyWithPhoto(
  //   "https://i.pinimg.com/736x/4d/5e/67/4d5e675307eec14412cf819b9b75b7b4.jpg",
  //   {
  //     caption: `Hey, ${sender}! \n\nWelcome to Pawn Finance, an opportunity to max possibilities demo trading memes on solana without losing your real funds`,
  //   }
  // );

  const balance = 400;
  const trades = { count: 0, volume: 0 };
  const welcomMessage = `\*Hey, ${sender}, Welcome to Pawn Finance\* 🤗
        \nWe present you with an opportunity to learn and perfect your understanding trading memes on solana
        \nThink of this as a learning environment where you can simulate trades without real funds
        \nYou will be provided with a demo wallet and can fund it at any time using using the deposit button below
        \n\*How to trade?💡\*\nSimply paste the CA in the chat and we'll take it up from there
        \n\*Wallet Balance: \`$${balance.toLocaleString()}\`\* ┃ \*Total Trades: \`${trades.count.toLocaleString()}\`\* ┃ \*Total Volume: \`$${trades.volume.toLocaleString()}\`\*
        \n⚠️\*Please note:\* This bot is 100% free to use
        `;

  ctx.reply(welcomMessage, {
    parse_mode: "MarkdownV2",
    reply_markup: new InlineKeyboard()
      .text("Buy 🟢", "buy")
      .text("Sell 🔴", "sell")
      .row()
      .text("Account 💰", "account")
      .text("Positions 📈", "positions")
      .text("Settings ⚙️", "settings")
      .row()
      .text("⟲ Refresh", "refresh")
      .row()
      .url("Follow us on X", "https://x.com/pawn_fi")
      .url("Join Our Telegram", "https://x.com/pawn_fi"),
  });
};

// trade callbacks
export const BuyCallback = async (ctx: Context) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    "Please paste the Contract Address of the token you wish to buy in the chat",
    { reply_markup: { force_reply: true } }
  );
};

export const SettingsCallback = async (ctx: Context) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText("Editted for the settings callback");
};

export const AccountCallback = async (ctx: Context) => {
  await ctx.answerCallbackQuery();

  const trades = { count: 0, volume: 0 };
  const balance = 400;
  const response = `Below you find information about your account and options to update your balance
  \n\*Wallet Balance: \`$${balance.toLocaleString()}\`\* ┃ \*Total Trades: \`${trades.count.toLocaleString()}\`\* ┃ \*Total Volume: \`$${trades.volume.toLocaleString()}\`\*
  `;
  await ctx.editMessageText(response, {
    parse_mode: "MarkdownV2",
    reply_markup: new InlineKeyboard()
      .text("⬅ Back", "back")
      .text("⟲ Refresh", "refresh")
      .row()
      .text("Fund Wallet", "fund")
      .text("Withdraw", "withdraw")
      .row()
      .text("Reset Account", "reset_account"),
  });
};

export const FundCallback = async (ctx: Context) => {
  const response = "How much would you like to credit into your account?";
  await ctx.reply(response, { reply_markup: { force_reply: true } });
};

export const WithdrawCallback = async (ctx: Context) => {
  const response = "How much would you like to withdraw?";
  await ctx.reply(response, { reply_markup: { force_reply: true } });
};
