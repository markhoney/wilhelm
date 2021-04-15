function similarity(one, two) {
	let variance = 0;
	for (const index of [1, 2, 3]) {
		variance += Math.abs(one[index] - two[index]); // This might need weighting for each of the three values we're comparing
	}
	return variance;
}

function match(needle, haystack) {
	for (const )
}
