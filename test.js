const config = require('./src/defaults');
const load = require('./src/load');
const audioPrint = require('./src/audioprint');

const audio = load('./samples/Wilhelm_tk4.wav', config.sample.rate);
// const audio = load('./test/Sintel (2010)-trailer.mkv', config.sample.rate);
const print = audioPrint(audio, config.sample.rate, config.sample.size, config.sample.step, config.sample.window);
console.log(print);
