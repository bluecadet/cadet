const fs = require('fs');
const fsx = require('fs-extra');
const dlrepo = require('download-git-repo');
const chalk = require('chalk');
const recursiveRenameSync = require('./recursiveRenameSync.js');
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
let moduleList = [];

function prepareTheme(config) {

  return new Promise((resolve, reject) => {
    let tmpTheme;

    if (config.isDrupal && config.themeType == "normal") {
      tmpTheme = `${config.tempDir}/builds/drupal`;
    } else if (config.isDrupal && config.themeType == "admin") {
      tmpTheme = `${config.tempDir}/builds/drupal-admin`;
    } else if (config.isWordPress) {
      tmpTheme = `${config.tempDir}/builds/wordpress`;
    }

    recursiveRenameSync(tmpTheme, config);

    fsx.ensureDirSync(config.themePath);
    fsx.copySync(tmpTheme, `${config.themePath}/${config.project}`, { overwrite: true });

    console.log(chalk.green('Theme ready'));

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
    let gulpConfigFile = `${rootSrc}/.projectconfig.js`;
    let fractalConfigFile = `${rootSrc}/fractal.js`;
    let result;

    // Gulp rewrites
    let gulpData = fs.readFileSync(gulpConfigFile, 'utf8');
    result = gulpData.replace(/web\/themes\/custom/g, config.gulpThemePath);
    result = result.replace(/web\/modules\/custom/g, config.gulpModulesPath);
    result = result.replace(/bluecadet_base/g, config.project);
    fs.writeFileSync(gulpConfigFile, result, 'utf8');

    result = '';

    // Fractal rewrites
    let fractalFileData = fs.readFileSync(fractalConfigFile, 'utf8');
    result = fractalFileData.replace(/BC__BASE__THEMEDIR/g, config.gulpThemePath.substr(0));
    result = result.replace(/BC__BASE__NAME/g, config.project_title_case);
    result = result.replace(/BC__BASE/g, config.project);
    fs.writeFileSync(fractalConfigFile, result, 'utf8');

    // Copy Files
    fsx.copySync(rootSrc, `${config.curPath}`, { overwrite: true });

    console.log(chalk.green('Root ready'));

    resolve(config);

  });

}

module.exports = function (config) {

  return new Promise((resolve, reject) => {

    // Download Base Theme
    console.log(chalk.blue('Downloading assets'));

    dlrepo('bluecadet/bc-base-themes', `${config.tempDir}`, { clone: true }, err => {
      if (err) {
        console.log(chalk.red(`ERROR @ downloading base theme`));
        throw Error(err);
      }

      prepareTheme(config)
        .then(() => {
          prepareModules(config)
            .then(() => {
              prepareRoot(config)
                .then(() => {
                  console.log(chalk.blue('Running npm install'));

                  var change = spawn('cd', [`${config.curPath}`]);
                  var installer = spawn('npm', ['install']);

                  change.stdout.pipe(installer.stdin);
                  installer.stdout.pipe(process.stdin);

                  installer.on('data', function (data) {
                    console.log(data.toString('utf8'));
                  });

                  installer.on('close', function (code) {
                    console.log(chalk.blue('npm install complete'));
                  });

                });
            });
        });

    });

    resolve(config);

  });
}
