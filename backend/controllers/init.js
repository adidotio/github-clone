const fs = require("fs").promises;
const path = require("path");

async function initRepo(){
    const initPath = path.resolve(process.cwd(), ".Git");
    const commitPath = path.join(initPath, "commits");

    try{
        await fs.mkdir(initPath, {recursive: true});
        await fs.mkdir(commitPath, {recursive: true});
        await fs.writeFile(
            path.join(initPath, "config.json"),
            JSON.stringify({bucket: process.env.S3_BUCKET})
        )

        console.log("Repositry initialised !!");
    } catch(err){
        console.error("Can't initialise the repositry: ", err);
    }
}

module.exports = {initRepo};