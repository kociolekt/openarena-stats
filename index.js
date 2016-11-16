let defaults = {
    awards: [
      'GAUNTLET', // 0
      'Excellent', // 1
      'Impressive', // 2
      'Defense', // 3
      'Capture', // 4
      'Assist' // 5
    ],
    ctf: [
     'Flag is taken', // 0
     'Flag is captured', // 1
     'Flag is returned', // 2
     'Flagcarrier got killed' // 3
    ],
    kill: [
      'MOD_UNKNOWN', // 0
      'MOD_SHOTGUN', // 1
      'MOD_GAUNTLET', // 2
      'MOD_MACHINEGUN', // 3
      'MOD_GRENADE', // 4
      'MOD_GRENADE_SPLASH', // 5
      'MOD_ROCKET', // 6
      'MOD_ROCKET_SPLASH', // 7
      'MOD_PLASMA', // 8
      'MOD_PLASMA_SPLASH', // 9
      'MOD_RAILGUN', //10
      'MOD_LIGHTNING', //11
      'MOD_BFG', //12
      'MOD_BFG_SPLASH', //13
      'MOD_WATER', //14
      'MOD_SLIME', //15
      'MOD_LAVA', //16
      'MOD_CRUSH', //17
      'MOD_TELEFRAG', //18
      'MOD_FALLING', //19
      'MOD_SUICIDE', //20
      'MOD_TARGET_LASER', //21
      'MOD_TRIGGER_HURT', //22
      'MOD_NAIL', //23
      'MOD_CHAINGUN', //24
      'MOD_PROXIMITY_MINE', //25
      'MOD_KAMIKAZE', //26
      'MOD_JUICED', //27
      'MOD_GRAPPLE' //28
    ]
  };

class OpenArenaStats {
  constructor(options = {}) {
    this.settings = Object.assign({}, defaults, options);

    this.warmups = [];
    this.matches = [];
    this.players = {};
  }

  addString(logs) {
    let rawGames = logs.split(/^\s+\d+:\d+\s+ShutdownGame:\s+\d+:\d+\s+-{60}$/gm);
    rawGames.pop(); // remove last empty bit

    for (var i = 0, rLen = rawGames.length; i < rLen; i++) {
      this.addRawGame(rawGames[i]);
    }
  }

  addRawGame(rawGame) {
    if(OpenArenaStats.isWarmup(rawGame)) {
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

      for (var i = 1, mLen = metaData.length; i < mLen; i += 2) {
        game.meta[metaData[i]] = metaData[i+1];
      }

      // get start date and timestamp
      game.date = new Date(game.meta.g_timestamp);
      game.timestamp = game.date.getTime();
    });
  }


  processPlayers(game) {
    let playerRe = /^\s{1,2}\d{1,2}:\d{1,2}\s{1}ClientUserinfoChanged:\s{1}(\d+)\s{1}n\\(.*)\\t\\.*\\id\\(.*)$/gm;

    game.players = {}

    game.raw.match(playerRe).map( playerRaw => {
      playerRe.lastIndex = 0;

      let playerExec = playerRe.exec(playerRaw),
        nameRaw = playerExec[2],
        key = playerExec[1];

      game.players[key] = {
        //raw: playerExec[0],
        id: key,
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

  getStats() {

  }

  static isWarmup(rawGame) {
    return /^\s+\d+:\d+\s+Warmup:$/m.test(rawGame);
  }
}

module.exports = OpenArenaStats;
