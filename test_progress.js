const audio = require('./src');

function test() {
	// const wilhelm = audio.file.load('./samples/Wilhelm_tk4.wav', audio.config.sample.rate);
	const wilhelm = audio.file.load('./samples/Wilhelm_Scream.ogg', audio.config.sample.rate);
	console.log(Math.max(...wilhelm));
	const stft = audio.fft.stft(wilhelm, audio.config.stft);
	const filtered = [];
	// audio.fft.stft(wilhelm, audio.config.stft, audio.filter.callback('bands', 1, 0));
	// for (const peak of peaks) peak.unshift(index);
	// filtered.push(...audio.scale.peaks(peaks, audio.config.sample.rate, audio.config.stft.size));
	audio.fft.stft(wilhelm, audio.config.stft, (fft, index) => {
		const peaks = audio.filter.fft(fft, 'bands', 1, 0);
		for (const peak of peaks) peak.unshift(index);
		filtered.push(...audio.scale.peaks(peaks, audio.config.sample.rate, audio.config.stft.size));
	});
	const print = audio.print.loudest(filtered, "relative");
	console.log(print);
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
