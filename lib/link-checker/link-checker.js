"use strict";

var blc = require("broken-link-checker");
var chalk = require("chalk");
var fs = require('fs-extra');

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

function LinkChecker(args) {
  this.args = args;

  this.run = () => {

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
        html: function (tree, robots, response, pageUrl) {
          data.pages.push(data.page);
          resetPageData(data);

          // logPage(data, pageUrl);
        },
        junk: function (result) {
          if (logOptions.excludeFilteredLinks === true) {
            result.__cli_excluded = true;

            data.page.excludedLinks++;
            data.total.excludedLinks++;
          }

          data.page.totalLinks++;
          data.total.links++;

          pushResult(data, result, logOptions);
          // logResults_delayed(data);
        },
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

          // logResults_delayed(data);
        },
        page: function (error, pageUrl) {
          if (error != null) {
            // "html" handler will not have been called
            // logPage(data, pageUrl);

            log(chalk[error.code !== 200 ? "red" : "gray"](error.name + ": " + error.message));
          }
          else {
            data.page.done = true;

            // logMetrics_delayed(data.page.brokenLinks, data.page.excludedLinks, data.page.totalLinks);
          }
        },
        end: function () {
          console.log(logOptions.reportDir, logOptions.reportFile);
          let report = JSON.stringify(data);
          fs.writeFileSync((logOptions.reportDir + logOptions.reportFile), report);

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
