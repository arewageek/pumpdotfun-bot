import express from "express";
import {
  SetWebhook,
  readWebhook,
  removeWebhook,
} from "../controllers/webhook.controllers";

const router = express.Router();

router.get("/", readWebhook);
router.post("/set", SetWebhook);
router.post("/remove", removeWebhook);

export default router;
