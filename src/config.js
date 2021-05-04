const {existsSync} = require('fs');
const {resolve} = require('path');
const yargs = require('yargs/yargs');
const {hideBin} = require('yargs/helpers');
const defaults = require('./defaults');

/**
 * This function sets up Yargs to handle a config file and command line options
 * @returns {Object} Config
 */
function getConfig() {
	const config = yargs(hideBin(process.argv))
		.default(defaults)
		// .config({extends: './config.json'})
		.config('config', (path) => existsSync(resolve(path)) ? require(path) : existsSync(resolve('./config.js')) || existsSync(resolve('./config.json')) ? require('./config') : {})
		.usage('Usage: $0 --options [input] [output]')
		.demandCommand(2)
		.boolean('chart')
		.boolean('console')
		.boolean('test')
		// .completion()
		.argv;
	return config;
}
const config = getConfig();
if (require.main === module) config.command = true;
module.exports = config;
