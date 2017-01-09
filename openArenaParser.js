'use strict';

let md5 = require('md5');
let capitalizeFirstLetter = require('./capitalizeFirstLetter');
let Player = require('./player');
let Alias = require('./alias');
let Game = require('./game');

let config = require('./config'),
  defaults = Object.assign({
    gameSplitter: /^(?:.*)ShutdownGame:/gm,
    parsers: {
      meta: /^(?:.*)InitGame:\s(.*)$/gm,
      player: /^(?:.*)ClientUserinfoChanged:\s{1}(\d+)\s{1}n\\(.*)\\t\\(?:.*\\id\\(.*))?/gm,
      award: /^(?:.*)Award:\s(\d+)\s(\d+).*$/gm,
      challenge: /^(?:.*)Challenge:\s(\d+)\s(\d+).*$/gm,
      kill: /^(?:.*)Kill:\s(\d+)\s(\d+)\s(\d+).*$/gm
    },
    playerCheck: 'name',
    aliases: 'game' // none, game, todo: global
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
    this.gamesArray = [];
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
    let game = new Game(rawGame, hash);

    this.gamesArray.push(game);

    if(rawGame.isWarmup) {
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

    if(game.meta.g_timestamp) { // get start date and timestamp from meta
      game.date = new Date(game.meta.g_timestamp);
      game.timestamp = game.date.getTime();
    }
  }

  processPlayer(game, data) {
    let name = new Alias(data[2]),
      ingameIndex = data[1];

    let player = null;

    // Aktualizuje aliasy jak ktoś zmieni w trakcie gry
    // nawet w przypadku playerCheck: name
    if(this.settings.aliases === 'game') {
      player = game.players[ingameIndex];

      if(player) { // player updated info
        player.alias(name);
        return;
      }
    }

    // Standardowa aktualizacja graczy
    player = this.getPlayer(name, data[3]);

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

  processChallenge(game, data) {
    let challengeIndex = data[2],
      playerKey = data[1];

    game.players[playerKey].challenge(challengeIndex);
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

      killer.aliasUsed();
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

      prey.aliasUsed();
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
}

module.exports = OpenArenaParser;
