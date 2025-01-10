import type { Context } from "grammy";

// trade callbacks
export const BuyCallback = async (ctx: Context) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    "Please paste the Contract Address of the token you wish to buy in the chat"
  );
};

export const SettingsCallback = async (ctx: Context) => {
  await ctx.answerCallbackQuery();
  await ctx.reply("Data available only in new context");
};
