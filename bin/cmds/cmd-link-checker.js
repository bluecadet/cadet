exports.command = 'link-checker <site>'
exports.aliases = ["blc"]
exports.desc = 'Checks a site for broken links'
exports.builder = (yargs) => {
  yargs
    .option('exclude', {
      describe: 'A keyword/glob to match links against. Can be used multiple times.',
      default: []
    })
    .option('exclude-external', {
      describe: 'Will not check external links.',
      alias: 'e',
      type: 'boolean',
      default: false
    })
    .option('exclude-internal', {
      describe: 'Will not check internal links',
      alias: 'i',
      type: 'boolean',
      default: false
    })
    .option('filter-level', {
      describe: 'The types of tags and attributes that are considered links \n0: clickable links\n1: 0 + media, iframes, meta refreshes\n2: 1 + stylesheets, scripts, forms\n3: 2 + metadata\n',
      default: 1
    })
    .option('follow', {
      describe: 'Force-follow robot exclusions.',
      alias: 'f',
      type: 'boolean',
      default: false
    })
    .option('get', {
      describe: 'Change request method to GET',
      alias: 'g',
      type: 'boolean',
      default: false
    })
    // .option('input', {
    //   describe: 'URL to an HTML document.',
    //   default: ''
    // })
    .option('host-requests', {
      describe: 'Concurrent requests limit per host.',
      default: 1
    })
    .option('ordered', {
      describe: 'Maintain the order of links as they appear in their HTML document.',
      alias: 'o',
      type: 'boolean',
      default: true
    })
    .option('recursive', {
      describe: 'Recursively scan ("crawl") the HTML document(s).',
      alias: 'r',
      type: 'boolean',
      default: true
    })
    .option('requests', {
      describe: 'Concurrent requests limit.',
      default: Infinity
    })
    // .option('user-agent', {
    //   describe: 'The user agent to use for link checks.',
    //   default: ''
    // })

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

  let LinkChecker = require('../../lib/link-checker/link-checker.js');
  let linkChecker = new LinkChecker(args);
  linkChecker.run();

}
