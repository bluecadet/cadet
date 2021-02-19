let Logger = require('../../lib/utils/logger.js').getInstance();

exports.command = 'setup-project'
exports.aliases = ['init-site']
exports.desc = 'Setup a new project with default composer settings and Pantheon connections'
exports.builder = (yargs) => {
  yargs
    .option('packages', {
      type: 'array',
      describe: 'Which groups of themes and modules.',
      default: ['adminTheme', 'devModules', 'baseBluecadet', 'baseWeb'],
      alias: 'p'
    })
    .help('h')
    .alias('h', 'help')
    .count('verbose')
    .alias('v', 'verbose');

  return yargs
}
exports.handler = function (args) {
  Logger.setVerb(args.v);

  let setupProject = require('../../lib/setup-project/setup-project.js');
  let newProject = new setupProject(args);
  newProject.run();

}
