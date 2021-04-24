const points = require('./points');

function zonesDict(wav, config) {
	const print = points(wav, config);
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
	const print = points(wav, config);
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
	const print = points(wav, config);
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
	const print = points(wav, config);
	const zones = [];
	const anchor = print.shift();
	while (print.length) {
		const point = print.shift();
		zones.push([anchor[1], point[1], point[0] - anchor[0]]);
	}
	return zones;
}

function zonesArray(wav, config) {
	const print = points(wav, config);
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
	zones: zonesArray,
	centre: centreZoneArray,
};
