const audio = require('./src');

// const wilhelm = load('./samples/Wilhelm_tk4.wav', config.sample.rate);
const wilhelm = audio.load('./samples/Wilhelm_Scream.ogg', audio.config.sample.rate);
const print = audio.points(wilhelm, audio.config);
const needle = audio.print.centre(print, audio.config);
for (const test of audio.tests) {
	const sample = audio.load(`./test/${test.file}`, audio.config.sample.rate);
	const haystack = audio.print.zones(audio.points(sample, audio.config), audio.config);
	const [time, score] = audio.match.centre(needle, haystack);
	console.log(score, time / 1000, Math.round(time - (test.time * 1000)) / 1000, test.file);
}
