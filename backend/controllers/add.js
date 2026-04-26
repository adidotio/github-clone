const crypto = require("crypto");
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");

async function addFile(filePath) {
    const initPath = path.resolve(process.cwd(), ".Git");
    const stagingPath = path.join(initPath, "stage");
    const objectPath = path.join(initPath, "objects");

    if (!fs.existsSync(filePath)) {
        console.log("File does not exist");
        return;
    }

    const content = await fsp.readFile(filePath);

    const hash = crypto
        .createHash("sha256")
        .update(content)
        .digest("hex");

    console.log("Hash:", hash);

    const objectFilePath = path.join(objectPath, hash);

    if (fs.existsSync(objectFilePath)) {
        console.log("File already stored");
    } else {
        await fsp.writeFile(objectFilePath, content);
        console.log("File stored in objects folder");
    }

    try {
        await fsp.mkdir(stagingPath, { recursive: true });
        const stageFile = path.join(stagingPath, "stage.json");

        await fsp.writeFile(
            stageFile,
            JSON.stringify({
                [filePath]: hash
            }, null, 2)
        );

        console.log(`File ${filePath} added to staging area`);
    } catch (err) {
        console.log("Error staging file:", err);
    }
}

module.exports = { addFile };