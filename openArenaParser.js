'use strict';

let capitalizeFirstLetter = require('./capitalizeFirstLetter');
let Player = require('./player');

let config = require('./config'),
  defaults = Object.assign({
    gameSplitter: /^(?:.*)ShutdownGame:/gm,
    parsers: {
      meta: /^(?:.*)InitGame:\s(.*)$/gm,
      player: /^(?:.*)ClientUserinfoChanged:\s{1}(\d+)\s{1}n\\(.*)\\t\\.*\\id\\(.*)$/gm,
      award: /^(?:.*)Award:\s(\d+)\s(\d+).*$/gm,
      kill: /^(?:.*)Kill:\s(\d+)\s(\d+)\s(\d+).*$/gm
    }
  }, config);

// TODO: https://github.com/OpenArena/leixperimental/blob/master/code/game/challenges.h

class OpenArenaParser {
  constructor(options = {}) {
    this.settings = Object.assign({}, defaults, options);

    this.warmups = [];
    this.matches = [];
    this.players = {};
    this.players[this.settings.noGUID] = {};
    this.playersArray = [];
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

    delete game.raw;
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
    let name = {
        raw: data[2],
        simple: data[2].replace(/\^\d{1}/g, '')
      },
      ingameIndex = data[1];

    let player = this.getPlayer(name, data[3]);

    if(game.isWarmup) {
      player.warmups.push(game);
    } else {
      player.games.push(game);
    }

    game.players[ingameIndex] = player;
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
      killer.currentKillStreak += 1;

      if(killer.currentDeathStreak > killer.deathStreak) {
        killer.deathStreak = killer.currentDeathStreak;
      }
      killer.currentDeathStreak = 0;
    }

    if(pery) {
      pery.deathMod[modIndex] += 1;
      pery.deaths += 1;
      pery.currentDeathStreak += 1;

      if(pery.currentKillStreak > pery.killStreak) {
        pery.killStreak = pery.currentKillStreak;
      }
      pery.currentKillStreak = 0;
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

  getPlayer(name, guid) {
    let player = null;

    if(!guid) { // No GUID
      guid = this.settings.noGUID;

      // Try player without guid by simple name
      player = this.players[guid][name.simple];

      if(!player) { // Create new if not exists
        player = new Player(name, guid);
        this.players[guid][name.simple] = player;
        this.playersArray.push(player);
      }
    } else { // GUID
      // Try player with GUID
      player = this.players[guid];

      if(!player) { // Create new if not exists
        player = new Player(name, guid);
        this.players[guid] = player;
        this.playersArray.push(player);
      } else { // Update aliases if exists
        player.alias(name);
      }
    }

    return player;
  }

  static isWarmup(rawGame) {
    return /^\s+\d+:\d+\s+Warmup:$/m.test(rawGame);
  }
}

module.exports = OpenArenaParser;