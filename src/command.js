async function commandline() {
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
	const results = await analyse(config.needle, config.haystack, config.expected);
	console.log(results);
	results.delta = round(results.delta) + 's';
	results.rate = round(results.rate) + 'x';
	results.score = round(results.score);
	results.timecode += 's';
	results.expected = config.expected + 's';
	results.loadTime += 's';
	results.processTime += 's';
	results.haystack = config.haystack.split('.').slice(0, -1).join('.');
	if (config.console !== false) {
		const summary = Object.keys(results).reduce((stats, stat) => ({...stats, [headers[stat]]: results[stat]}), {});
		console.info(lines(summary));
	}
}

module.exports = commandline;
