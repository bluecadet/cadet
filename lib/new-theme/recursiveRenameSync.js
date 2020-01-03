const fs = require('fs');

function renameItem(dirPath, item, config) {
  let itemPath = `${dirPath}/${item}`;

  if (item.startsWith('BC__BASE')) {
    let newName = item.replace('BC__BASE__HYPHEN', config.project_hyphenated);
    newName = newName.replace('BC__BASE', config.project);
    itemPath = `${dirPath}/${newName}`;
    fs.renameSync(`${dirPath}/${item}`, itemPath);
  }

  if (fs.lstatSync(itemPath).isFile()) {
    let data = fs.readFileSync(itemPath, 'utf8');
    let result = data.replace(/BC__BASE__NAME/g, config.project_title_case);
    result = result.replace(/BC__BASE__THEMEDIR/g, config.gulpThemePath);
    result = result.replace(/BC__BASE__HYPHEN/g, config.project_hyphenated);
    result = result.replace(/BC__BASE/g, config.project);
    fs.writeFileSync(itemPath, result, 'utf8');
  } else if (fs.lstatSync(itemPath).isDirectory()) {
    renameDirContentRecursiveSync(itemPath, config);
  }
}


function renameDirContentRecursiveSync(dirPath, config) {

  let promises = [];
  let directoryItems;

  try {
    directoryItems = fs.readdirSync(dirPath);
  } catch (err) {
    console.error(err);
    return;
  }

  directoryItems.forEach(item => {
    promises.push(renameItem(dirPath, item, config));
  });

  return Promise.all(promises).then(results => {
    return results;
  });
}



module.exports = function (dirPath, config) {
  return renameDirContentRecursiveSync(dirPath, config);
}
