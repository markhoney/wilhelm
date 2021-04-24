const {stft} = require('./fft');
const peaks = require('./peaks');
const bands = require('./bands');

function points(wav, config) {
	const points = [];
	const slices = stft(wav, config.sample);
	for (const [index, slice] of Object.entries(slices)) {
		let prints = config.print.peaks ? peaks(slice, config.print.magnitude) : bands(slice, config.print.magnitude);
		prints = prints.map((band) => [Math.floor((index * config.sample.step * 1000) / config.sample.rate), Math.round(band[0] * config.sample.rate / (config.sample.size * 2)), band[1]]);
		points.push(...prints);
	}
	return points;
}

module.exports = points;
