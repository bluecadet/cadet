let log = require('../utils/logger.js').getInstance().log;
const creds = require('../utils/credentials.js');
const setCircleCMS = require('./shared/circle-ci-setup');

function SetupProject(args) {
  this.args = args;

  this.run = () => {
    // console.log(args);

    // github credentials (global)
    creds.initGithubCreds()
      .then((response) => {
        // Pantheon credentials (site)
        return creds.initPanthCreds();
      }).then((response) => {
        // Local Database credentials (site)
        return creds.initLocalDbCreds();
      }).then((response) => {
        log(response);

        // Run WP/Drupal init.
        switch (response.format) {
          case 'Drupal 8: Circle CI':
          case 'Drupal 8: Default':
            let setupProjectD8 = require('./d8/setup-project-d8.js');
            new setupProjectD8(this.args).SetupProjectSetup();
            setCircleCMS('D8');
            break;

          case 'WordPress: Circle CI':
          case 'WordPress: Default':
            let setupProjectWP = require('./wp/setup-project-wp.js');
            setCircleCMS('WP')
              .then(() => {
                setupProjectWP();
              });
            break;

          default:
            return
        }

      }).catch((error) => {
        log(error, 2);
      });
  }
}

module.exports = SetupProject;
