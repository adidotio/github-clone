const mongoose = require("mongoose");

const blobSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    hash: {
      type: String,
      required: true,
    },
    s3Key: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

const commitSchema = new mongoose.Schema({
  hash: {
    type: String,
    required: true,
    unique: true,
  },
  message: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  repository: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Repository",
    required: true,
  },
  branch: {
    type: String,
    default: "main",
  },
  parentHash: {
    type: String,
    default: null,
  },
  blobs: [blobSchema],
  committedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Commit", commitSchema);