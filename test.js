let OpenArenaParser = require('./openArenaParser.js'),
  fs = require('fs'),
  glob = require('glob'),
  openArenaParser = new OpenArenaParser();

function readFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
}

glob('logs/*.log', undefined, (err, files) => {
  if(err) {
    return err;
  }
  Promise.all(files.map(file => readFile(file))).then(contents => {
    contents.forEach(openArenaParser.addString.bind(openArenaParser));

    let keys = Object.keys(openArenaParser.players);

    for(let key of keys) {
      console.log(openArenaParser.players[key].name.simple);
    }
  });
});
