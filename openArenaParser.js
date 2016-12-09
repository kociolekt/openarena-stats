'use strict';

let md5 = require('md5');
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
    },
    playerCheck: 'name'
  }, config);

// TODO: https://github.com/OpenArena/leixperimental/blob/master/code/game/challenges.h

class OpenArenaParser {
  constructor(options = {}) {
    this.settings = Object.assign({}, defaults, options);

    this.hashes = [];
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
      let rawGame = rawGames[i],
        hash = md5(rawGame);

      if(this.hashes.includes(hash)) {
        //console.log('game ' + hash + ' already exists - skipping');
        continue;
      }

      this.hashes.push(hash);
      this.addRawGame(rawGame, hash);
    }
  }

  addRawGame(rawGame, hash) {
    let game = {
      raw: rawGame,
      hash: hash,
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
      prey = game.players[preyKey];

    if(killer && killerKey !== preyKey) {
      killer.killMod[modIndex] += 1;
      killer.kills += 1;
      killer.currentKillStreak += 1;

      // DeathStreak
      if(killer.currentDeathStreak > killer.deathStreak) {
        killer.deathStreak = killer.currentDeathStreak;
      }
      killer.currentDeathStreak = 0;

      // Skillpoints
      if(prey) {
        let winningProbability = 1 / (1 + Math.pow(Math.E, ((prey.skill - killer.skill) / this.settings.skillVariance))),
          skillAmount = (1 - winningProbability) * this.settings.weaponFactor[modIndex];

        killer.skill += skillAmount;
        prey.skill -= skillAmount;
      }
    }

    if(prey) {
      prey.deathMod[modIndex] += 1;
      prey.deaths += 1;
      prey.currentDeathStreak += 1;

      // KillStreak
      if(prey.currentKillStreak > prey.killStreak) {
        prey.killStreak = prey.currentKillStreak;
      }
      prey.currentKillStreak = 0;
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
    switch(this.settings.playerCheck) {
    case 'guid':
      return this.getPlayerByGUID(name, guid);
    case 'name':
      return this.getPlayerByName(name);
    }
    throw new Error('playerCheck option value should be "name" or "guid"');
  }

  getPlayerByName(name) {
    let player = null,
      noGUID = this.settings.noGUID;

    // Try player without guid by simple name
    player = this.players[noGUID][name.simple];

    if(!player) { // Create new if not exists
      player = new Player(name);
      this.players[noGUID][name.simple] = player;
      this.playersArray.push(player);
    }

    return player;
  }

  getPlayerByGUID(name, guid) {
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
