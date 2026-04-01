const fs = require("fs").promises;
const path = require("path");

async function addFile(filePath){
    const initPath = path.resolve(process.cwd(), ".Git");
    const stagingPath = path.join(initPath, "stages");

    try{
        await fs.mkdir(stagingPath, {recursive: true});
        const fileName = path.basename(filePath);
        await fs.copyFile(filePath, path.join(stagingPath, fileName));

        console.log(`File ${fileName} is added to the staging area`);
    } catch(err){
        console.log("Error in staging the file: ", err);
    }
} 

module.exports = {addFile};