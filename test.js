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
      let player = openArenaParser.players[key];

      console.log(
        player.name.simple,
        player.kills,
        player.deaths,
        (player.kills / (1 + player.kills + player.deaths) * 100) + '%',
        player.killStreak,
        player.deathStreak,
        player.deaths != 0 ? player.kills / player.deaths : 0,
        player.kills / player.games.length,
        player.games.length,
        player.guid);
    }
  });
});
