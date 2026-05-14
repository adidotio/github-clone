const fs  = require("fs");
const fsp = fs.promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

async function revertChanges(commitId) {
    const repoPath   = path.resolve(process.cwd(), ".Git");
    const stagePath  = path.join(repoPath, "stage", "stage.json");  
    const commitPath = path.join(repoPath, "commits");
    const objectPath = path.join(repoPath, "objects");
    const headPath   = path.join(repoPath, "HEAD");

    try {
        const commitFile = path.join(commitPath, `${commitId}.json`);
        if (!fs.existsSync(commitFile)) {
            console.log("Commit not found:", commitId);
            return;
        }
        const commitData = JSON.parse(await fsp.readFile(commitFile, "utf-8"));

        const parentId = commitData.parent;
        if (!parentId) {
            console.log("This is the initial commit — nothing to revert to.");
            return;
        }

        const parentFile = path.join(commitPath, `${parentId}.json`);
        const parentData = JSON.parse(await fsp.readFile(parentFile, "utf-8"));

        const currentFiles = commitData.files;   // state being undone
        const parentFiles  = parentData.files;   // state to restore to

        for (const file in parentFiles) {
            const content = await fsp.readFile(path.join(objectPath, parentFiles[file]));
            await fsp.writeFile(file, content);
            console.log(`Restored: ${file}`);
        }

        for (const file in currentFiles) {
            if (!parentFiles[file] && fs.existsSync(file)) {
                await fsp.unlink(file);
                console.log(`Deleted: ${file}`);
            }
        }

        const revertCommitId = uuidv4();
        const revertData     = {
            id        : revertCommitId,
            parent    : commitId,
            message   : `Revert "${commitData.message}"`,
            timestamp : new Date().toISOString(),
            files     : parentFiles
        };

        await fsp.writeFile(
            path.join(commitPath, `${revertCommitId}.json`),
            JSON.stringify(revertData, null, 2)
        );

        await fsp.writeFile(headPath, revertCommitId, "utf-8");
        await fsp.writeFile(stagePath, JSON.stringify({}, null, 2));

        console.log(`Revert successful! New HEAD: ${revertCommitId}`);
    } catch (err) {
        console.error("Error in revert:", err);
    }
}

module.exports = { revertChanges };