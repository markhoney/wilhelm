function percent(a, b) {
	// return Math.ceil(Math.abs((a - b) / Math.min(a, b)) * 100);
	return Math.ceil(Math.abs((a - b) / Math.min(a, b)) * 100);
}

function variance(a, b) {
	let variance = 0;
	for (const index of a.keys()) {
		// variance += Math.abs(a[index] - a[index]); // This might need weighting for each of the three values we're comparing
		variance += percent(a[index], b[index]);
	}
	return variance;
}

function match(needle, haybale) {
	// console.log('needle', needle, 'haybale', haybale);
	let total = 0;
	for (const point of needle) {
		let closest = 9999999;
		for (const hay of haybale) {
			const diff = variance(point, hay);
			if (diff < closest) {
				closest = diff;
			}
		}
		total += closest;
	}
	return total;
}

function centre(needle, haystack) {
	const anchor = needle.shift();
	let lowest = 999999999;
	let time = null;
	for (const index of haystack.keys()) {
		const hay = haystack[index];
		if (percent(hay[1], anchor[1]) < 10) {
			const score = match(needle, haystack.slice(index - needle.length, index + needle.length).map((point) => [point[0] - hay[0], point[1]]));
			if (score < lowest) {
				lowest = score;
				time = hay[0];
			}
		}
	}
	return [time, lowest];
}

function shazam(needle, haystack) {
	let score = 0;
	for (const print of needle) {
		const matches = haystack.filter((hay) => hay[2] === print[2] && hay[3] === print[3]);
		score += matches.length;
	}
	return score;
}

module.exports = {
	shazam,
	centre,
};
