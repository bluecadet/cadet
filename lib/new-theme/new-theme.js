let log = require('../utils/logger.js').getInstance().log;
const creds = require('../utils/credentials.js');
const fsx = require('fs-extra');
const qoa = require('qoa');

const path = require('path');

const builder = require('./build.js');

function NewTheme(args) {
  this.args = args;

  this.run = () => {
    console.log('TODO: new-theme')
    console.log(args);

    let config = {
      curPath: process.cwd(),
      baseTempDir: path.join(creds.tmpDir, 'bcnew'),
      themeType: this.args.t
    };

    config.isPantheon = fsx.existsSync(`${config.curPath}/web`);
    config.isDrupal = config.isPantheon ? fsx.existsSync(`${config.curPath}/web/themes`) : fsx.existsSync(`${config.curPath}/core`);
    config.isWordPress = config.isPantheon ? fsx.existsSync(`${config.curPath}/web/wp`) : fsx.existsSync(`${config.curPath}/wp-content`);

    log(config);

    // Create a directory for temp storage
    fsx.ensureDirSync(config.baseTempDir);

    // Setup theme and module dirs
    if (config.isDrupal) {

      if (config.isPantheon) {
        config.themePath = `${config.curPath}/web/themes/custom`;
        config.modulePath = `${config.curPath}/web/modules/custom`;
        config.gulpThemePath = `web/themes/custom`;
        config.gulpModulesPath = `web/modules/custom`;
      } else {
        config.themePath = `${config.curPath}/themes/custom`;
        config.modulePath = `${config.curPath}/modules/custom`;
        config.gulpThemePath = `themes/custom`;
        config.gulpModulesPath = `modules/custom`;
      }

    } else if (config.isWordPress) {

      if (config.isPantheon) {
        config.themePath = `${config.curPath}/web/wp-content/themes`;
        config.modulePath = `${config.curPath}/web/wp-content/plugins`;
        config.gulpThemePath = `web/wp-content/themes`;
        config.gulpModulesPath = `web/wp-content/plugins`;
      } else {
        config.themePath = `${config.curPath}/wp-content/themes`;
        config.modulePath = `${config.curPath}/wp-content/plugins`;
        config.gulpThemePath = `wp-content/themes`;
        config.gulpModulesPath = `wp-content/plugins`;
      }

    }

    // Prompts
    const settings = [
      {
        type: 'input',
        query: 'Project Name:',
        handle: 'project'
      }
    ];


    qoa.prompt(settings)
      .then(response => {
        let projectName = response.project;
        let projectMachineName = projectName.toLowerCase();
        projectMachineName = projectMachineName.replace(/-/g, '_');
        projectMachineName = projectMachineName.replace(/ /g, '_');

        config.project = projectMachineName;
        config.project_hyphenated = projectMachineName.replace(/_/g, '-');
        config.project_title_case = projectName.replace(/\w\S*/g,
          function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
          }
        );
        config.tempDir = `${config.baseTempDir}/${config.project}`;
        fsx.ensureDirSync(config.tempDir);
        fsx.emptyDirSync(config.tempDir);


        // Build out project
        builder(config)
          .then(() => {
            // Remove Temp Files.
            // TODO: I don't think this ever gets called...
            fsx.removeSync(config.baseTempDir);
          });
      });








  }
}

module.exports = NewTheme;
