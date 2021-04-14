const babar = require('babar');
// const config = require('./config');

function pad(value) {
	return value.toString().padEnd(config.console.pad, ' ');
}

function line(values) {
	return values.map((value) => pad(value)).join('');
}

function lines(values) {
	return [line(Object.keys(values)), line(Object.values(values))].join('\n');
}

function graph(fft, width = 80, height = 40) {
	console.clear();
	console.log(babar(normalise(fft).map((value, index) => [index, value]), {width, height}));
}

module.exports = {lines, graph};
