const fs = require("fs");
const fsp = fs.promises;
const path = require("path");

async function pushRepo(){
    const initPath = path.resolve(process.cwd(), ".Git");
    const stagingPath = path.join(initPath, "stage");
    const objectPath = path.join(initPath, "objects");

    console.log("Push command");
} 

module.exports = {pushRepo};