function slice(wav, config, start = 0, length = 9999999) {
	let count = 0;
	const fingerprint = [];
	while (start + config.sample.size < wav.length && count < length) {
		let slice = wav.slice(start, start + config.sample.size);
		const time = Math.floor(start * 1000 / config.sample.rate);
		// const bands = subPrint(slice, window).map((freq) => [time, freq]);
		const transform = fft(slice, config.sample.window);
		const prints = bands(transform, config.print.magnitude).map((band) => [time, Math.round(band[0] * config.sample.rate / (config.sample.size * 2)), band[1]]);
		fingerprint.push(...prints);
		start += config.sample.step;
		count++;
	}
	return fingerprint;
}

module.exports = slice;
