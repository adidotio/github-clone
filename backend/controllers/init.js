const fs = require("fs");
const fsp = fs.promises;
const path = require("path");

async function initRepo() {
    const initPath   = path.resolve(process.cwd(), ".Git");
    const commitPath = path.join(initPath, "commits");
    const objectPath = path.join(initPath, "objects");
    const stagePath  = path.join(initPath, "stage");
    const headPath   = path.join(initPath, "HEAD");

    try {
        await fsp.mkdir(initPath,   { recursive: true });  
        await fsp.mkdir(commitPath, { recursive: true });
        await fsp.mkdir(objectPath, { recursive: true });
        await fsp.mkdir(stagePath,  { recursive: true });  

        // stage.json initialized as empty object
        await fsp.writeFile(
            path.join(stagePath, "stage.json"),
            JSON.stringify({}, null, 2)
        );

        // HEAD initialized as empty
        await fsp.writeFile(headPath, "", "utf-8");

        await fsp.writeFile(
            path.join(initPath, "config.json"),
            JSON.stringify({ bucket: process.env.S3_BUCKET })
        );

        console.log("Repository initialised!");
    } catch (err) {
        console.error("Can't initialise the repository:", err);
    }
}

module.exports = { initRepo };