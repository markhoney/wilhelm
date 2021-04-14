const {existsSync} = require('fs');
const {resolve} = require('path');
const yargs = require('yargs/yargs');
const {hideBin} = require('yargs/helpers');
const defaults = require('./defaults');
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

if (require.main === module) {
	config.command = true;
}
module.exports = config;
