'use strict';

let dictionary = require('./openArenaDictionary'),
  defaults = Object.assign({

  }, dictionary);

class OpenArenaStats {
  constructor(options = {}) {
    this.settings = Object.assign({}, defaults, options);
    
  }

  addOAP(oap) {

  }
}

module.exports = OpenArenaStats;
