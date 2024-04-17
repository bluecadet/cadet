const pantheon = require('./pantheon.js');
const chalk = require('chalk');
const Spinner = require('cli-spinner').Spinner;
const fs = require("fs");
const yaml = require('js-yaml');
// const { exec } = require('child_process');
const { spawn } = require( 'child_process' );

let spinner = new Spinner({
  text: chalk.blue(`%s Prep for \`ddev pull pantheon\``)
});
spinner.setSpinnerString('⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏');


module.exports = () => {

  const ranDir = process.cwd();

  if (!fs.existsSync(`./.ddev`)) {
    console.log(chalk.red(`Error: .ddev folder does not exist in ${ranDir}`));
    process.exit(1);
  }

  if (!fs.existsSync(`./.ddev/providers/pantheon.yaml`)) {
    console.log(chalk.red(`Error: a providers/pantheon.yaml file does not exist in ${ranDir}/.ddev`));
    process.exit(1);
  }

  const panthConfig = yaml.load(fs.readFileSync('./.ddev/providers/pantheon.yaml', 'utf8'));

  if ( !panthConfig || !panthConfig?.environment_variables?.project) {
    console.log(chalk.red(`Error: \`environment_variables\` and a project value is not set in .ddev/providers/pantheon.yaml`));
    process.exit(1);
  }

  const project = panthConfig.environment_variables.project;

  console.log(chalk.yellow(`Using the Pantheon environment ${chalk.yellow.italic.bold(project)}`));
  console.log(chalk.italic.blackBright(`To change the env, change the value for \`environment_variables\` set in \`.ddev/providers/pantheon.yaml\``));

  spinner.start();

  pantheon.getPantheonDatabaseBackupURL(project, 90, '--element=all')
    .then(() => {
      spinner.stop();
      process.stdout.clearLine();
      process.stdout.cursorTo(0);

      console.log(chalk.yellow(`Site backup ${chalk.yellow.italic.bold(project)} complete`));
      console.log(`\n`);
      console.log(chalk.white(`------------------------------------------------------------------`));
      console.log(chalk.white(`------------------ Running \`ddev pull pantheon\` ------------------`));
      console.log(chalk.white(`------------------------------------------------------------------`));
      console.log(`\n`);

      // return;

      const child = spawn('ddev', ['pull', 'pantheon'], {
        stdio: 'inherit'
      });

      child.on('close', (code) => {
        console.log(chalk.green('\n🚀 Cadet over and out!'));
      });

      // child.stdout.on('data', (data) => {
      //   console.log(`stdout: ${data}`);
      // });

      // use child.stdout.setEncoding('utf8'); if you want text chunks
      // child.stdout.on('data', (chunk) => {
      //   // data from standard output is here as buffers
      //   console.log(chunk.toString());
      // });

      // since these are streams, you can pipe them elsewhere
      // child.stderr.pipe(dest);



      // exec(`ddev pull pantheon`, (err, stdout, stderr) => {
      //   console.log(err, stdout, stderr);
      // });
    });
}