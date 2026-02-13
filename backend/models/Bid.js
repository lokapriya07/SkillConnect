const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobRequest", // ✅ matches your model
      required: true,
    },

    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // worker is a User
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    message: {
      type: String,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bid", bidSchema);
