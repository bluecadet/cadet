let Logger = require('../../lib/utils/logger.js').getInstance();

exports.command = 'githubLabel'
exports.desc = 'Add/Update labels in a repo.'
exports.builder = (yargs) => {
  yargs
    .option('r', {
      describe: "Which github repo. ex. 'blucadet/cadet'",
      requiresArg: true,
      alias: 'repo'
    })

    .option('p', {
      type: 'array',
      describe: 'Which groups of themes and modules.',
      choices: ['defaults', 'priorities', 'teams', 'components', 'estimates'],
      alias: 'label-packages'
    })

    .option('l', {
      type: 'array',
      describe: 'With "components", list labels to create.',
      alias: 'labels'
    })

    .help('h')
    .alias('h', 'help')
    .version()
    .alias('V', 'version')
    .count('verbose')
    .alias('v', 'verbose')
    .describe('verbose', "Increase the verbosity of messages: 1 for normal output, 2 for more verbose output and 3 for debug")
    .epilog('Copyright 2020')
    .wrap(null)

  return yargs
}

exports.handler = function (args) {
  Logger.setVerb(args.v);

  let GithubLabel = require('../../lib/github-label/github-label.js');
  let githubLabel = new GithubLabel(args);
  githubLabel.run();

}
