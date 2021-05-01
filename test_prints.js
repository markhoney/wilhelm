const config = require('./src/defaults');
const load = require('./src/load');
const audioprint = require('./src/audioprint');
const match = require('./src/match');
const tests = require('./src/tests');

const wilhelm = load('./samples/Wilhelm_tk4.wav', config.sample.rate);
const print = points(wav, config);
const needle = audioprint.zones(wilhelm, config);
for (const test of tests) {
	const audio = load(`./test/${test.file}`, config.sample.rate);
	const haystack = audioprint.zones(audio, config);
	const score = match.shazam(needle, haystack);
	console.log(score, test.file);
}
