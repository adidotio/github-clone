const supabaseClient = require("../config/supabase");
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");

const uploadBlob = async (hash, buffer) => {
    const repoPath = path.resolve(process.cwd(), ".Git");
    const objectPath = path.join(repoPath, "objects");
    const headPath = path.join(repoPath, "HEAD");
    const commitPath = path.join(repoPath, "commits");

    const s3Key = `objects/${hash}.blob`;
    console.log(s3Key);

    const { data : existingFiles } = await supabaseClient.storage.from('git-blobs').list('objects', { search: `${hash}.blob` });
    
    if(existingFiles && existingFiles.length > 0){
        console.log("File already exists");
        return s3Key;
    }

    const { error } = await supabaseClient.storage.from('git-blobs').upload(`objects/${hash}.blob`, buffer, { contentType: "application/octet-stream" });

    if(error){
        throw error;
    } 

    console.log("Blob uploaded");
    return s3Key;

    // try{
    //     const currentHead = (await fsp.readFile(headPath, "utf-8")).trim();
    //     const parentId = currentHead || null; 

    //     const commitJson = path.join(commitPath, `${parentId}.json`);
    //     if (!fs.existsSync(commitJson)) {
    //         console.log("Commit not found:", parentId);
    //         return;
    //     }
    //     const commitData = JSON.parse(await fsp.readFile(commitJson, "utf-8"));
    //     const commitFiles = commitData.files;

    //     for(const file in commitFiles){  
    //         const hashed = commitFiles[file];
    //         const hashFile = path.join(objectPath, hashed);
    //         const fileBuffer = await fsp.readFile(hashFile);

    //         const { data, error } = await supabaseClient.storage.from('git-blobs').upload(`${hashed}.blob`, fileBuffer, { upsert:true });

    //         if(error){
    //             console.error("Error in uploading the file", error);
    //         } else{
    //             console.log("File uploaded successfully");
    //             console.log(data);
    //         }
    //     }
    // } catch(err){
    //     console.log("Cannot upload the file: ", err);
    // }
    
}

module.exports = uploadBlob;