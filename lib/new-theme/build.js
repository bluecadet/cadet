const fs = require('fs');
const { join } = require('path')
const fsx = require('fs-extra');
const dlrepo = require('download-git-repo');
const chalk = require('chalk');
const recursiveRenameSync = require('./recursiveRenameSync.js');
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const { MultiSelect } = require('enquirer');
const extend = require('util')._extend;
let moduleList = [];
let usedThemeNames = [];
let nameIteration = 0;

function prepareAllThemes(config, themeSelections, buildsDir) {

  return new Promise((resolve, reject) => {

    themeSelections.forEach(themeName => {
      let themeConfig  = extend({}, config);
      let revThemeName = themeName.includes('admin') ? `${themeConfig.project}-admin` : themeConfig.project;
      revThemeName = revThemeName.replace(/ /g, '_');

      if ( usedThemeNames.includes(revThemeName) ) {
        nameIteration++;
        revThemeName = `${revThemeName}-${nameIteration}`;
      }

      usedThemeNames.push(revThemeName);

      themeConfig.project            = revThemeName;
      themeConfig.project_hyphenated = revThemeName.replace(/_/g, '-');
      themeConfig.project_title_case = revThemeName.replace(/\w\S*/g,
        function (txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
      );

      prepareTheme(`${buildsDir}/${themeName}`, themeConfig, revThemeName)
        .catch((err) => {
          console.log(err);
          reject();
        });
    });

    let mutatedConfig  = extend({}, config);
    mutatedConfig.multi_theme_string = "'" + usedThemeNames.join("', '") + "'";

    resolve(mutatedConfig);
  });
}

function prepareTheme(themeDir, config, themeName) {

  return new Promise((resolve, reject) => {
    // Make a copy of the directory in case multiple themes are installed
    const themeCopyDir = `${config.tempDir}/${config.project}`;
    fsx.copySync(themeDir, themeCopyDir, { overwrite: true });

    // Rename files and strings in theme
    recursiveRenameSync(themeCopyDir, config);

    // Copy new theme into the theme directory
    fsx.ensureDirSync(config.themePath);
    fsx.copySync(themeCopyDir, `${config.themePath}/${config.project}`, { overwrite: true });

    console.log(chalk.green(`"${themeName}" theme ready`));

    resolve(config);

  });
}

function prepareModules(config) {

  return new Promise((resolve, reject) => {

    // renameDirContentRecursive(config.modulePath, config);
    recursiveRenameSync(config.modulePath, config);

    console.log(chalk.green('Modules ready'));

    resolve(config);

  });

}

function prepareRoot(config) {

  return new Promise((resolve, reject) => {

    let rootSrc = `${config.tempDir}/builds/root`;
    let projectConfig = `${rootSrc}/.projectconfig.js`;
    let fractalConfigFile = `${rootSrc}/fractal.js`;
    let result;

    // Gulp rewrites
    if (fs.existsSync(projectConfig)) {
      let gulpData = fs.readFileSync(projectConfig, 'utf8');
      result = gulpData.replace(/web\/themes\/custom/g, config.gulpThemePath);
      result = result.replace(/web\/modules\/custom/g, config.gulpModulesPath);
      result = result.replace(/bluecadet_base/g, config.project);
      if (config.multi_theme_string) {
        result = result.replace(/const THEME_GULP_DIR = BASE_THEME;/, '');
        result = result.replace(/THEME_GULP_DIR/g, config.multi_theme_string);
      }
      fs.writeFileSync(projectConfig, result, 'utf8');
    }

    result = '';

    // Fractal rewrites
    if (fs.existsSync(fractalConfigFile)) {
      let fractalFileData = fs.readFileSync(fractalConfigFile, 'utf8');
      result = fractalFileData.replace(/BC__BASE__THEMEDIR/g, config.gulpThemePath.substr(0));
      result = result.replace(/BC__BASE__NAME/g, config.project_title_case);
      result = result.replace(/BC__BASE/g, config.project);
      fs.writeFileSync(fractalConfigFile, result, 'utf8');
    }

    // Copy Files
    fsx.copySync(rootSrc, `${config.curPath}`, { overwrite: true });

    console.log(chalk.green('Root ready'));

    resolve(config);

  });

}


module.exports = function (config) {

  return new Promise((resolve, reject) => {

    // Download Base Theme
    console.log(chalk.blue('...Downloading assets...'));

    dlrepo('bluecadet/bc-base-themes', `${config.tempDir}`, { clone: true }, err => {
      if (err) {
        console.log(chalk.red(`ERROR @ downloading base theme`));
        throw Error(err);
      }

      const themesList = [];
      const buildsDir   = `${config.tempDir}/builds`;
      const baseList   = fs.readdirSync(buildsDir).filter(f => fs.statSync(join(buildsDir, f)).isDirectory());

      baseList.forEach(t => {
        if (t !== 'root') {
          themesList.push({
            name: t,
            value: t,
          });
        }
      });

      const prompt = new MultiSelect({
        name: 'value',
        message: `${chalk.cyan('Use SPACEBAR to select theme(s) and then press Enter')}`,
        choices: themesList
      });

      prompt.run()
        .then(themeSelections => {

          if (themeSelections.length === 0) {
            console.log(chalk.red(`No items selected, please try again (use spacebar to select theme!)`));
            throw Error(err);
          }

          prepareAllThemes(config, themeSelections, buildsDir)
            .then((themesConfig) => {
              prepareModules(themesConfig)
                .then((modulesConfig) => {
                  prepareRoot(modulesConfig)
                    .then(() => {
                      console.log(chalk.blue('...running npm install...'));

                      var change = spawn('cd', [`${modulesConfig.curPath}`]);
                      var installer = spawn('npm', ['install']);

                      change.stdout.pipe(installer.stdin);
                      installer.stdout.pipe(process.stdin);

                      installer.on('data', function (data) {
                        console.log(data.toString('utf8'));
                      });

                      installer.on('close', function (code) {
                        console.log(chalk.green('npm install complete! 🎉'));
                      });

                      resolve();
                    })
                })
            });

        })
        .catch(console.error);

    });

    resolve(config);

  });
}
