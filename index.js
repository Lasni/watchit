#!/usr/bin/env node

const chokidar = require("chokidar");
const { debounce } = require("lodash");
const prog = require("caporal");
const fs = require("fs");
const { spawn } = require("child_process");
const chalk = require("chalk");

prog
  .version("1.0.0")
  .argument("[filename]", "Name of a file to execute")
  .action(async (args) => {
    const name = args.filename || "index.js";

    try {
      await fs.promises.access(name);
    } catch (err) {
      throw new Error(`Could not find the file ${name}`, err);
    }

    let proc;
    const start = debounce(() => {
      if (proc) {
        proc.kill();
      }
      console.log(chalk.bold.red(">>> Starting process"));
      proc = spawn("node", [name], { stdio: "inherit" });
    }, 100);

    chokidar
      .watch(".", {
        ignored: /node_modules/,
      })
      .on("add", start)
      .on("change", start)
      .on("unlink", start);
  });
prog.parse(process.argv);
