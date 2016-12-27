require('./objectValuesEntries');

let config = require('./config');
let pad = require('pad');
let autoincrement = 0;


module.exports = class Player {
  constructor(name, guid) {
    this.id = ++autoincrement;
    this.name = name;
    this.guid = guid;
    this.aliases = [];
    this.awards = new Array(config.awards.length).fill(0);
    this.ctf = new Array(config.ctf.length).fill(0);
    this.killMod = new Array(config.kill.length).fill(0);
    this.deathMod = new Array(config.kill.length).fill(0);
    this.challenges = null;
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

    this.init();
  }

  init() {
    this.alias(this.name);
    this.fillChallenges();
  }

  alias(name) {
    for(let i = 0, aLen = this.aliases.length; i < aLen; i++) {
      let alias = this.aliases[i];

      if(alias.raw === name.raw) {
        alias.count += 1;

        // update name to mostly used
        if(alias.count > this.name.count) {
          this.name = alias;
        }

        return;
      }
    }

    // set count to 1 and add to aliases
    name.count = 1;
    this.aliases.push(name);

    // set last used if same count
    if(this.name.count === name.count) {
      this.name = name;
    }
  }

  fillChallenges() {
    this.challenges = Object.values(config.challenge).reduce((o, v) => {
      o[v] = 0;
      return o;
    }, {});
  }

  challenge(id) {
    this.challenges[config.challenge[id]] += 1;
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

  formattedChallenges() {
    let text = '';

    for (let challengeName in this.challenges) {
      if (this.challenges.hasOwnProperty(challengeName)) {
        text += challengeName + ': ' + this.challenges[challengeName] + '\n';
      }
    }

    return text;
  }

  jsonStats() {
    return {
      id: this.id,
      name: this.formattedName(),
      kills: this.kills,
      deaths: this.deaths,
      eff: (this.kills / (1 + this.kills + this.deaths) * 100).toFixed(2) + '%',
      ks: this.killStreak,
      ds: this.deathStreak,
      kd: (this.deaths !== 0 ? this.kills / this.deaths : 0).toFixed(2),
      kg: (this.kills / this.games.length).toFixed(2),
      games: this.games.length,
      skill: (this.skill).toFixed(2)
    }
  }
};
