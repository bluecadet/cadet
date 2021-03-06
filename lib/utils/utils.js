const CMS_OPTIONS = [
  'Drupal 9: Circle CI',
  'Drupal 8: Circle CI',
  'Drupal 8: Default',
  'WordPress: Circle CI',
  'WordPress: Default',
  'WordPress: App',
  'Custom File Path'
];

exports.CMS_OPTIONS = CMS_OPTIONS;

// Set filepath based on value from CMS_OPTIONS
exports.getFilesPath = (cms_option) => {
  if (cms_option === 'Drupal 8: Circle CI') {
    return `/web/sites/default/files`;
  } else if (cms_option === 'Drupal 8: Default') {
    return `/sites/default/files`;
  } else if (cms_option === 'Drupal 9: Circle CI') {
    return `/web/sites/default/files`;
  } else if (cms_option === 'WordPress: Circle CI') {
    return `/web/wp-content/uploads`;
  } else if (cms_option === 'WordPress: Default') {
    return `/wp-content/uploads`;
  } else {
    return '/files';
  }
}

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



