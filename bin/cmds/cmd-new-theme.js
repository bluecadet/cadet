let Logger = require('../../lib/utils/logger.js').getInstance();

exports.command = 'new-theme'
exports.desc = 'Install new theme, either Drupal or Wordpress'
exports.builder = (yargs) => {
  yargs
    // .option('theme-type', {
    //   describe: 'What type pf theme to create. Normal/Admin',
    //   default: 'normal',
    //   choices: ['normal', 'admin'],
    //   alias: 't'
    // })
    .help('h')
    .alias('h', 'help')
    .count('verbose')
    .alias('v', 'verbose');
  return yargs
}
exports.handler = function (args) {
  Logger.setVerb(args.v);

  let NewTheme = require('../../lib/new-theme/new-theme.js');
  let newTheme = new NewTheme(args);
  newTheme.run();
}
