let md5 = require('md5');

let autoincrement = 0;

module.exports = class Game {
  constructor(rawGame, hash = md5(rawGame)) {
    this.id = ++autoincrement;
    this.raw = rawGame;
    this.hash = hash;
    this.meta = {};
    this.date = null;
    this.timestamp = null;
    this.players = {};
    this.isWarmup = Game.isWarmup(rawGame);
  }

  json() {
    let retval = {};

    retval.id = this.id;
    retval.hash = this.hash;
    retval.warmup = this.isWarmup;
    retval.playersCount = this.players.length;

    this.meta.hostname ? retval.hostname = this.meta.hostname : '';
    this.meta.gamename ? retval.game = this.meta.gamename : '';
    this.meta.mapname ? retval.map = this.meta.mapname : '';
    this.meta.gametype ? retval.gametype = this.meta.gametype : '';
    this.meta.protocol ? retval.protocol = this.meta.protocol : '';
    this.meta.dmflags ? retval.dmflags = this.meta.dmflags : '';
    this.meta.fraglimit ? retval.fraglimit = this.meta.fraglimit : '';
    this.meta.capturelimit ? retval.capturelimit = this.meta.capturelimit : '';
    this.meta.timelimit ? retval.timelimit = this.meta.timelimit : '';
    this.meta.sv_maxclients ? retval.maxplayers = this.meta.sv_maxclients : '';
    this.meta.version ? retval.version = this.meta.version : '';
    this.timestamp ? retval.timestamp = this.timestamp : '';

    return retval;
  }

  jsonFull() {
    let retval = this.json();

    retval.players = this.players;

    return retval;
  }

  static isWarmup(rawGame) {
    return /^\s+\d+:\d+\s+Warmup:$/m.test(rawGame);
  }
};
