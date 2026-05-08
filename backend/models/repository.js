const mongoose = require("mongoose");

const repositorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    defaultBranch: {
      type: String,
      default: "main",
    },
    remoteUrl: {
      type: String,
      default: "",
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    latestCommit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Commit",
      default: null,
    },
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 },
  },
  { timestamps: true },
);

repositorySchema.index({ owner: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Repository", repositorySchema);
