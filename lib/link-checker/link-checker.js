"use strict";

var blc = require("broken-link-checker");
var chalk = require("chalk");
var fs = require('fs-extra');
const cliProgress = require('cli-progress');

// Progress bar.
const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
let barTotal = 1;

function resetPageData(data) {
  data.page.brokenLinks = 0;
  data.page.currentIndex = 0;
  data.page.done = false;
  data.page.excludedLinks = 0;
  data.page.results = [];
  //data.page.startTime = Date.now();
  data.page.totalLinks = 0;
}

function pushResult(data, result, options) {
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
      reportFile:           args.reportFile
    }

    var handlers, instance;
    var data =
    {
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
          data.pages.push(data.page);
          resetPageData(data);

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
          if (error != null) {
            // "html" handler will not have been called
            log(chalk[error.code !== 200 ? "red" : "gray"](error.name + ": " + error.message));
          }
          else {
            data.page.done = true;
            tickBar(1);
          }
        },
        // is fired when the end of the queue has been reached.
        end: function () {
          let report = JSON.stringify(data);
          fs.writeFileSync((logOptions.reportDir + logOptions.reportFile), report);

          tickBar(1);
          stopBar();
          if (data.total.pages <= 0) {
            process.exit(1);
          }
          else if (data.total.pages === 1) {
            process.exit(data.page.done === true && data.total.brokenLinks === 0 ? 0 : 1);
          }
          else if (data.total.pages > 1) {
            // logMetrics_delayed(data.total.brokenLinks, data.total.excludedLinks, data.total.links, Date.now() - data.total.startTime, true, true);
          }
        }
    };

    instance = new blc.SiteChecker(checkerOptions, handlers);
    instance.enqueue(url);

  }
}

module.exports = LinkChecker;
