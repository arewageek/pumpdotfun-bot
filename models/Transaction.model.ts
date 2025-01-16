import mongoose, { Schema } from "mongoose";

interface ITransaction {
  trader: number;
  marketCap: {
    buy: number;
    sell?: number;
  };
  tokenQtty: number;
  usdValue: {
    buy: number;
    sell?: number;
  };
  token: {
    name: string;
    symbol: string;
    ca: string;
  };
  isOpen: boolean;
}

const TransactionSchema = new Schema(
  {
    trader: { type: Number, required: true },
    marketCap: {
      buy: { type: Number, required: true },
      sell: { type: Number, required: false },
    },
    tokenQtty: { type: Number, required: true },
    usdValue: {
      buy: { type: Number, required: true },
      sell: { type: Number, required: false },
    },

    isOpen: Boolean,
    token: {
      name: String,
      symbol: String,
      ca: String,
    },
  },
  { timestamps: true }
);

const Transaction =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;
