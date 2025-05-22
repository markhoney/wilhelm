const EPSILON = 1e-6; // Define epsilon

function percent(a, b) {
	// return Math.ceil(Math.abs((a - b) / Math.min(a, b)) * 100); // Original
	return (Math.abs(a - b) / (Math.min(a, b) + EPSILON)) * 100; // Revised
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
	if (!needle || needle.length === 0) {
		return 999999999; // Return a high score if needle is empty
	}
	let total_variance = 0;
	for (const point of needle) {
		let closest_variance_for_point = 9999999; // Renamed for clarity
		for (const hay of haybale) {
			const diff = variance(point, hay); // variance now uses the revised percent
			if (diff < closest_variance_for_point) {
				closest_variance_for_point = diff;
			}
		}
		total_variance += closest_variance_for_point;
	}
	return total_variance / needle.length; // Return average variance
}

function centre(needleInput, haystack, config) { // Renamed needle to needleInput to avoid modification issues
	if (!needleInput || needleInput.length === 0) {
		return [null, 999999999]; // No anchor if needle is empty
	}
	// Clone needleInput before shifting to prevent modifying the original array if it's used elsewhere
	const needle = [...needleInput]; 
	const anchor = needle.shift(); // Now needle is shorter and used for match()
	let lowest = 999999999;
	let time = null;
	const threshold = config && config.match && typeof config.match.anchor_threshold_percent === 'number'
		? config.match.anchor_threshold_percent
		: 10; // Default to 10 if not provided or invalid

	for (const index of haystack.keys()) {
		const hay = haystack[index];
		// Ensure anchor and hay[1] are valid numbers before calling percent
		if (typeof anchor[1] === 'number' && typeof hay[1] === 'number') {
			if (percent(hay[1], anchor[1]) < threshold) { // Use the threshold from config
				// Ensure needle (after shift) still has points for matching
				if (needle.length > 0) {
					const score = match(needle, haystack.slice(index - needle.length, index + needle.length).map((point) => [point[0] - hay[0], point[1]]));
					if (score < lowest) {
						lowest = score;
						time = hay[0];
					}
				} else if (lowest > 0 && anchor[1] !== undefined) { 
					// If only anchor was present, and it matched, score is effectively 0 (perfect for that single point)
					// This case might need more thought based on desired behavior for single-point needles.
					// For now, if needle becomes empty after shift, a match implies a perfect score (0) for the anchor.
					// Let's consider a score of 0 if anchor matches and needle (post-shift) is empty.
					// However, the original `match` function would not have been called with an empty `needle`.
					// The `match` function now handles empty `needle` by returning a high score.
					// If `needle.shift()` results in an empty `needle`, `match(needle, ...)` will return high score.
					// This means we only get a low score if the *remaining* points in `needle` also match well.
					// If anchor matches but the rest of `needle` (if any) doesn't, score will be high.
					// If anchor matches and `needle` (post-shift) is empty, the current `match` will return high.
					// This behavior seems reasonable: a match requires more than just an anchor if needle had more points.
				}
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
