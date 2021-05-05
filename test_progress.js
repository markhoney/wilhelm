const audio = require('./src');

function test() {
	// const wilhelm = audio.file.load('./samples/Wilhelm_tk4.wav', audio.config.sample.rate);
	const wilhelm = audio.file.load('./samples/Wilhelm_Scream.ogg', audio.config.sample.rate);
	// console.log(wilhelm);
	const stft = audio.fft.stft(wilhelm, audio.config.stft);
	const filtered = [];
	audio.fft.stft(wilhelm, audio.config.stft, (fft, index) => {
		const filter = audio.filter.fft(fft, 'peaks');
		filtered.push(...filter.map((peak) => [
			Math.floor(index * 1000 / audio.config.sample.rate),
			Math.floor(peak[0] * audio.config.sample.rate * 0.5 / audio.config.stft.size),
			peak[1] * 100,
		]));
	});
	console.log(filtered);
	/* const needle = audio.print.centre(print, audio.config);
	for (const test of audio.tests) {
		const sample = audio.load(`./test/${test.file}`, audio.config.sample.rate);
		const haystack = audio.print.zones(audio.points(sample, audio.config), audio.config);
		const [time, score] = audio.match.centre(needle, haystack);
		console.log(score, time / 1000, Math.round(time - (test.time * 1000)) / 1000, test.file);
	}
	*/
}

test();
