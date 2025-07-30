const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
  stock: { type: String, required: true, unique: true },
  likes: { type: Number, default: 0 },
  ipHashes: [String] // чтобы отслеживать IP (в хеше)
});

module.exports = mongoose.model("Stock", stockSchema);
