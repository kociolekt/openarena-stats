let config = require('./config');
let pad = require('pad');

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
    this.skill = config.skillMean;
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

  formattedStats() {
    let name = pad(this.formattedName(), 20),
      kills = this.kills,
      deaths = this.deaths,
      eff = (this.kills / (1 + this.kills + this.deaths) * 100).toFixed(2) + '%',
      ks = this.killStreak,
      ds = this.deathStreak,
      kd = (this.deaths !== 0 ? this.kills / this.deaths : 0).toFixed(2),
      kg = (this.kills / this.games.length).toFixed(2),
      games = this.games.length,
      skill = (this.skill).toFixed(2);

    return `${name}\t${kills}\t${deaths}\t${eff}\t${ks}\t${ds}\t${kd}\t${kg}\t${games}\t${skill}`;
  }
};
