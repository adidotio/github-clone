const yargs = require("yargs");
const {hideBin} = require("yargs/helpers");

const {initRepo} = require("./controllers/init");
const {addFile} = require("./controllers/add");
const {commitFile} = require("./controllers/commit");
const {pushRepo} = require("./controllers/push");
const {pullRepo} = require("./controllers/pull");
const {revertChanges} = require("./controllers/revert");

yargs(hideBin(process.argv))
.command("init", "Initialise a new repositry", {}, initRepo)
.command("add <file>", "To stage the file in the repositry", (yargs) => {yargs.positional("file", {describe: "File has been sent to the staging area", type: "string"})}, (argv) => {addFile(argv.file)})
.command("commit <msg>", "To commit changes in the repositry", (yargs) => {yargs.positional("msg", {describe: "Commit message", type: "string"})}, (argv) => {commitFile(argv.msg)})
.command("push", "Push changes in the repositry", {}, pushRepo)
.command("pull", "Pull changes from the repositry", {}, pullRepo)
.command("revert <commitId>", "Revert through commit Id", (yargs) => {yargs.positional("file", {describe: "Commit ID to revert changes", type: "string"})}, revertChanges)
.demandCommand(1, "Need at least one command").help().argv;