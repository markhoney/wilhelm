function slices(wav, config, start = 0, length = 9999999) {
	let count = 0;
	const slices = [];
	while (start + config.sample.size < wav.length && count < length) {
		let slice = wav.slice(start, start + config.sample.size);
		const time = Math.floor(start * 1000 / config.sample.rate);
		// const bands = subPrint(slice, window).map((freq) => [time, freq]);
		const transform = fft(slice, config.sample.window);
		slices.push(...prints);
		start += config.sample.step;
		count++;
	}
	return fingerprint;
}

module.exports = slices;
