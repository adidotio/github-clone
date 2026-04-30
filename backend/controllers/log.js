const fs = require("fs");
const path = require("path");

function getCommitId(){
    const repoPath = path.resolve(process.cwd(), ".Git");
    const headPath = path.join(repoPath, "HEAD");
    let commitId = fs.readFileSync(headPath, "utf-8").trim();

    if (commitId.startsWith("ref: ")) {
        const refPath = commitId.replace("ref: ", "").trim();
        commitId = fs.readFileSync(path.join(repoPath, refPath), "utf-8").trim();
    }

    return commitId;
} 

function getCommit(commitId) {
    const repoPath = path.resolve(process.cwd(), ".Git");
    const commitPath = path.join(repoPath, "commits", `${commitId}.json`);

    if (!fs.existsSync(commitPath)) return null;

    return JSON.parse(fs.readFileSync(commitPath, "utf-8"));
}

function getCommitHistory() {
    const commits = [];
    let currentId = getCommitId();

    while (currentId) {
        const commit = getCommit(currentId);
        if (!commit) break;
        commits.push(commit);
        currentId = commit.parent;
    }

    return commits; 
}

function printLog(commits) {
    commits.forEach(commit => {
        console.log(`commit ${commit.id}`);
        console.log(`Date: ${new Date(commit.timestamp).toString()}`);
        console.log(`\n    ${commit.message}\n`);
    });
}

function gitLog(){
    try{
        const commits = getCommitHistory();
        printLog(commits);
    } catch(err){
        console.log("Error fetching logs: ", err);
    }
}

module.exports = { gitLog };