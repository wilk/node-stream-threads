const path = require('path');
const main = require('../src/main');

const start = async () => {
  await main.init();
  main.sendCode(`
    const parser = require('${path.resolve(__dirname, '../examples/parser')}');
    parser.parse();
  `);
};

start();
