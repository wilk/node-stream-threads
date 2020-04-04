const { parentPort } = require('worker_threads');

const delay = cb => setTimeout(cb, Math.floor(Math.random() * 10));

parentPort.on('message', data => {
  delay(() => {
    const result = Buffer.from(data.chunk.buffer).toString().split('\n').map(el => parseInt(el) * 2);
    parentPort.postMessage({ id: data.id, data: result });
  });
});
