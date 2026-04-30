const fs = require("fs");
const fsp = fs.promises;
const path = require("path");

async function gitStatus(){
    console.log("Status");
}

module.exports = {gitStatus};