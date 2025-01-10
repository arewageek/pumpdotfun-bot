import { run } from "@grammyjs/runner";
import type { Request, Response } from "express";
import { Bot } from "grammy";

const botToken = process.env.TG_BOT_API!;
// const bot = new Bot(botToken);

export const BotController = async (request: Request, response: Response) => {
  //   console.log("new request");
  //   bot.command("start", (ctx) => {
  //     console.log({ message: ctx.message });
  //     ctx.reply("Hello user");
  //   });
  //   run(bot);
};

export const Message = async (request: Request, response: Response) => {
  //   console.log("New message request");
  //   bot.command("start", (ctx) => {
  //     console.log({ message: ctx.chat });
  //     ctx.reply("Response Recorded");
  //   });
};
