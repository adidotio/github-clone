require('dotenv').config()
const yargs = require("yargs");
const {hideBin} = require("yargs/helpers");

// All the Git CLI commands
const {initRepo} = require("./controllers/cli_command/init");
const {addFile} = require("./controllers/cli_command/add");
const {commitFile} = require("./controllers/cli_command/commit");
const {pushRepo} = require("./controllers/cli_command/push");
const {pullRepo} = require("./controllers/cli_command/pull");
const {revertChanges} = require("./controllers/cli_command/revert");
const {gitStatus} = require("./controllers/cli_command/status");
const {gitLog} = require("./controllers/cli_command/log");

yargs(hideBin(process.argv))
.command("init", "Initialise a new repositry", {}, initRepo)
.command("add <file>", "To stage the file in the repositry", (yargs) => {yargs.positional("file", {describe: "File has been sent to the staging area", type: "string"})}, (argv) => {addFile(argv.file)})
.command("commit <msg>", "To commit changes in the repositry", (yargs) => {yargs.positional("msg", {describe: "Commit message", type: "string"})}, (argv) => {commitFile(argv.msg)})
.command("push", "Push changes in the repositry", {}, pushRepo)
.command("pull", "Pull changes from the repositry", {}, pullRepo)
.command("revert <commitId>", "Revert through commit Id", (yargs) => {yargs.positional("file", {describe: "Commit ID to revert changes", type: "string"})}, (argv) => {revertChanges(argv.commitId)})
.command("status", "Check all the untracked changes", {}, gitStatus)
.command("log", "Track branch commit history", {}, gitLog)
.demandCommand(1, "Need at least one command").help().argv;