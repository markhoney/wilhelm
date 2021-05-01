function slices(wav, analyse, start = 0, length = 9999999) {
	let count = 0;
	const slices = [];
	while (start + analyse.size < wav.length && count < length) {
		let slice = wav.slice(start, start + analyse.size);
		const time = Math.floor(start * 1000 / analyse.rate);
		// const bands = subPrint(slice, window).map((freq) => [time, freq]);
		const transform = fft(slice, analyse.window);
		slices.push(...transform);
		start += analyse.step;
		count++;
	}
	return slices;
}

module.exports = slice;
