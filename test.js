let fs = require('fs');
let glob = require('glob');
let OpenArenaParser = require('./openArenaParser.js');

let openArenaParser = new OpenArenaParser();

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

glob('examples/*.log', undefined, (err, files) => {
  if(err) {
    return err;
  }
  Promise.all(files.map(file => readFile(file))).then(contents => {
    contents.forEach(openArenaParser.addString.bind(openArenaParser));

    let players = openArenaParser.playersArray;

    players.sort((a, b) => {
      return b.skill - a.skill;
    });

    for(let i = 0, pLen = players.length; i < pLen; i++) {
      let player = players[i];

      console.log(player.formattedStats());
    }
  });
});
