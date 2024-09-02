// models/monthlyRefund.model.js
import mongoose from "mongoose";

const monthlyRefundSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    month: { type: String, required: true }, // Format: "YYYY-MM"
    day: { type: String, required: true }, // Format: "DD"
    refundPayment: { type: Number, required: true },
    arrears: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const MonthlyRefund = mongoose.model("MonthlyRefund", monthlyRefundSchema);

export default MonthlyRefund;
