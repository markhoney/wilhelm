const {stft} = require('./fft');

function points(wav, config) {
	const points = [];
	const slices = stft(wav, config.chunk);
	for (const [index, slice] of Object.entries(slices)) {
		let prints = config.print.peaks ? peaks(slice, config.print.magnitude) : bands(slice, config.print.magnitude);
		prints = prints.map((band) => [Math.floor((index * config.sample.step * 1000) / config.sample.rate), Math.round(band[0] * config.sample.rate / (config.sample.size * 2)), band[1]]);
		points.push(...prints);
	}
	return points;
}

function print(wav, config) {
	const slices = stft(wav, config.chunk);
	const fingerprint = [];
	for (const slice of slices) {
		let prints;
		if (config.frame.mode === 'peaks') prints = peaks(slice, config.print.magnitude);
		else /* if (config.frame.mode === 'bands') */ prints = bands(slice, config.print.magnitude);
		// const time = Math.floor(start * 1000 / chunk.rate);
		// const transform = fft(slice, chunk.window);
		// const slice = slice.map((peak) => );
		prints = prints.map((band) => [time, Math.round(band[0] * config.sample.rate / (config.frame.size * 2)), band[1]]);
		fingerprint.push(...prints);
	}
	return fingerprint;
}


module.exports = points;
