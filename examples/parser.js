const fs = require('fs');
const path = require('path');

module.exports = {
  parse: () => {
    const content = fs.readFileSync(path.resolve(__dirname, './meh.json'), { encoding: 'utf-8' });
    console.log(content);
  }
};
