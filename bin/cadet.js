#!/usr/bin/env node

// Create Global Logger.
let Logger = require('../lib/utils/logger.js').getInstance();

let args = require('yargs')
  .commandDir('cmds')
  .demandCommand()
  .help()
  .epilog('copyright 2020')
  .argv
