let log = require('../../utils/logger.js').getInstance().log;
const chalk = require('chalk');
const fs = require('fs');
const fsx = require('fs-extra');
const path = require('path');

module.exports = (cms) => {

  return new Promise((resolve, reject) => {

    const circleFile = path.join(process.cwd(), '/.circleci/config.yml');

    // Check if there is a circle ci file
    fsx.pathExists(circleFile)
    .then(exists => {

      if ( exists ) {

        try {
          // Replace the CMS_PLATFORM var with the arg provided in the function call
          let doc = fs.readFileSync(circleFile, 'utf8').toString();
          doc = doc.replace(new RegExp(/CMS_PLATFORM:.*/g), `CMS_PLATFORM: ${cms}`);
          try {
            fs.writeFileSync(circleFile, doc);
            log(chalk.blue(`...updated circle ci CMS_PLATFORM value to ${cms}...`), 0);
            resolve();
          } catch (e) {
            console.log(e);
          }
        } catch (e) {
          console.log(e);
          log(chalk.yellow(`...you will need to manually update the circle ci CMS_PLATFORM value to ${cms}...`), 0);
          resolve();
        }
      }

    });

  });

}