const path = require('path');
const { Worker } = require('worker_threads');

const str = `
const {parentPort} = require('worker_threads');

parentPort.on('message', code => {
  eval(code);
});
`;

let worker;
const init = () => new Promise(resolve => {
  worker = new Worker(str, { eval: true });

  worker.once('online', resolve);
});

const sendCode = code => worker.postMessage(code);

module.exports = {
  init,
  sendCode
};
