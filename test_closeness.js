const config = require('./src/defaults');
const load = require('./src/load');
const print = require('./src/audioprint');
const match = require('./src/match');
const tests = require('./src/tests');

// const wilhelm = load('./samples/Wilhelm_tk4.wav', config.sample.rate);
const wilhelm = load('./samples/Wilhelm_Scream.ogg', config.sample.rate);
const needle = print.centre(wilhelm, config);
for (const test of tests) {
	const audio = load(`./test/${test.file}`, config.sample.rate);
	const haystack = print.print(audio, config);
	const [time, score] = match.centre(needle, haystack);
	console.log(score, time / 1000, Math.round(time - (test.time * 1000)) / 1000, test.file);
}
