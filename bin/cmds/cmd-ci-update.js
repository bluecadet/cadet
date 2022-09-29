let Logger = require('../../lib/utils/logger.js').getInstance();

exports.command = 'ci-update'
exports.desc = 'Install latest CircleCi config files'
exports.builder = (yargs) => {
  yargs.alias('i', 'installer')
  .describe('i', "")
  .default('i', "bc-ci-for-pantheon") // @TODO: remove this after development
  .choices('i', ['bc-ci-for-pantheon'])
  .alias('c', 'ci-version')
  .describe('c', "CI version: semver range, or [branch]-latest")
  .default('c', "1.x-latest") // @TODO: remove this after development
  .boolean('t')
  .alias('t', 'incTestConfig')
  .describe('t', "Include Deafult Test Config Files. (This will destroy any changes you may have made in them) only valid for 1.x")
  .default('t', false)
  .help('h')
  .alias('h', 'help')
  .version()
  .alias('V', 'version')
  .count('verbose')
  .alias('v', 'verbose')
  // .default('v', 3) // @TODO: remove this after development
  .describe('verbose', "Increase the verbosity of messages: 1 for normal output, 2 for more verbose output and 3 for debug")
  .epilog('Copyright 2020')
  .wrap(null)

  return yargs
}
exports.handler = function (args) {
  Logger.setVerb(args.v);

  let CiUpdate = require('../../lib/ci-update/ci-update.js');
  let ciUpdate = new CiUpdate(args);
  ciUpdate.run();

}
