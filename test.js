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

glob('examples/*.log', undefined, (err, files) => {
  if(err) {
    return err;
  }
  Promise.all(files.map(file => readFile(file))).then(contents => {
    contents.forEach(openArenaParser.addString.bind(openArenaParser));

    let players = openArenaParser.playersArray;

    for(let i = 0, pLen = players.length; i < pLen; i++) {
      let player = players[i];

      console.log(
        player.formattedName(),
        player.kills,
        player.deaths,
        (player.kills / (1 + player.kills + player.deaths) * 100) + '%',
        player.killStreak,
        player.deathStreak,
        player.deaths != 0 ? player.kills / player.deaths : 0,
        player.kills / player.games.length,
        player.games.length);
    }
  });
});
