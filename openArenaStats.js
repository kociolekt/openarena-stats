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

}

module.exports = OpenArenaParser;
