const { Worker } = require('worker_threads');
const os = require('os');
const fs = require('fs');
const stream = require('stream');

const cpus = os.cpus().length;
let finishedReading = false;
let found = false;
let onlineCount = 0;
let roundCount = 0;
let busyCount = 0;

const pool = Array.from({ length: cpus }).map(() => {
  const worker = new Worker('./multiply.js');
  // used to start the real program when all the threads are ready
  worker.on('online', () => {
    onlineCount++;
    if (onlineCount === cpus) start();
  });

  worker.on('message', async message => {
    messagesDispatcher(message.id, message.data);

    /*if (message.type === 'result') {
      busyCount--;

      if (message.found) found = true;
      if (finishedReading && busyCount === 0) {
        if (found) console.log('found :D');
        else console.log('not found :(');
        await Promise.all(pool.map(w => w.terminate()));
      }
    }*/
  });

  return worker;
});

/*const messages = [{
  id,
  cb,
  state: 'pending | ready | sent'
}]*/

let messagesDispatcher;
const transformStream = () => {
  const messages = [];
  let sentCount = 0;
  const dispatch = messages => (id, data) => {
    console.log(messages.map((msg, index) => `${index} - ${msg.status}`).join('\n'));
    console.log('DISPATCHING', id);
    const message = messages[id];

    if (!message) return;
    console.log('STATUS', message.status, data ? data.length : -1);

    if (id === 0) {
      console.log('SENDING OUT', id, typeof messages[id + 1]);
      message.handler(data);
      message.status = 'sent';
      messages[id + 1] && dispatch(messages)(id + 1, messages[id + 1].data);
      sentCount++;
    } else {
      const prevMessage = messages[id - 1];
      if (prevMessage.status === 'sent' && message.status !== 'sent' && data && data.length > 0) {
        console.log('SENDING OUT', id, typeof messages[id + 1], data.length);
        message.handler(data);
        message.status = 'sent';
        messages[id + 1] && dispatch(messages)(id + 1, messages[id + 1].data);
        sentCount++;
      } else {
        message.status = 'ready';
        message.data = data;
      }
    }
    // check the previous message if it is already sent
    // if it's not ready, it save it with a "ready" state
    // if it's ready, it sends the message and start iterating with the next one and if it's ready continue until finds one in a "pending/sent" state
  };
  messagesDispatcher = dispatch(messages);
  // TODO: transform does not work because next pushes the data into the readable stream and asks for the next chunk. cannot be parallelised
  /*const ts = new stream.Transform({
    transform(chunk, encoding, next) {
      console.log('WRITING');
      const id = messages.length;
      messages.push({
        data: [],
        status: 'pending',
        handler: data => next(null, data)
      });
      pool[roundCount % cpus].postMessage({ chunk, id });
    }
  });*/

  // in this case, the thread pool must take care to the data storage
  // when a worker sends back the new data, the thread pool cb must save that data to some sort of storage
  // the thread pool must save the data in series (also this can be user defined)
  const ds = new stream.Duplex({
    // output
    read(size) {
      // request data from a source (fs? db? network? maybe user defined)
      // size must be saved with a counter so the thread pool cb knows the next offset
    },

    // input
    write(chunk, encoding, next) {
      // sends data to the thread pool
      // call next immediately
    }
  });

  return ds;
};

const start = () => {
  const inStream = fs.createReadStream('./data3.txt');

  /*const tStream = () => new stream.Transform({
    transform(chunk, e, next) {
      console.log('reading chunk');
      this.push(chunk);
      next();
    }
  })*/

  inStream.pipe(transformStream()).pipe(process.stdout).on('end', async () => {
    await Promise.all(pool.map(w => w.terminate()));
  });

  /*inStream.on('data', data => {
    pool[roundCount % cpus].postMessage(data);
    busyCount++;
    roundCount++;
  });

  inStream.on('end', () => {
    finishedReading = true;
  });*/
};

process.on('SIGINT', async () => await Promise.all(pool.map(w => w.terminate())))
process.on('SIGTERM', async () => await Promise.all(pool.map(w => w.terminate())))

/*const fs = require('fs');
const stream = fs.createReadStream('./data.txt');

stream.on('data', data => {
  console.log(data.toString().length);
});

fs.createReadStream(filePath).pipe(job(processor)).pipe(handler);

job(processor, { stream }).pipe(handler)*/
