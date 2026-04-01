const fs = require("fs").promises;
const path = require("path");
const {v4: uuidv4} = require("uuid");


async function commitFile(msg){
    const repoPath = path.resolve(process.cwd(), ".Git");
    const stagedPath = path.join(repoPath, "stages");
    const commitPath = path.join(repoPath, "commits");

    try{
        const commitId = uuidv4();
        const commitDir = path.join(commitPath, commitId);
        await fs.mkdir(commitDir, {recursive: true});
        const files = await fs.readdir(stagedPath);

        for(const file of files){
            await fs.copyFile(path.join(stagedPath, file), path.join(commitDir, file));
        }

        await fs.writeFile(path.join(commitDir, "commit.json"), JSON.stringify({message: msg, date: new Date().toISOString()}));
        console.log(`Commit with CommitId "${commitId}" was created with message "${msg}"`);
    } catch(err){
        console.error("Error in committing the file: ", err);
    }
}

module.exports = {commitFile};