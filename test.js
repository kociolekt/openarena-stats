let OpenArenaParser = require('./openArenaParser.js'),
  logDirPath = './logs',
  fs = require('fs'),
  glob = require("glob"),
  logRe = new RegExp('^.*\.log$', 'g'),
  logFiles = [],
  openArenaParser = new OpenArenaParser();

function readFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(data);
    });
  });
}

glob('logs/*.log', undefined, (err, files) => {
  Promise.all(files.map(file => readFile(file))).then(contents => {
    contents.forEach(openArenaParser.addString.bind(openArenaParser));
    console.log(openArenaParser);
  });
});
