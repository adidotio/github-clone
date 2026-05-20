const supabaseClient = require("../config/supabase");
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");


// Helper to upload the files into supabase (For push command)
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

    // take files from commit  
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


// Helper to download files from supabase (For pull and clone commands)
const downloadBlob = async (s3Key) => {
    const repoPath = path.resolve(process.cwd(), ".Git");
    const objectPath = path.join(repoPath, "objects");

    // Extract hash from s3Key
    const hash = path.basename(s3Key, ".blob");

    const localObjectPath = path.join(objectPath, hash);

    if(fs.existsSync(localObjectPath)){
        console.log("Blob already cached locally");
        return await fsp.readFile(localObjectPath);
    }

    const { data, error } = await supabaseClient.storage.from('git-blobs').download(s3Key);     // this only returns blob object need to convert it in the buffer

    if(error){
        throw error;
    } else{
        console.log("File download successfully !!");
    }

    // blob -> array buffer -> buffer
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await fsp.writeFile(localObjectPath, buffer);
    console.log("File cached as well");
    return buffer;
}

module.exports = {uploadBlob, downloadBlob};