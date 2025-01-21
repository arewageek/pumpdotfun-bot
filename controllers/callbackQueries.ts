import { InlineKeyboard, type Context } from "grammy";

// start-bot context
export const StartContext = async (ctx: Context) => {
  try {
    const sender = ctx.chat?.first_name;

    const welcomMessage = `\*Hey, ${sender}, Welcome to Pumpdotfun Bot\* 🤗
        \nThis bots let's you create and trade solana meme tokens right from telegram, taking away the complexities involved with interacting with this token
        \nYou can interact with this bot using the commands made available for you below
        `;

    ctx.reply(welcomMessage, {
      parse_mode: "MarkdownV2",
      reply_markup: new InlineKeyboard()
        .text("Wallet 🟢", "wallet")
        .text("Create Token 📈", "create"),
    });
  } catch (error) {
    console.log({ startMessageError: error });
  }
};

export const CreateTokenContext = () => {};

export const WalletContext = () => {};
