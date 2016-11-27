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

// TODO: https://github.com/OpenArena/leixperimental/blob/master/code/game/challenges.h

class OpenArenaParser {
  constructor(options = {}) {
    this.settings = Object.assign({}, defaults, options);

    this.warmups = [];
    this.matches = [];
    this.players = {};
    this.playersByGUID = {};
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

    // Try simple name
    player = this.players[name.simple];

    if(guid) {
      // Try guid
      if(!player) {

        player = this.playersByGUID[guid];

        if(player) {
          // add alias
          let aliasExists = false;
          for(let i = 0, aLen = player.aliases.length; i < aLen; i++) {
            if(player.aliases[i].raw === name.raw) {
              aliasExists = true;
              break;
            }
          }
          if(!aliasExists) {
            player.aliases.push(name);
          }

          return player;
        }
      }

      // Create new player and add to register
      player = this.createPlayer(name, guid);
      this.players[name.simple] = player;
      this.playersByGUID[guid] = player;
    } else {
      // Create new player and add to register
      player = this.createPlayer(name, guid);
      this.players[name.simple] = player;
    }

    return player;
  }

  createPlayer(name, guid) {
    return {
      name: name,
      guid: guid,
      aliases: [],
      awards: new Array(this.settings.awards.length).fill(0),
      ctf: new Array(this.settings.ctf.length).fill(0),
      killMod: new Array(this.settings.kill.length).fill(0),
      deathMod: new Array(this.settings.kill.length).fill(0),
      kills: 0,
      killStreak: 0,
      currentKillStreak: 0,
      deaths: 0,
      deathStreak: 0,
      currentDeathStreak: 0,
      warmups: [],
      games: []
    }
  }

  static isWarmup(rawGame) {
    return /^\s+\d+:\d+\s+Warmup:$/m.test(rawGame);
  }
}

module.exports = OpenArenaParser;
