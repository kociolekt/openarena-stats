'use strict';

let dictionary = require('./openArenaDictionary'),
  defaults = Object.assign({
    playerKey: 'name'
  }, dictionary);

class OpenArenaParser {
  constructor(options = {}) {
    this.settings = Object.assign({}, defaults, options);

    this.warmups = [];
    this.matches = [];
    this.players = {};
  }

  addString(logs) {
    let rawGames = logs.split(/^\s+\d+:\d+\s+ShutdownGame:\s+\d+:\d+\s+-{60}$/gm);

    rawGames.pop(); // remove last empty bit

    for (let i = 0, rLen = rawGames.length; i < rLen; i++) {
      this.addRawGame(rawGames[i]);
    }
  }

  addRawGame(rawGame) {
    if(OpenArenaParser.isWarmup(rawGame)) {
      this.processGame(rawGame, this.warmups);
    } else {
      this.processGame(rawGame, this.matches);
    }
  }

  processGame(rawGame, results) {
    let game = {
      raw: rawGame
    };

    this.processMeta(game);
    this.processPlayers(game);
    this.processAwards(game);
    this.processCTF(game);
    this.processKills(game);
    this.clean(game);

    results.push(game);
  }

  processMeta(game) {
    let metaRe = /^\s{1,2}\d{1,2}:\d{1,2}\s{1}InitGame:\s(.*)$/gm;

    game.raw.match(metaRe).map( metaRaw => {
      metaRe.lastIndex = 0;

      let metaExec = metaRe.exec(metaRaw),
        metaDataRaw = metaExec[1],
        metaData = metaDataRaw.split('\\');

      game.meta = {};

      for (let i = 1, mLen = metaData.length; i < mLen; i += 2) {
        game.meta[metaData[i]] = metaData[i+1];
      }

      // get start date and timestamp
      game.date = new Date(game.meta.g_timestamp);
      game.timestamp = game.date.getTime();
    });
  }


  processPlayers(game) {
    let playerRe = /^\s{1,2}\d{1,2}:\d{1,2}\s{1}ClientUserinfoChanged:\s{1}(\d+)\s{1}n\\(.*)\\t\\.*\\id\\(.*)$/gm;

    game.players = {};

    game.raw.match(playerRe).map( playerRaw => {
      playerRe.lastIndex = 0;

      let playerExec = playerRe.exec(playerRaw),
        nameRaw = playerExec[2],
        key = playerExec[1];

      game.players[key] = {
        name: {
          raw: nameRaw,
          simple: nameRaw.replace(/\^\d{1}/g, '')
        },
        guid: playerExec[3],
        awards: new Array(this.settings.awards.length).fill(0),
        ctf: new Array(this.settings.ctf.length).fill(0),
        killMod: new Array(this.settings.kill.length).fill(0),
        deathMod: new Array(this.settings.kill.length).fill(0),
        kills: 0,
        deaths: 0
      };
    });
  }

  processAwards(game) {
    let awardRe = /^\s{1,2}\d{1,2}:\d{1,2}\s{1}Award:\s(\d+)\s(\d+).*$/gm;

    game.raw.match(awardRe).map( awardRaw => {
      awardRe.lastIndex = 0;

      let awardExec = awardRe.exec(awardRaw),
        awardIndex = awardExec[2],
        playerKey = awardExec[1];

      game.players[playerKey].awards[awardIndex] += 1;
    });
  }

  processCTF(game) {
    // TODO: implement ctf
  }

  processKills(game) {
    let killRe = /^\s{1,2}\d{1,2}:\d{1,2}\s{1}Kill:\s(\d+)\s(\d+)\s(\d+).*$/gm;

    game.raw.match(killRe).map( killRaw => {
      killRe.lastIndex = 0;

      let killExec = killRe.exec(killRaw),
        killerKey = killExec[1],
        preyKey = killExec[2],
        modIndex = killExec[3],
        killer = game.players[killerKey],
        pery = game.players[preyKey];

      if(killer) {
        killer.killMod[modIndex] += 1;
        killer.kills += 1;
      }

      if(pery) {
        pery.deathMod[modIndex] += 1;
        pery.deaths += 1;
      } else {
        console.warn('There was no prey');
      }

    });
  }

  clean(game) {
    delete game.raw;
  }

  createOrUpdatePlayer(player) {

  }

  static isWarmup(rawGame) {
    return /^\s+\d+:\d+\s+Warmup:$/m.test(rawGame);
  }
}

module.exports = OpenArenaParser;
