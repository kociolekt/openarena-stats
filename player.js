let config = require('./config');

module.exports = class Player {
  constructor(name, guid) {
      this.name = name;
      this.guid = guid;
      this.aliases = [];
      this.awards = new Array(config.awards.length).fill(0);
      this.ctf = new Array(config.ctf.length).fill(0);
      this.killMod = new Array(config.kill.length).fill(0);
      this.deathMod = new Array(config.kill.length).fill(0);
      this.kills = 0;
      this.killStreak = 0;
      this.currentKillStreak = 0;
      this.deaths = 0;
      this.deathStreak = 0;
      this.currentDeathStreak = 0;
      this.warmups = [];
      this.games = [];
      this.hasGUID = guid !== config.noGUID;
  }

  alias(name) {
    let aliasExists = false;
    for(let i = 0, aLen = this.aliases.length; i < aLen; i++) {
      if(this.aliases[i].raw === name.raw) {
        aliasExists = true;
        break;
      }
    }
    if(!aliasExists) {
      this.aliases.push(name);
    }
  }

  formattedName() {
    if(this.hasGUID) {
      return this.name.simple;
    } else {
      return this.name.simple + ' ' + config.noGUID;
    }
  }
};
