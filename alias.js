module.exports = class Alias {
  constructor(rawName) {
    this.raw = rawName;
    this.simple = Alias.simplify(this.raw);
    this.formatted = this.simple;
    this.count = 1;
  }
  
  static simplify(rawName) {
    return rawName.replace(/\^\d{1}/g, '');
  }
};
