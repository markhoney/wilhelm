const ft = require('fourier-transform');
var applyWindow = require('window-function/apply');

function fft(wav, window) {
	if (window) wav = applyWindow(wav, require('window-function/' + window));
	return ft(wav);
}

module.exports = fft;
