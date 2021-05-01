function createPrint(anchor, point, mode = 'absolute') {
	if (mode === 'absolute') return [point[0], point[1], point[2]];
	else if (mode === 'relative') return [point[0] - anchor[0], point[1] - anchor[1], point[2] - anchor[2]];
	else if (mode === 'fractional') return [point[0] / anchor[0], point[1] / anchor[1], point[2] / anchor[2]];
	else if (mode === 'differential') return [(point[0] / anchor[0]) - 1, (point[1] / anchor[1]) - 1, (point[2] / anchor[2]) - 1];
	else if (mode === 'proportional') return [(anchor[0] - point[0]) / anchor[0], (anchor[1] - point[1]) / anchor[1], (anchor[2] - point[2]) / anchor[2]];
	else throw new Error('Invalid mode');
}

function centreMultiple(print, config) {
	const zones = [];
	while (print.length > config.gap + config.points) {
		const anchor = print.shift();
		for (let i = gap; i < config.gap + config.points; i++) {
			zones.push([anchor.slice(0, 1), createPrint(anchor, point, config.mode)]); // [anchor[time, frequency], relative[time, frequency, magnitude]]
		}
	}
	return zones;
}

function centreSingle(print, config) {
	const mid = Math.floor(print.length / 2);
	const anchor = print.splice(mid, 1)[0];
	const zones = [];
	zones.push(anchor);
	while (print.length) {
		const point = print.pop();
		zones.push(createPrint(anchor, point, config.mode));
	}
	return zones;
}

function zone(print, config) {
	const zones = [];
	const anchor = print.shift();
	while (print.length) {
		const point = print.shift();
		zones.push([anchor[1], ...createPrint(anchor, point, config.mode)]);
	}
	return zones;
}

function zones(print, config) {
	const zones = [];
	while (print.length > config.gap + config.points) {
		const anchor = print.shift();
		for (let i = config.gap; i < config.gap + config.points; i++) {
			zones.push([anchor.slice(0, 1), createPrint(anchor, point, config.mode)]); // [anchor[time, frequency], relative[time, frequency, magnitude]]
		}
	}
	return zones;
}

module.exports = {
	print: createPrint,
	zones,
	centre: centreSingle,
};
