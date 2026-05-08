const mongoose = require("mongoose");
const crypto = require("crypto");
require("dotenv").config();

const userSchema = new mongoose.Schema({
  username:     { type: String, required: true, unique: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  avatarUrl:    { type: String, default: "" },
  bio:          { type: String, default: "" },
  followers:    [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following:    [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  refreshToken: { type: String, default: null },
}, { timestamps: true });

const repositorySchema = new mongoose.Schema({
  name:          { type: String, required: true },
  description:   { type: String, default: "" },
  owner:         { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  visibility:    { type: String, enum: ["public", "private"], default: "public" },
  defaultBranch: { type: String, default: "main" },
  remoteUrl:     { type: String, default: "" },
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  latestCommit:  { type: mongoose.Schema.Types.ObjectId, ref: "Commit", default: null },
  stars:         { type: Number, default: 0 },
  forks:         { type: Number, default: 0 },
}, { timestamps: true });
repositorySchema.index({ owner: 1, name: 1 }, { unique: true });

const blobSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  hash:     { type: String, required: true },
  s3Key:    { type: String, required: true },
  size:     { type: Number, required: true },
}, { _id: false });

const commitSchema = new mongoose.Schema({
  hash:        { type: String, required: true, unique: true },
  message:     { type: String, required: true },
  author:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  repository:  { type: mongoose.Schema.Types.ObjectId, ref: "Repository", required: true },
  branch:      { type: String, default: "main" },
  parentHash:  { type: String, default: null },
  blobs:       [blobSchema],
  committedAt: { type: Date, default: Date.now },
});

const User       = mongoose.model("User", userSchema);
const Repository = mongoose.model("Repository", repositorySchema);
const Commit     = mongoose.model("Commit", commitSchema);

console.log(process.env.MONGODB_URL)

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB Atlas");

    // Wipe existing seed data cleanly
    await Promise.all([
      User.deleteMany({ username: { $in: ["alice", "bob"] } }),
      Repository.deleteMany({ name: { $in: ["hello-world", "my-portfolio"] } }),
    ]);
    console.log("Cleared old seed data");

    // ── Users ────────────────────────────────────────────────────────────────

    const alice = await User.create({
      username:     "alice",
      email:        "alice@example.com",
      passwordHash: "$2b$10$exampleHashForAliceDoNotUseInProduction000000000000000",
      avatarUrl:    "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
      bio:          "Full-stack dev. Loves open source.",
    });

    const bob = await User.create({
      username:     "bob",
      email:        "bob@example.com",
      passwordHash: "$2b$10$exampleHashForBobDoNotUseInProduction0000000000000000",
      avatarUrl:    "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
      bio:          "Backend engineer. Coffee enjoyer.",
      followers:    [alice._id],
    });

    // Make alice follow bob
    alice.following.push(bob._id);
    await alice.save();

    console.log("Created users:", alice.username, bob.username);

    // ── Repositories ─────────────────────────────────────────────────────────

    const repoAlice = await Repository.create({
      name:          "hello-world",
      description:   "My first repo on this platform",
      owner:         alice._id,
      visibility:    "public",
      defaultBranch: "main",
      remoteUrl:     "http://localhost:5000/alice/hello-world",
      collaborators: [bob._id],
      stars:         3,
      forks:         1,
    });

    const repoBob = await Repository.create({
      name:          "my-portfolio",
      description:   "Personal portfolio website",
      owner:         bob._id,
      visibility:    "private",
      defaultBranch: "main",
      remoteUrl:     "http://localhost:5000/bob/my-portfolio",
      stars:         0,
      forks:         0,
    });

    console.log("Created repositories:", repoAlice.name, repoBob.name);

    // ── Commits ───────────────────────────────────────────────────────────────

    const hash1 = crypto
      .createHash("sha256")
      .update("initial commit content alice " + Date.now())
      .digest("hex");

    const commit1 = await Commit.create({
      hash:       hash1,
      message:    "Initial commit",
      author:     alice._id,
      repository: repoAlice._id,
      branch:     "main",
      parentHash: null,
      blobs: [
        {
          filename: "README.md",
          hash:     crypto.createHash("sha256").update("# Hello World").digest("hex"),
          s3Key:    "objects/" + crypto.createHash("sha256").update("# Hello World").digest("hex"),
          size:     13,
        },
        {
          filename: "index.js",
          hash:     crypto.createHash("sha256").update("console.log('hello')").digest("hex"),
          s3Key:    "objects/" + crypto.createHash("sha256").update("console.log('hello')").digest("hex"),
          size:     20,
        },
      ],
    });

    const hash2 = crypto
      .createHash("sha256")
      .update("second commit content alice " + Date.now())
      .digest("hex");

    const commit2 = await Commit.create({
      hash:       hash2,
      message:    "Add error handling to index.js",
      author:     alice._id,
      repository: repoAlice._id,
      branch:     "main",
      parentHash: hash1,
      blobs: [
        {
          filename: "README.md",
          hash:     crypto.createHash("sha256").update("# Hello World").digest("hex"),
          s3Key:    "objects/" + crypto.createHash("sha256").update("# Hello World").digest("hex"),
          size:     13,
        },
        {
          filename: "index.js",
          hash:     crypto.createHash("sha256").update("try { console.log('hello') } catch(e){}").digest("hex"),
          s3Key:    "objects/" + crypto.createHash("sha256").update("try { console.log('hello') } catch(e){}").digest("hex"),
          size:     39,
        },
      ],
    });

    const hash3 = crypto
      .createHash("sha256")
      .update("initial commit content bob " + Date.now())
      .digest("hex");

    const commit3 = await Commit.create({
      hash:       hash3,
      message:    "Initial portfolio setup",
      author:     bob._id,
      repository: repoBob._id,
      branch:     "main",
      parentHash: null,
      blobs: [
        {
          filename: "index.html",
          hash:     crypto.createHash("sha256").update("<h1>Bob's Portfolio</h1>").digest("hex"),
          s3Key:    "objects/" + crypto.createHash("sha256").update("<h1>Bob's Portfolio</h1>").digest("hex"),
          size:     24,
        },
      ],
    });

    console.log("Created commits:", commit1.message, "/", commit2.message, "/", commit3.message);

    // ── Update repos to point to latest commit ────────────────────────────────

    await Repository.findByIdAndUpdate(repoAlice._id, { latestCommit: commit2._id });
    await Repository.findByIdAndUpdate(repoBob._id,   { latestCommit: commit3._id });

    console.log("Updated latestCommit pointers");

    // ── Summary ───────────────────────────────────────────────────────────────

    console.log("\n✔  Seed complete. Collections created in Atlas:");
    console.log("   users        →", await User.countDocuments(), "documents");
    console.log("   repositories →", await Repository.countDocuments(), "documents");
    console.log("   commits      →", await Commit.countDocuments(), "documents");

    await mongoose.disconnect();
    console.log("\nDisconnected. Open Atlas and check your collections.");
  } catch (err) {
    console.error("Seed failed:", err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seed();