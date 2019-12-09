
let Logger = require('../../lib/utils/logger.js').getInstance();

exports.command = 'comp:install:scaffold'
exports.desc = 'Use composer to install themes and modules/plugins for Drupal and WP.'
exports.builder = (yargs) => {
  yargs
  .option('cms', {
    describe: 'Which CMS/Platform.',
    alias: 'c',
    choices: ['D8', 'WP'],
    default: "D8"
  })
  .option('packages', {
    type: 'array',
    describe: 'Which groups of themes and modules.',
    alias: 'p'
  })
  .help('h')
  .alias('h', 'help')
  .count('verbose')
  .alias('v', 'verbose');

  return yargs;
}
exports.handler = function (args) {
  Logger.setVerb(args.v);

  let Composer = require('../../lib/comp-install-scaffold/comp-install-scaffold.js');
  let composer = new Composer(args);
  composer.run();
}
