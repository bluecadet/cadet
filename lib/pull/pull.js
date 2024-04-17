// TODO Add log function to errors

const creds = require('../utils/credentials.js');
const runPull = require('./lib/run.js');
const runFiles = require('./lib/files.js');
const runDDEV = require('./lib/ddev.js');
const argv = require('yargs').argv;

function Pull(args) {
  this.args = args;

  this.run = () => {

    if (argv.ddev) {
      runDDEV();
    }

    // return;

    /**
     * cadet pull init
     * ---------------
     * Create config for DB connection in `.cadet/creds/local-db.json`
     *
     */
    else if (argv.init) {

      creds.initPanthCreds()
        .then((response) => {
          return creds.initLocalDbCreds();
        });

    }
    /**
     * cadet pull rebuild
     * ------------------
     * Delete existing config and create new file `.cadet/creds/local-db.json`
     *
     */
    else if (argv.rebuild) {

      creds.initPanthCreds()
        .then((response) => {
          return creds.clearLocalDbCreds();
        })
        .then((response) => {
          return creds.initLocalDbCreds();
        });

    }
    /**
     * cadet pull file
     * cadet pull dir
     * ------------------
     * Pull specific file or dir
     *
     */
    else if (argv.file || argv.dir) {
      runFiles();
    }
    /**
     * cadet pull
     * ----------
     * Run the pull, get db and/or files
     *
     */
    else {
      runPull();
    }
  }
}

module.exports = Pull;
