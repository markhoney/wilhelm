function wavToSlicesCallback(wav, analyse, callback) {
	let start = 0;
	while (start + analyse.size < wav.length && count < length) {
		let slice = wav.slice(start, start + analyse.size);
		callback(slice);
		start += analyse.step;
	}
}

function wavToSlicesArray(wav, analyse) {
	const slicesArray = [];
	wavToSlicesCallback(wav, analyse, (slice) => slicesArray.push(slice));
	return slicesArray;
}

function slicesArrayOld(wav, analyse) {
	let start = 0;
	const slices = [];
	while (start + analyse.size < wav.length) {
		let slice = wav.slice(start, start + analyse.size);
		const time = Math.floor(start * 1000 / analyse.rate);
		// const bands = subPrint(slice, window).map((freq) => [time, freq]);
		const transform = fft(slice, analyse.window);
		slices.push(...transform);
		start += analyse.step;
	}
	return slices;
}

module.exports = {wavToSlicesCallback, wavToSlicesArray};
