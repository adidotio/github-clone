const express = require("express");
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const Repo = require("../models/Repository");
const Commit = require("../models/Commit");
const {uploadBlob} = require("../utils/storage")

const push = async (req, res) => {
    const repoPath = path.join(process.cwd(), ".Git");
    const commitPath = path.join(repoPath, "commits");
    const objectPath = path.join(repoPath, "objects");
    const headPath = path.join(repoPath, "HEAD");
    const stagePath = path.join(repoPath, "stage");
    
    try{
        const { name } = req.params;
        const repo = await Repo.findOne({ name });

        if(!repo){
            return res.status(404).json({ message: "Repository not found" });
        }

        const latestCommitHash = (await fsp.readFile(headPath, "utf-8")).trim();
        const commitFilePath = path.join(commitPath, `${latestCommitHash}.json`);

        const commitData = JSON.parse(await fsp.readFile(commitFilePath, "utf-8"));
        const commitFiles = commitData.files;
        const blobs = [];

        for(const file of commitFiles){
            const hash = file.hash;
            const hashFilePath = path.join(objectPath, hash);
            const buffer = await fsp.readFile(hashFilePath);
            const s3Key = await uploadBlob(hash, buffer);

            blobs.push({
                filename: file.filename,
                hash, 
                s3Key,
                size: buffer.length
            });
        }

        const commitDoc = await Commit.create({
            repo: repo._id,
            commitHash: latestCommitHash,
            message: commitData.message,
            blobs,
            timestamp: commitData.timestamp
        });

        repo.latestCommit = commitDoc._id;
        await repo.save();

        const stagedFiles = await fsp.readdir(stagePath);
        for(const file of stagedFiles){
            await fsp.unlink(path.join(stagePath, file));
        }

        return res.status(200).json({ message: "Push was successfull" });
    } 
    catch(err){
        return res.status(500).json({ message: "Push failed" });
    }
}

module.exports = push;