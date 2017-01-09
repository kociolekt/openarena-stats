let fs = require('fs');
let glob = require('glob');
let jc = require('json-cycle');
let jt = require('json-truncate');
let md5File = require('md5-file');
let express = require('express');
let bodyParser = require('body-parser');
let OpenArenaParser = require('./openArenaParser.js');

let app = express();
let port = process.env.PORT || 3271;
let router = express.Router();
let openArenaParser = new OpenArenaParser();
let filesRegister = {};

function hasChanged(filePath) {
  let md5 = md5File.sync(filePath);

  if(!filesRegister[filePath] || filesRegister[filePath] !== md5) {
    filesRegister[filePath] = md5;
    console.log('reading ' + filePath + ' [' + md5 + ']');
    return true;
  }

  return false;
}


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

function updateStats() {
  return new Promise((resolve, reject) => {
    glob('stats/*.log', undefined, (err, files) => {
      if(err) {
        reject(err);
      }
      resolve(Promise.all(files.map(file => hasChanged(file) ? readFile(file) : undefined)).then(contents => {
        contents.forEach(openArenaParser.addString.bind(openArenaParser));
        return openArenaParser;
      }));
    });
  });
}

// test route to make sure everything is working
router.get('/', function(req, res) {
  res.json({ message: 'Welcome to OAS api!' });
});

// players api
router.get('/players', function(req, res) {
  let players = openArenaParser.playersArray,
    responseArray = players.map(player => player.json());

  if(req.query.sort) {
    try {
      responseArray.sort((a, b) => {
        return b[req.query.sort] - a[req.query.sort];
      });
    } catch(e) {
      console.log(e);
    }
  }

  res.json(responseArray);
});

router.get('/players/:playerId', function(req, res) {
  let players = openArenaParser.playersArray;

  for(let i = 0, pLen = players.length; i < pLen; i++) {
    let player = players[i];

    if(player.id + '' === req.params.playerId + '') {

      res.set('Content-Type', 'application/json; charset=utf-8');
      res.send(JSON.stringify(jc.decycle(jt(player, 4))));
      return;
    }
  }

  res.json({status: false});
});

// games api
router.get('/games', function(req, res) {
  let games = openArenaParser.gamesArray,
    gamesJson = games.map(game => game.json());

  res.set('Content-Type', 'application/json; charset=utf-8');
  res.send(JSON.stringify(jc.decycle(jt(gamesJson, 3))));
});


router.get('/games/:gameId', function(req, res) {
  let games = openArenaParser.gamesArray;

  for(let i = 0, gLen = games.length; i < gLen; i++) {
    let game = games[i];

    if(game.id + '' === req.params.gameId + '') {

      res.set('Content-Type', 'application/json; charset=utf-8');
      res.send(JSON.stringify(jc.decycle(jt(game.jsonFull(), 4))));
      return;
    }
  }

  res.json({status: false});
});

let allowCrossDomain = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  next();
};

app.use(allowCrossDomain);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api', router);

console.log('Preparing stats...');
updateStats().then(() => {
  app.listen(port);
  console.log('Magic happens on port ' + port);

  let players = openArenaParser.playersArray,
    responseArray = [];

  for(let i = 0, pLen = players.length; i < pLen; i++) {
    let player = players[i];

    console.log(player.json().aliases);
  }
});
