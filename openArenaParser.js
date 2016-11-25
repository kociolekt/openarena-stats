'use strict';

let capitalizeFirstLetter = require('./capitalizeFirstLetter');

let dictionary = require('./openArenaDictionary'),
  defaults = Object.assign({
    playerKey: 'name',
    gameSplitter: /^(?:.*)ShutdownGame:/gm,
    parsers: {
      meta: /^(?:.*)InitGame:\s(.*)$/gm,
      player: /^(?:.*)ClientUserinfoChanged:\s{1}(\d+)\s{1}n\\(.*)\\t\\.*\\id\\(.*)$/gm,
      award: /^(?:.*)Award:\s(\d+)\s(\d+).*$/gm,
      kill: /^(?:.*)Kill:\s(\d+)\s(\d+)\s(\d+).*$/gm
    }
  }, dictionary);

class OpenArenaParser {
  constructor(options = {}) {
    this.settings = Object.assign({}, defaults, options);

    this.warmups = [];
    this.matches = [];
    this.players = {};
  }

  addString(logs) {
    let rawGames = logs.split(this.settings.gameSplitter);

    rawGames.pop(); // remove last empty bit

    for (let i = 0, rLen = rawGames.length; i < rLen; i++) {
      this.addRawGame(rawGames[i]);
    }
  }

  addRawGame(rawGame) {
    let game = {
      raw: rawGame,
      meta: {},
      date: null,
      timestamp: null,
      players: {},
      isWarmup: false
    };

    if(OpenArenaParser.isWarmup(rawGame)) {
      game.isWarmup = true;
      this.warmups.push(game);
    } else {
      this.matches.push(game);
    }

    this.processGame(game);
  }

  processGame(game) {
    let parsers = this.settings.parsers,
      parserKeys = Object.keys(parsers);

    for(let parserKey of parserKeys) {
      let parserName = capitalizeFirstLetter(parserKey);

      this.matchAndExec(this.settings.parsers[parserKey], game.raw, this['process' + parserName].bind(this, game));
    }

    delete game.rawGame;
  }

  processMeta(game, data) {
    let metaData = data[1].split('\\');

    for (let i = 1, mLen = metaData.length; i < mLen; i += 2) {
      game.meta[metaData[i]] = metaData[i + 1];
    }

    // get start date and timestamp
    game.date = new Date(game.meta.g_timestamp);
    game.timestamp = game.date.getTime();
  }

  processPlayer(game, data) {
    let nameRaw = data[2],
      nameSimple = nameRaw.replace(/\^\d{1}/g, ''),
      ingameIndex = data[1];

    let player = null;

    if(this.settings.playerKey === 'name') {
      player = this.players[nameSimple] || {
        name: {
          raw: nameRaw,
          simple: nameSimple
        },
        guid: data[3],
        awards: new Array(this.settings.awards.length).fill(0),
        ctf: new Array(this.settings.ctf.length).fill(0),
        killMod: new Array(this.settings.kill.length).fill(0),
        deathMod: new Array(this.settings.kill.length).fill(0),
        kills: 0,
        deaths: 0,
        warmups: [],
        games: []
      };
    }

    if(game.isWarmup) {
      player.warmups.push(game);
    } else {
      player.games.push(game);
    }

    game.players[ingameIndex] = player;
    this.players[nameSimple] = player;
  }

  processAward(game, data) {
    let awardIndex = data[2],
      playerKey = data[1];

    game.players[playerKey].awards[awardIndex] += 1;
  }

  processKill(game, data) {
    let killerKey = data[1],
      preyKey = data[2],
      modIndex = data[3],
      killer = game.players[killerKey],
      pery = game.players[preyKey];

    if(killer && killerKey !== preyKey) {
      killer.killMod[modIndex] += 1;
      killer.kills += 1;
    }

    if(pery) {
      pery.deathMod[modIndex] += 1;
      pery.deaths += 1;
    } else { // syntax?
      console.warn('There was no prey');
    }
  }

  processCTF(/*game, data*/) {
    // TODO: implement ctf
  }

  matchAndExec(re, string, callback) {
    let matches = string.match(re);

    if(matches) {
      matches.forEach(match => {
        re.lastIndex = 0;
        callback(re.exec(match));
      });
    }
  }

  static isWarmup(rawGame) {
    return /^\s+\d+:\d+\s+Warmup:$/m.test(rawGame);
  }
}

module.exports = OpenArenaParser;
