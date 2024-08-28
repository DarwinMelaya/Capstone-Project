import mongoose from "mongoose";

const refundSchema = new mongoose.Schema(
  {
    refundRate: { type: Number, default: 0 },
    totalRefundPayment: { type: Number, default: 0 },
    refundStatus: { type: String, default: "Pending" },
    monthlyDue: { type: Number, default: 0 },
    refundPayment: { type: Number, default: 0 },
    arrears: { type: Number, default: 0 },
  },
  { _id: false }
);

const scheduleSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    details: { type: String, required: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    firmName: String,
    municipality: String,
    firmOwner: String,
    details: String,
    amountOfAssistance: Number,
    refunds: refundSchema,
    schedules: [scheduleSchema], // Add this line
    changeDate: { type: Date }, // New field for tracking the change date
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
