const {resolve} = require('path');
const audio = require('./src');
const tests = require('./src/tests');

function test() {
	// const wilhelm = audio.file.load('./samples/Wilhelm_tk4.wav', audio.config.sample.rate);
	const wilhelm = audio.file.load('./samples/Wilhelm_Scream.ogg', audio.config.sample.rate);
	const stft = audio.fft.stft(wilhelm, audio.config.stft);
	const peaks = audio.filter.stft(stft, 'peaks', 1, 0);
	const needle = audio.filter.flatten(peaks);
	for (const test of tests) {
		const batman = audio.file.load(resolve(__dirname, 'test', test.file), audio.config.sample.rate);
		const haystack = [];
		let start = null;
		let leastsquares = 9999999999999;
		audio.fft.stft(batman, audio.config.stft, (fft, index) => {
			const peaks = audio.filter.fft(fft, 'peaks', 5, 0.005);
			// for (const peak of peaks) peak.unshift(index);
			haystack.push(peaks);
			if (haystack.length > needle.length * 1.5) {
				haystack.shift();
				const hay = audio.filter.flatten(haystack);
				let squares = 0;
				for (const needlet of needle) {
					let leastsquare = 999999999999;
					for (const straw of hay) {
						// console.log(needlet[0], straw[0], needlet[0] - straw[0], needlet[1], straw[1], needlet[1] - straw[1], needlet[2], straw[2], needlet[2] - straw[2]);
						// const square = Math.pow(needlet[0] - straw[0], 2) + Math.pow(needlet[1] - straw[1], 2) + Math.pow(needlet[2] - straw[2], 2);
						const square = [0, 1].reduce((total, index) => total + Math.pow(needlet[index] - straw[index], 2), 0);
						if (square < leastsquare) leastsquare = square;
					}
					squares += leastsquare;
				}
				if (squares < leastsquares) {
					leastsquares = squares;
					start = index;
				}
			}
		});
		console.log(Math.round(leastsquares), start / audio.config.stft.step, start);
	}
}

test();
