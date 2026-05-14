const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const crypto = require("crypto");

function hashFile(content) {
    return crypto.createHash("sha256").update(content).digest("hex");
}

function scanDirectory(dirPath, basePath = dirPath, result = {}){
    const files = fs.readdirSync(dirPath);

    for (const file of files){
        const fullPath = path.join(dirPath, file);
        const relPath = path.relative(basePath, fullPath);

        if(relPath.startsWith(".Git")) continue;
        if(relPath.startsWith("node_modules")) continue;
        if(relPath.startsWith("controllers")) continue;
        if(relPath.startsWith("package")) continue;
        if(relPath.startsWith(".gitignore")) continue;
        if(relPath.startsWith(".gitignore")) continue;
        if(relPath.startsWith("index")) continue;
        if(relPath.startsWith("config")) continue;
        if(relPath.startsWith("test")) continue;

        const stat = fs.statSync(fullPath);

        if(stat.isDirectory()){
            scanDirectory(fullPath, basePath, result);
        } else{
            const content = fs.readFileSync(fullPath);
            const hash = hashFile(content);

            result[relPath] = hash;
        }
    }
    return result;
}

async function getCommitFiles(){
    const repoPath   = path.resolve(process.cwd(), ".Git");
    const headPath   = path.join(repoPath, "HEAD");
    const commitId = await fsp.readFile(headPath, "utf-8");
    const commitPath = path.join(repoPath, "commits");

    if(!commitId){
        console.log("No commits yet");
    }

    const commitJson = path.join(commitPath, `${commitId}.json`);
    const commitData = JSON.parse(await fsp.readFile(commitJson, "utf-8"));
    const currentFiles = commitData.files;

    return currentFiles;
}

function getStatus(wd, stage, head){
    let untracked = [], modified = [], staged = [], deleted = [];

    // Working Directory vs stage
    for (const file in wd) {
        if (!(file in stage)) {
            untracked.push(file);
        } else if (wd[file] !== stage[file]) {
            modified.push(file);
        }
    }

    // Stage vs Working Directory (deleted but not staged)
    for (const file in stage) {
        if (!(file in wd)) {
            deleted.push(file);
        }
    }

    // Stage vs HEAD (staged changes)
    for (const file in stage) {
        if (!(file in head)) {
            staged.push(file); // new file staged
        } else if (stage[file] !== head[file]) {
            staged.push(file); // modified staged
        }
    }

    // HEAD vs stage (staged deletions)
    for (const file in head) {
        if (!(file in stage)) {
            staged.push(file); // deleted and staged
        }
    }
    return { untracked, modified, staged, deleted };
}

function printStatus(status) {
    console.log("On branch main\n");

    if (status.staged.length > 0) {
        console.log("Changes to be committed:");
        status.staged.forEach(f => {
            console.log(`  modified: ${f}`);
        });
        console.log("");
    }

    if (status.modified.length > 0 || status.deleted.length > 0) {
        console.log("Changes not staged for commit:");
        
        status.modified.forEach(f => {
            console.log(`  modified: ${f}`);
        });

        status.deleted.forEach(f => {
            console.log(`  deleted: ${f}`);
        });

        console.log("");
    }

    if (status.untracked.length > 0) {
        console.log("Untracked files:");
        status.untracked.forEach(f => {
            console.log(`  ${f}`);
        });
        console.log("");
    }

    if (
        status.untracked.length === 0 &&
        status.modified.length === 0 &&
        status.staged.length === 0 &&
        status.deleted.length === 0
    ) {
        console.log("nothing to commit, working tree clean");
    }
}

async function gitStatus(){
    const repoPath   = path.resolve(process.cwd(), ".Git");
    const stagePath  = path.join(repoPath, "stage", "stage.json");
    const commitPath = path.join(repoPath, "commits");
    const headPath   = path.join(repoPath, "HEAD");

    const workDirFiles = scanDirectory(process.cwd());

    const existingData = await fsp.readFile(stagePath, "utf-8");
    stagedData = JSON.parse(existingData);

    const commitFiles = await getCommitFiles();

    const status = getStatus(workDirFiles, stagedData, commitFiles);
    printStatus(status);
}

module.exports = {gitStatus};