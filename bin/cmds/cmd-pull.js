let Logger = require('../../lib/utils/logger.js').getInstance();

exports.command = 'pull'
exports.desc = 'Pull down db and files assets from host.'

exports.builder = (yargs) => {
  yargs
    .boolean('init')
    .describe('init', "Create config for DB connection")
    .boolean('rebuild')
    .describe('rebuild', "Delete existing config and create new file")
    .boolean('force')
    .alias('force', 'f')
    .describe('force', "Force a new DB download")
    .string('exclude')
    .describe('exclude', "Allow custom excludes")

    .string('file')
    .describe('file', "To download a specific file in the public directory")
    .string('dir')
    .describe('dir', "To download a specific directory in the public directory")
  return yargs
}

exports.handler = function (args) {
  Logger.setVerb(args.v);

  let Pull = require('../../lib/pull/pull.js');
  let pull = new Pull(args);
  pull.run();
}
