let fs = require('fs');
let glob = require('glob');
let stringify = require('json-stringify-safe');
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
/*
    let motylaNoga = openArenaParser.getPlayerByName({simple: 'MotylaNoga'});

    console.log(motylaNoga.deathMod);

    console.log(openArenaParser.getPlayerByName({simple: 'MotylaNoga'}).formattedChallenges());
*/
/*
    let jsonfile = require('jsonfile');

    let file = '/tmp/data.json';

    jsonfile.writeFile(file, openArenaParser, {spaces: 2}, (err) => {
      console.error(err);
    });*/

/*
    console.log(stringify(openArenaParser));

    fs.writeFile('helloworld.txt', 'Hello World!', function (err) {
      if (err) return console.log(err);
      console.log('Hello World > helloworld.txt');
    });*/
  });
});
