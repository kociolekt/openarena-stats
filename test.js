let OpenArenaStats = require('./index.js'),
  logFilePAth = './insta.log',
  fs = require('fs');
  
fs.readFile(logFilePAth, 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }

  let openArenaStats = new OpenArenaStats();

  openArenaStats.addString(data);

  //console.log(openArenaStats);
});
