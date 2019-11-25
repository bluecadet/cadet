"use strict";

const blc = require("broken-link-checker");
const chalk = require("chalk");
const fs = require('fs-extra');
const path = require("path");
const cliProgress = require('cli-progress');
const handlebars = require("handlebars");
const HandlebarsIntl = require('handlebars-intl');

HandlebarsIntl.registerWith(handlebars);

handlebars.registerHelper('resultRowClasses', function (result) {

  let classes = [];
  if (result.broken) classes.push("row--link--broken");
  else classes.push("row--link--not-broken");
  if (result.excluded) classes.push("row--link--excluded");
  if (result.__cli_excluded) classes.push("row--link--cli-excluded");

  return classes.join(" ");
})

handlebars.registerHelper('resultPageClasses', function (result) {
  let classes = [];
  if (result.brokenLinks) classes.push("row--page--has-broken");
  return classes.join(" ");
})

// Progress bar.
const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
let barTotal = 1;

function resetPageData(data) {
  data.page.base = '';
  data.page.brokenLinks = 0;
  data.page.currentIndex = 0;
  data.page.done = false;
  data.page.excludedLinks = 0;
  //data.page.startTime = Date.now();
  data.page.totalLinks = 0;
  data.page.results = [];
}

function pushResult(data, result, options) {
  // data.page.base = result.base.original;
  if (options.maintainLinkOrder === true) {
    data.page.results[result.html.index] = result;
  }
  else {
    data.page.results.push(result);
  }
}

function updateTotalBar(toAdd = 1) {
  barTotal = barTotal + toAdd;
  bar1.setTotal(barTotal);
}
function tickBar(ticks = 1) {
  bar1.increment(ticks);
}
function stopBar() {
  bar1.stop();
}

function finishReports(data, logOptions) {

  // Write json report.
  let JsonReport = JSON.stringify(data);
  fs.writeFileSync((logOptions.reportDir + logOptions.jsonReportFile), JsonReport);

  JsonReport = JSON.stringify(data.total);
  fs.writeFileSync((logOptions.reportDir + "summary--" + logOptions.jsonReportFile), JsonReport);

  data.total.startTimeObj = new Date(data.total.startTime);

  var intlData = {
    "locales": "en-US"
  };

  var templateHtml = fs.readFileSync(path.join(__dirname, 'blc-report-template.html'), 'utf8');
  var template = handlebars.compile(templateHtml);
  var html = template(data, {
    data: { intl: intlData }
  });

  fs.writeFileSync((logOptions.reportDir + logOptions.htmlReportFile), html);
}

function LinkChecker(args) {
  this.args = args;

  this.run = () => {

    bar1.start(200, 0);

    let url = args.site;
    let checkerOptions = {
      excludedKeywords:       args.exclude,
      excludeExternalLinks:   args.excludeExternal,
      excludeInternalLinks:   args.excludeInternal,
      excludeLinksToSamePage: args.verbose>0,
      filterLevel:            args.filterLevel,
      honorRobotExclusions:   args.follow,
      maxSockets:             args.requests,
      maxSocketsPerHost:      args.hostRequests,
      requestMethod:          args.get!==true ? "head" : "get",
      userAgent:              args.userAgent
    }
    let logOptions = {
      excludeCachedLinks:   true,
      excludeFilteredLinks: true,
      maintainLinkOrder:    args.ordered,
      recursive:            args.recursive,
      reportDir:            args.reportDir,
      jsonReportFile:       args.jsonReportFile,
      htmlReportFile:       args.htmlReportFile
    }

    var handlers, instance;
    var data =
    {
      site: url,
      delay: null,
      page: {},
      pages: [],
      total:
      {
        brokenLinks: 0,
        excludedLinks: 0,
        links: 0,
        pages: 0,
        startTime: Date.now()
      }
    };

    // Create report Dir.
    if (!fs.existsSync(logOptions.reportDir)) {
      fs.mkdirsSync(logOptions.reportDir, { recursive: true });
    }

    // In case first page doesn't call "html" handler
    resetPageData(data);

    handlers =
      {
        // is fired after a site's robots.txt has been downloaded and provides an instance of robots-txt-guard.
        robots: function () {

        },
        // is fired after a page's HTML document has been fully parsed.
        html: function (tree, robots, response, pageUrl) {
          data.page.base = pageUrl;

          // Update bar ticks.
          updateTotalBar(1);
        },
        // is fired with data on each skipped link, as configured in options.
        junk: function (result) {

          if (logOptions.excludeFilteredLinks === true) {
            result.__cli_excluded = true;

            data.page.excludedLinks++;
            data.total.excludedLinks++;
          }

          data.page.totalLinks++;
          data.total.links++;

          pushResult(data, result, logOptions);
        },
        // is fired with the result of each discovered link (broken or not) within the current page.
        link: function (result) {

          // Exclude cached links only if not broken
          if (result.broken === false && result.http.cached === true && logOptions.excludeCachedLinks === true) {
            result.__cli_excluded = true;

            data.page.excludedLinks++;
            data.total.excludedLinks++;
          }
          else if (result.broken === true) {
            data.page.brokenLinks++;
            data.total.brokenLinks++;
          }

          data.page.totalLinks++;
          data.total.links++;

          pushResult(data, result, logOptions);
        },
        // is fired after a page's last result, on zero results, or if the HTML could not be retrieved.
        page: function (error, pageUrl) {
          let stringed = JSON.stringify(data.page, null, 2);
          let reparsed = JSON.parse(stringed);
          data.pages.push(reparsed);
          resetPageData(data);

          if (error != null) {
            // "html" handler will not have been called
            // console.log("");
            // console.log(chalk[error.code !== 200 ? "red" : "gray"](error.name + ": " + error.message));
            tickBar(1);
          }
          else {
            data.page.done = true;
            tickBar(1);
          }
        },
        // is fired when the end of the queue has been reached.
        end: function () {
          delete data.page;
          finishReports(data, logOptions);

          tickBar(1);
          stopBar();

          if (data.total.pages <= 0) {
            process.exit(1);
          }
          else if (data.total.pages === 1) {
            process.exit(data.page.done === true && data.total.brokenLinks === 0 ? 0 : 1);
          }
          else if (data.total.pages > 1) {

          }
        }
    };

    instance = new blc.SiteChecker(checkerOptions, handlers);
    instance.enqueue(url);

  }
}

module.exports = LinkChecker;
