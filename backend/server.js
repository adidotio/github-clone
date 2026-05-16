require('dotenv').config();

const express = require("express");
const app = express();
const { connectDb } = require("./config/dbConfig");
const userRoute = require("./routes/userRoute");

// Connect to DB
connectDb();
app.use(express.json());

// Register and login route
app.use("/auth", userRoute);

// App runnning at port
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("Server is running...");
});