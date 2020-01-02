// const os = require('os');
// const path = require('path');
// const fsx = require('fs-extra');
// const { exec } = require('child_process');
// const chalk = require('chalk');

const CMS_OPTIONS = [
  'Drupal 8: Circle CI',
  'Drupal 8: Default',
  'WordPress: Circle CI',
  'WordPress: Default',
  'Custom File Path'
];

exports.CMS_OPTIONS = CMS_OPTIONS;


exports.determineCMS = (dir) => {

}

var addToObject = function (obj, key, value, index) {

  // Create a temp object and index variable
  var temp = {};
  var i = 0;

  // Loop through the original object
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {

      // If the indexes match, add the new item
      if (i === index && key && value) {
        temp[key] = value;
      }

      // Add the current item in the loop to the temp obj
      temp[prop] = obj[prop];

      // Increase the count
      i++;

    }
  }

  // If no index, add to the end
  if (!index && key && value) {
    temp[key] = value;
  }

  return temp;

};

exports.addToObject = addToObject;



