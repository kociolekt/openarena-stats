module.exports = class Alias {
  constructor(rawName) {
    this.raw = rawName;
    this.simple = Alias.simplify(this.raw);
    this.formatted = this.simple;
    this.count = 1;
  }

  toString() {
    return this.simple;
  }

  format() {


    let re = /\^\d/g,
      str = this.raw,
      match = null;

    while ((match = re.exec(str)) != null) {
      console.log(/\^\d/g.exec(this.raw));
    }
  }

  static simplify(rawName) {
    return rawName.replace(/\^\d{1}/g, '');
  }
};
