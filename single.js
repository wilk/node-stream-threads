const fs = require('fs');

const stream = fs.createReadStream('./data.txt');

let found = false;
stream.on('data', data => {
  const el = data.toString().split('\n').map(parseInt).find(num => num === -1);
  if (el) found = true;
});

stream.on('end', () => {
  if (found) console.log('found :D');
  else console.log('not found :(');
});
