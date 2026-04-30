const { timeStamp } = require("console");
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const {v4: uuidv4} = require("uuid");


async function commitFile(msg){
    const repoPath = path.resolve(process.cwd(), ".Git");
    const stagedPath = path.join(repoPath, "stage");
    const commitPath = path.join(repoPath, "commits");
    const stageConfigFile = path.join(stagedPath, "stage.json");
    const headPath = path.join(repoPath, "HEAD");

    try{
        if(!fs.existsSync(stageConfigFile)){
            console.log("Nothing to commit");
            return
        }

        const stagedData = await fsp.readFile(stageConfigFile, "utf-8");
        const files = JSON.parse(stagedData);

        if (Object.keys(files).length === 0) {
            console.log("Stage is empty");
            return;
        }

        const currentHead = (await fsp.readFile(headPath, "utf-8")).trim();
        const parentId = currentHead || null;     // empty if its the first commit

        const commitId = uuidv4();

        const commitData = {
            id: commitId,
            parent: parentId,
            message: msg,
            timestamp: new Date().toISOString(),
            files: files
        };

        await fsp.writeFile(
            path.join(commitPath, `${commitId}.json`),
            JSON.stringify(commitData, null, 2)
        );

        // Update head with new commit
        await fsp.writeFile(headPath, commitId, "utf-8");

        // Clear stage object
        await fsp.writeFile(
            stageConfigFile,
            JSON.stringify({}, null, 2)
        );
        
        console.log(`Commit with CommitId "${commitId}" was created with message "${msg}"`);
    } catch(err){
        console.error("Error in committing the file: ", err);
    }
}

module.exports = {commitFile};