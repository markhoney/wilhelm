const audioModules = require('./index');
const config = require('./config');
const { resolve } = require('path');
const { existsSync } = require('fs');
const { round, lines } = require('./console'); // Assuming round and lines are in console.js

/**
 * Reads the command line arguments and runs an audio search
 * @returns {Boolean} Whether the command succeeded
 */
function commandline() {
	const headers = {
		score: 'Best fit',
		sample: 'Sample',
		seconds: 'Length',
		timecode: 'Timecode',
		expected: 'Expected',
		delta: 'Delta',
		length: 'Length',
		loadTime: 'Load',
		processTime: 'Process',
		rate: 'Rate',
		haystack: 'File',
	};
	config.needle = resolve(config._[0]);
	if (!existsSync(config.needle)) {
		console.error(`Could not find needle file (expected ${config.needle})`);
		return;
	}
	config.haystack = resolve(config._[1]);
	if (!existsSync(config.haystack)) {
		console.error(`Could not find haystack file (expected ${config.haystack})`);
		return;
	}
	if (config._[2]) {
		config.output = resolve(config._[2]);
	}

	// Load audio data
	const needleData = audioModules.file.load(config.needle);
	const haystackData = audioModules.file.load(config.haystack);

	// TODO: The 'analyse' function logic needs to be reimplemented or mapped to new module structure
	// For now, let's assume points is the main analysis function.
	// We'll need to adapt the 'results' object structure based on what 'points' and other functions return.
	// This is a placeholder and will likely need significant adjustment.
	const needlePoints = audioModules.points(needleData, config);
	const haystackPoints = audioModules.points(haystackData, config);

	// Use match.centre to find the best match
	const [matchTimecode, matchScore] = audioModules.match.centre(needlePoints, haystackPoints, config); // Pass config

	// Placeholder for results - this needs to be properly implemented
	// based on how matching and analysis are done with the new modules.
	const results = {
		score: matchScore,
		delta: 0, // Placeholder - original logic for delta is unknown
		rate: 0, // Placeholder - original logic for rate is unknown
		timecode: matchTimecode !== null ? (matchTimecode / 1000) + 's' : 'N/A', // matchTimecode is in ms
		expected: config.expected + 's',
		loadTime: '0s', // Placeholder - this would come from file loading
		processTime: '0s', // Placeholder - this would come from analysis
		haystack: config.haystack.split('.').slice(0, -1).join('.'),
		// Note: 'sample' and 'length' from original headers are not directly produced here.
	};

	// The following lines for formatting results might need adjustment
	// once the actual analysis logic is in place.
	// results.delta = round(results.delta) + 's'; // round removed
	// results.rate = round(results.rate) + 'x'; // round removed
	// results.score = round(results.score); // round removed
	// results.timecode already has 's' // Handled above
	// results.expected already has 's'
	// results.loadTime already has 's'
	// results.processTime already has 's'
	// results.haystack is already set

	if (config.console !== false) {
		const summary = Object.keys(results).reduce((stats, stat) => {
			if (headers[stat] && results[stat] !== undefined) {
				return {...stats, [headers[stat]]: results[stat]};
			}
			return stats;
		}, {});
		console.info(lines(summary));
	}
	return true;
}

module.exports = commandline;
