'use strict';

let config = require('./config'),
  defaults = Object.assign({

  }, config);

class OpenArenaStats {
  constructor(options = {}) {
    this.settings = Object.assign({}, defaults, options);
    
  }

  addOAP(oap) {

  }
}

module.exports = OpenArenaStats;
