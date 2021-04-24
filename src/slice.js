function slice(wav, config, start = 0, length = 9999999) {
	let count = 0;
	const slices = [];
	while (start + config.sample.size < wav.length && count < length) {
		const slice = wav.slice(start, start + config.sample.size);
		slices.push(...slice);
		start += config.sample.step;
		count++;
	}
	return slices;
}

module.exports = slice;
