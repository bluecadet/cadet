const creds = require('../utils/credentials.js');
const runPull = require('./lib/run.js');

function Pull(args) {
  this.args = args;

  this.run = () => {

    /**
     * cadet pull init
     * ---------------
     * Create config for DB connection in `.cadet/creds/local-db.json`
     *
     */
    if (this.args && this.args._.includes('init')) {

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
    else if (this.args && this.args._.includes('rebuild')) {

      creds.initPanthCreds()
        .then((response) => {
          return creds.clearLocalDbCreds();
        })
        .then((response) => {
          return creds.initLocalDbCreds();
        });

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
