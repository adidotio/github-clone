require('dotenv').config();

const express = require("express");
const app = express();

const { connectDb } = require("./config/db_config");

connectDb();

app.use(express.json());

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("Server is running...");
});