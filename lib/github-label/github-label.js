let log = require('../utils/logger.js').getInstance().log;
const chalk = require('chalk');
const creds = require('../utils/credentials.js');
const GitHub = require('github-api');

function GithubLabel(args) {
  this.args = args;

  this.gh = null;
  this.gh_user = null;
  this.gh_repo = null;

  this.run = () => {
    // log(args);

    // parse repo name.
    let split_repo = this.args.r.split("/");
    this.gh_user = split_repo[0];
    this.gh_repo = split_repo[1];

    // github credentials (global)
    creds.initGithubCreds()
      .then((response) => {
        // log(response);

        // Initiate github API.
        if (response.githubMachineToken) {
          this.gh = new GitHub({
            token: response.githubMachineToken
          });
        } else {
          this.gh = new GitHub({
            username: response.githubUsername,
            password: response.githubPassword
          });
        }

        // Validate repo.

        args.labelPackages.forEach(el => {
          switch (el) {
            case "defaults":
              this.defaultsPackage();
              break;
            case "components":
              this.componentsPackage();
              break;
            case "priorities":
              this.prioritiesPackage();
              break;
            case "teams":
              this.teamsPackage();
              break;
          }
        });

      }).catch((error) => {
        log(error, 2);
      });
  }

  this.defaultsPackage = () => {

    let Issue = this.gh.getIssues(this.gh_user, this.gh_repo);
    Issue.listLabels({})
      .then((response) => {
        // log(response);
        let labels = response.data;
        let clientQuestion = false;
        labels.forEach(label => {
          // log(label);

          switch (label.name) {
            // Remove "good first issue", "help wanted", "invalid"
            case "good first issue":
            case "help wanted":
            case "invalid":
              Issue.deleteLabel(label.name);
              break;

            // Update "bug", "documentation", "enhancement", "question", "wontfix"
            case "bug":
              Issue.editLabel(
                label.name,
                {
                  name: ":bug: bug",
                  color: "d73a4a",
                }
              );
              break;
            case "documentation":
              Issue.editLabel(
                label.name,
                {
                  name: ":page_facing_up: documentation",
                  color: "0075ca",
                }
              );
              break;
            case "enhancement":
              Issue.editLabel(
                label.name,
                {
                  name: ":sparkles: enhancement",
                  color: "63c6c6",
                }
              );
              break;
            case "question":
              Issue.editLabel(
                label.name,
                {
                  name: ":question: internal question",
                  color: "d4daef",
                  description: "Further information is requested",
                }
              );
              break;
            case "client question":
              Issue.editLabel(
                label.name,
                {
                  name: ":question: client question",
                  color: "d4daef",
                  description: "Further information is requested",
                }
              );
              clientQuestion = true;
              break;

            case ":question: client question":
              clientQuestion = true;
              break;

            case "wontfix":
              Issue.editLabel(
                label.name,
                {
                  name: ":no_entry_sign: wontfix",
                  color: "bbbbbb",
                }
              );
              break;
            case "duplicate":
              Issue.editLabel(
                label.name,
                {
                  name: ":man_facepalming: duplicate :woman_facepalming:",
                  color: "bbbbbb",
                }
              );
              break;
          }
        });

        // Add "client question"
        if (!clientQuestion) {
          Issue.createLabel(
            {
              name: ":question: client question",
              color: "d4daef",
              description: "Further information is requested",
            }
          ).catch((error) => {
            log(error, 2);
          });
        }

      }).catch((error) => {
        log(error, 2);
      });
  }

  this.prioritiesPackage = () => {
    // Urgent, Priority 1, Priority 2, Priority 3
    let Issue = this.gh.getIssues(this.gh_user, this.gh_repo);

    let labelData = [
      {
        commonName: "Urgent",
        name: ":mega: Urgent",
        color: "FF0033",
      },
      {
        commonName: "Priority 1",
        name: ":point_up: Priority 1",
        color: "FF3333",
      },
      {
        commonName: "Priority 2",
        name: ":v: Priority 2",
        color: "FF5C5C",
      },
      {
        commonName: "Priority 3",
        name: ":point_down: Priority 3",
        color: "FF8585",
      },
    ];

    labelData.forEach((ld) => {
      log(chalk.blue('... Working on ' + ld.commonName), 3);

      Issue.editLabel(
        ld.commonName,
        {
          name: ld.name,
          color: ld.color,
        }
      ).then((response) => {
        log(chalk.blue('1 Updated "' + ld.commonName + '"'));
      }).catch((error) => {
        // console.log(error);
        log(chalk.blue('... Common Name could not be updated, working on name... ' + ld.commonName), 3);

        if (typeof error.response !== 'undefined') {
          log(chalk.white.bgRed("1: " + error.response.status + " " + error.response.statusText), 3);
        }

        Issue.editLabel(ld.name, {
          name: ld.name,
          color: ld.color,
        }).then((response) => {
          log(chalk.blue('2 Updated "' + ld.commonName + '"'));
        }).catch((error) => {

          log(chalk.blue('... Name could not be updated, will add new label... ' + ld.commonName), 3);

          if (typeof error.response !== 'undefined') {
            log(chalk.white.bgRed("2: " + error.response.status + " " + error.response.statusText), 3);
          };

          Issue.createLabel({
            name: ld.name,
            color: ld.color,
          }).then((response) => {
            log(chalk.blue('3 Added "' + ld.commonName + '"'));
          }).catch((error) => {

            log(chalk.blue('... Could not add new Label... ' + ld.commonName), 3);

            if (typeof error.response !== 'undefined') {
              log(chalk.white.bgRed("3: " + error.response.status + " " + error.response.statusText), 3);
            };
          });
        });
      });
    })
  }

  this.componentsPackage = () => {
    // f4c9ab
    let Issue = this.gh.getIssues(this.gh_user, this.gh_repo);

    this.args.l.forEach((label) => {

      Issue.createLabel({
        name: label,
        color: "f4c9ab",
      }).then((response) => {
        log(chalk.blue('Added "' + label + '"'));
      }).catch((error) => {
        if (typeof error.response !== 'undefined') {
          log(chalk.white.bgRed(error.response.status + " " + error.response.statusText), 3);
        }

        // Update it...
        Issue.editLabel(label, {
          name: label,
          color: "f4c9ab",
        }).then((response) => {
          log(chalk.blue('Updated "' + label + '"'));
        });
      });

    });
  }

  this.teamsPackage = () => {
    // 'BE' 'FE' 'APP' 'CONTRACTOR' 'Needs Design'
    // e1beee - 5c309b

    let Issue = this.gh.getIssues(this.gh_user, this.gh_repo);
    Issue.createLabel({
      name: "BE",
      color: "e1beee",
    }).then((response) => {
      log(chalk.blue('Added "BE"'));
    }).catch((error) => {
      if (typeof error.response !== 'undefined') {
        log(chalk.white.bgRed(error.response.status + " " + error.response.statusText), 3);
      }

      // Update it...
      Issue.editLabel("BE", {
        name: "BE",
        color: "e1beee",
      }).then((response) => {
        log(chalk.blue('Updated "BE"'));
      });
    });

    Issue.createLabel({
      name: "FE",
      color: "e1beee",
    }).then((response) => {
      log(chalk.blue('Added "FE"'));
    }).catch((error) => {
      if (typeof error.response !== 'undefined') {
        log(chalk.white.bgRed(error.response.status + " " + error.response.statusText), 3);
      }

      // Update it...
      Issue.editLabel("FE", {
        name: "FE",
        color: "e1beee",
      }).then((response) => {
        log(chalk.blue('Updated "FE"'));
      });
    });

    Issue.createLabel({
      name: "APP",
      color: "e1beee",
    }).then((response) => {
      log(chalk.blue('Added "APP"'));
    }).catch((error) => {
      if (typeof error.response !== 'undefined') {
        log(chalk.white.bgRed(error.response.status + " " + error.response.statusText), 3);
      }

      // Update it...
      Issue.editLabel("APP", {
        name: "APP",
        color: "e1beee",
      }).then((response) => {
        log(chalk.blue('Updated "APP"'));
      });
    });

    Issue.createLabel({
      name: "CONTRACTOR",
      color: "e1beee",
    }).then((response) => {
      log(chalk.blue('Added "CONTRACTOR"'));
    }).catch((error) => {
      if (typeof error.response !== 'undefined') {
        log(chalk.white.bgRed(error.response.status + " " + error.response.statusText), 3);
      }

      // Update it...
      Issue.editLabel("CONTRACTOR", {
        name: "CONTRACTOR",
        color: "e1beee",
      }).then((response) => {
        log(chalk.blue('Updated "CONTRACTOR"'));
      });
    });

    Issue.createLabel({
      name: "Needs Design",
      color: "5c309b",
    }).then((response) => {
      log(chalk.blue('Added "Needs Design"'));
    }).catch((error) => {
      if (typeof error.response !== 'undefined') {
        log(chalk.white.bgRed(error.response.status + " " + error.response.statusText), 3);
      }

      // Update it...
      Issue.editLabel("Needs Design", {
        name: "Needs Design",
        color: "5c309b",
      }).then((response) => {
        log(chalk.blue('Updated "Needs Design"'));
      });
    });
  }

}

module.exports = GithubLabel;
