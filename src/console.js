const babar = require('babar');
// const config = require('./config');

/**
 * Takes a piece of data and turns it into a padded string
 * @param {*} value Data to be padded
 * @returns {string}
 */
function pad(value, pad) {
	return value.toString().padEnd(pad, ' ');
}

/**
 * Takes an array of values and turns them into a padded printout line
 * @param {*[]} values A set of data values
 * @returns {string} Data line
 */
function line(values) {
	return values.map((value) => pad(value)).join('');
}

/**
 * Takes a set of data lines and turns them into newline separated padded strings
 * @param {*[]} values A set of data lines
 * @returns {string} Printout
 */
function lines(values) {
	return [line(Object.keys(values)), line(Object.values(values))].join('\n');
}

/**
 * Takes a Fourier Transform array and prints it to the command line as a bar graph
 * @param {number[]} fft Fourier Transform
 * @param {number} width Width in characters
 * @param {number} height Height in characters
 */
function graph(fft, width = 80, height = 40) {
	console.clear();
	console.log(babar(fft.map((value, index) => [index, value]), {width, height}));
}

module.exports = {lines, graph};
