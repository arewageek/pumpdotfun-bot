import express from "express";
import { Bot } from "grammy";
import { run } from "@grammyjs/runner";
import {
  BuyTokenCallback,
  StartContext,
  StartTokenCreationContext,
  WalletContext,
} from "../controllers/callbackQueries";
import {
  handleTokenBuyAmount,
  handleTokenCA,
  handleTokenDescription,
  handleTokenMint,
  handleTokenName,
  handleTokenSymbol,
} from "../controllers/messageHandler";
import { botResponses } from "../utils/responses";

const router = express.Router();

const botToken = process.env.TG_BOT_API!;

let bot: Bot | null = null;

const getBotInstance = () => {
  try {
    if (!bot) {
      bot = new Bot(botToken);

      bot.command("start", StartContext);

      // custom commands sent to the bot
      bot.on("message", async (ctx) => {
        let isReply: boolean, repliedTo: string | undefined;
        repliedTo = ctx.message.reply_to_message?.text;
        isReply = !!repliedTo;

        switch (repliedTo) {
          case botResponses.name:
            await handleTokenName(ctx);
            break;

          case botResponses.error:
            await handleTokenName(ctx);
            break;

          case botResponses.symbol:
            await handleTokenSymbol(ctx);
            break;

          case botResponses.description:
            await handleTokenDescription(ctx);
            break;

          case botResponses.image:
            await handleTokenMint(ctx);
            break;

          // handle token buy
          case botResponses.tokenCA:
            await handleTokenCA(ctx);
            break;

          case botResponses.tokenBuyAmount:
            await handleTokenBuyAmount(ctx);
            break;

          default:
            ctx.reply(
              "Seems like you missed it. Please select a button on the /start message to begin"
            );
            break;
        }
      });

      //   pumpdotfun callbacks
      bot.callbackQuery("start-create", StartTokenCreationContext);
      bot.callbackQuery("buy-token", BuyTokenCallback);

      // wallet callbacks
      bot.callbackQuery("wallet", WalletContext);
    }
    run(bot);

    console.log("Bot is now running");
  } catch (error) {
    console.log({ error });
  } finally {
    return bot;
  }
};

getBotInstance();

export default router;
