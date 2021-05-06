const audio = require('./audio');

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
	audio.config.needle = resolve(audio.config._[0]);
	if (!existsSync(audio.config.needle)) {
		console.error(`Could not find needle file (expected ${audio.config.needle})`);
		return;
	}
	audio.config.haystack = resolve(audio.config._[1]);
	if (!existsSync(audio.config.haystack)) {
		console.error(`Could not find haystack file (expected ${audio.config.haystack})`);
		return;
	}
	audio.config.output = resolve(audio.config._[2]);
	const results = audio.analyse(audio.config.needle, audio.config.haystack, audio.config.expected);
	console.log(results);
	results.delta = round(results.delta) + 's';
	results.rate = round(results.rate) + 'x';
	results.score = round(results.score);
	results.timecode += 's';
	results.expected = audio.config.expected + 's';
	results.loadTime += 's';
	results.processTime += 's';
	results.haystack = audio.config.haystack.split('.').slice(0, -1).join('.');
	if (audio.config.console !== false) {
		const summary = Object.keys(results).reduce((stats, stat) => ({...stats, [headers[stat]]: results[stat]}), {});
		console.info(lines(summary));
	}
	return true;
}

module.exports = commandline;
