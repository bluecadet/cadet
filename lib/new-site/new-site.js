const creds = require('../utils/credentials.js');

function NewSite(args) {
  this.args = args;

  this.run = () => {
    console.log('TODO: new-site')
    console.log(args);

    // Gather all required credentials.
    creds.initGithubCreds();

    // Save Credential files.

    // Figure out WP || Drupal.

    // Run WP/Drupal init.


  }
}

module.exports = NewSite;
