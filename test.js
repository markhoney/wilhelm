const config = require('./src/defaults');
const load = require('./src/load');
const audioPrint = require('./src/audioprint');

const wilhelm = load('./samples/Wilhelm_tk4.wav', config.sample.rate);
// const sintel = load('./test/Sintel (2010)-trailer.mkv', config.sample.rate);
const reservoir = load('./test/Reservoir Dogs (1992).mkv', config.sample.rate);
/// const barbie = load('./test/Barbie in A Mermaid Tale 2 (2012).mkv', config.sample.rate);
const needle = audioPrint(wilhelm, config.sample.size, config.sample.step, config.sample.window);
const haystack = audioPrint(reservoir, config.sample.size, config.sample.step, config.sample.window);
