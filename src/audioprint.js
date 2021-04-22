const fft = require('./fft');
const peaks = require('./peaks');
const bands = require('./bands');

// const square = (arr) => arr.map((element) => Math.pow(element, 2));

/* function normalise(array, value) {
	const ratio = Math.max.apply(Math, array) / value;
	return array.map((element) => element / ratio);
} */

function audioPrint(wav, config, start = 0, length = 9999999) {
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

function zonesDict(wav, config) {
	const print = audioPrint(wav, config);
	const zones = {};
	while (print.length > config.print.gap + config.print.points) {
		const anchor = print.shift();
		for (let i = gap; i < config.print.gap + config.print.points; i++) {
			// if (!zones[anchor[0]]) zones[anchor[0]] = {};
			// if (!zones[anchor[0]][anchor[1]]) zones[anchor[0]][anchor[1]] = [print[i][1], print[i][0] - anchor[0]];
			// zones[`${anchor[1]}|${print[i][1]}|${print[i][0] - anchor[0]}`] = anchor[0];
		}
	}
	return zones;
}

function centreZonesArray(wav, config) {
	const print = audioPrint(wav, config);
	const zones = [];
	while (print.length > config.print.gap + config.print.points) {
		const anchor = print.shift();
		for (let i = gap; i < config.print.gap + config.print.points; i++) {
			zones.push([anchor[0], anchor[1], print[i][1], print[i][0] - anchor[0]]);
		}
	}
	return zones;
}

function centreZoneArray(wav, config) {
	const print = audioPrint(wav, config);
	// console.log(print);
	const mid = Math.floor(print.length / 2);
	const anchor = print.splice(mid, 1)[0];
	const zones = [];
	zones.push(anchor);
	while (print.length) {
		const point = print.pop();
		zones.push([point[0] - anchor[0], point[1]]);
	}
	return zones;
}

function zoneArray(wav, config) {
	const print = audioPrint(wav, config);
	const zones = [];
	const anchor = print.shift();
	while (print.length) {
		const point = print.shift();
		zones.push([anchor[1], point[1], point[0] - anchor[0]]);
	}
	return zones;
}

function zonesArray(wav, config) {
	const print = audioPrint(wav, config);
	const zones = [];
	while (print.length > config.print.gap + config.print.points) {
		const anchor = print.shift();
		for (let i = config.print.gap; i < config.print.gap + config.print.points; i++) {
			zones.push([anchor[0], anchor[1], print[i][1], print[i][0] - anchor[0]]);
		}
	}
	return zones;
}

module.exports = {
	print: audioPrint,
	zones: zonesArray,
	centre: centreZoneArray,
};
