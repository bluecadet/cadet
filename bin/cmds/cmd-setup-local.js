let Logger = require('../../lib/utils/logger.js').getInstance();

exports.command = 'setup-local'
exports.aliases = ['new-site']
exports.desc = 'Setup a local site'
exports.builder = (yargs) => {
  yargs
    .help('h')
    .alias('h', 'help')
    .count('verbose')
    .alias('v', 'verbose');

  return yargs
}
exports.handler = function (args) {
  Logger.setVerb(args.v);

  let SetupLocal = require('../../lib/setup-local/setup-local.js');
  let newLocal = new SetupLocal(args);
  newLocal.run();
}
