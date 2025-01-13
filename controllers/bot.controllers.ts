import { run } from "@grammyjs/runner";
import type { Request, Response } from "express";
import { Bot } from "grammy";

const botToken = process.env.TG_BOT_API!;
// const bot = new Bot(botToken);
