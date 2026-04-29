const fs = require("fs");
const fsp = fs.promises;
const path = require("path");

async function revertChanges(commitId){
    const repoPath = path.resolve(process.cwd(), ".Git");
    const stagedPath = path.join(repoPath, "stage", "config.json");
    const commitPath = path.join(repoPath, "commits");
    const objectPath = path.join(repoPath, "objects");
    const commitConfig = path.join(commitPath, `${commitId}.json`);
    
    try{
        if(!fs.existsSync(commitConfig)){
            console.log("No commits to revert changes");
            return
        }

        const commitData = JSON.parse(
            await fsp.readFile(commitConfig, "utf-8")
        );

        const files = commitData.files;
        console.log("Files in commit:", files)

        for(const file in files){
            const hash = files[file];
            console.log("Hash:", hash)

            const content = await fsp.readFile(
                path.join(objectPath, hash)
            );

            await fsp.writeFile(file, content);
            console.log(`${file} is being reverted back to old state`);
        }
    } catch(err){
        console.log("Error in revert: ", err);
    }
} 

module.exports = {revertChanges};