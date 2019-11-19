#!/usr/bin/env node

require('yargs')
  .commandDir('cmds')
  .demandCommand()
  .help()
  .epilog('copyright 2019')
  .argv


