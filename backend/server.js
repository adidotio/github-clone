require('dotenv').config();

const express = require("express");
const app = express();
const { connectDb } = require("./config/dbConfig");
const userRoute = require("./routes/userRoute");
const repoRoute = require("./routes/repoRoute");

// Connect to DB
connectDb();
app.use(express.json());

// Register and login routes
app.use("/auth", userRoute);

// Repo routes
app.use("/repo", repoRoute);


// App runnning at port
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("Server is running...");
});