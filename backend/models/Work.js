const mongoose = require("mongoose");

const WorkSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phone: { type: String, unique: true, sparse: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Work", WorkSchema);
