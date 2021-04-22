const config = require('./src/defaults');
const load = require('./src/load');
const print = require('./src/audioprint');
const match = require('./src/match');
const tests = require('./src/tests');

const wilhelm = load('./samples/Wilhelm_tk4.wav', config.sample.rate);
const needle = print.zones(wilhelm, config);
for (const test of tests) {
	const audio = load(`./test/${test.file}`, config.sample.rate);
	const haystack = print.zones(audio, config);
	const score = match.shazam(needle, haystack);
	console.log(score, test.file);
}
