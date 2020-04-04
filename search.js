const { parentPort } = require('worker_threads');

parentPort.on('message', data => {
  const el = Buffer.from(data.buffer).toString().split('\n').map(parseInt).find(el => el === -1);
  parentPort.postMessage({ type: 'result', found: typeof el !== 'undefined' });
});
