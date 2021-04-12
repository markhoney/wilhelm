var audio;
var analyser;
var aTimeout;
var noisePrintRaw = [];
var quantise = 256;
var notZero = false;
var noisePrints;
var limitPoints = 6;
var spectrumlinecount = 0;
var fftSize = 2048;

function normalizeArray(array, value) {
	var ratio = Math.max.apply(Math, array) / value;
	var numbers = [...array];
	for (var i = 0; i < array.length; i++) {
		numbers[i] = (numbers[i] / ratio);
	}
	return numbers;
}

function squareArray(array) {
	var numbers = [...array];
	for (var i = 0; i < array.length; i++) {
		numbers[i] = numbers[i] * numbers[i];
	}
	return numbers;
}

function addToSpectrum() {
	dataArray = squareArray(dataArray);
	dataArray = normalizeArray(dataArray, quantise);
	var reducedArray = [];
	for (var i = startat; i < endat * freqStep; i += freqStep) {
		var value = 0.0;
		for (var ii = i; ii < Math.min(analyser.frequencyBinCount, i + freqStep); ii++) {
			value = Math.max(value, dataArray[ii]);
		}
		value = Math.round(value);
		if (value > 0) {
			notZero = true;
		}
		reducedArray.push(value);
	}
	var pointCount = 0;
	var fftArray = [...reducedArray];
	for (var i = 0; i < reducedArray.length; i += Math.round((endat - startat) / pointGroups)) {
		var mx = 0.0;
		for (var ii = 0; ii < Math.round((endat - startat) / pointGroups); ii++) {
			mx = Math.max(mx, reducedArray[i + ii]);
		}
		for (var ii = 0; ii < Math.round((endat - startat) / pointGroups); ii++) {

			if (reducedArray[i + ii] != mx || pointCount === limitPoints) { // || reducedArray[i + ii] < (quantise / 2) -gate
				reducedArray[i + ii] = 0;
			} else {
				reducedArray[i + ii] = quantise;
				pointCount++;
			}
		}
	}

	for (var i = 0; i < fftArray.length; i++) {
		var f = $("<div />");
		if (reducedArray[i] === 0) {
			f.css("backgroundColor", "rgb(" + (fftArray[i] * (256 / quantise)) / 2 + ",0," + (255 - (fftArray[i] * (256 / quantise))) / 2 + ")");
		} else {
			f.css("backgroundColor", "rgb(" + reducedArray[i] * (256 / quantise) + "," + ((reducedArray[i] * (256 / quantise)) - 128) * 2 + ",0)");
		}
		sl.append(f);
	}
	if (firstrun) {
		firstrun = false;
	}
	if (notZero) {
		$(".spectrum").append(sl).scrollLeft(1000000);
		noisePrintRaw.push(reducedArray);
	}

}


function saveNoisePrint() {
	audio.pause();
	clearTimeout(aTimeout);
	noisePrints[selectedAudioFile] = noisePrintRaw;
	setupNoisePrints();
	localStorage.setItem("noiseprints", JSON.stringify(noisePrints));
}



function matchClip(name) {
	console.clear();
	$(".output").html("");
	var scores = {};
	scores.min = 99999999;
	scores.max = 0;

	Object.keys(noisePrints).forEach(function (k) { // go round each song in the 'database'

		if (!k.includes("clip")) {
			var matchScore = 0;
			var lookForward = 1;
			for (var i = 0; i < noisePrints[name].length - lookForward; i++) { // go round each slice of the noiseprint you want to match
				var anchor = -2;
				while (anchor !== -1) {
					if (anchor === -2) anchor = -1;
					anchor = noisePrints[name][i].indexOf(quantise, anchor + 1);
					if (anchor !== -1) {
						var points = [];
						var ii = 0;
						var offset = anchor;
						while (points.length < 4 && ii < 2) {
							var newPoint = noisePrints[name][i + ii].indexOf(quantise, offset + 1);
							if (newPoint !== -1) {
								points.push(newPoint);
								offset = newPoint;
							} else {
								ii++;
								offset = -1;
							}
						}

						if (points.length === 4) {

							for (var ki = 1; ki < noisePrints[k].length - lookForward; ki++) {
								if (noisePrints[k][ki][anchor] === quantise) {
									var localMatchScore = 0;
									for (var px = 0; px < 4; px++) {
										for (var sx = 0; sx < lookForward + 1; sx++) {
											if (noisePrints[k][ki + sx][points[px]] === quantise) {
												localMatchScore++;
											}
										}
									}
									if (localMatchScore > 3) {
										matchScore++;
									}
								}
							}
						}

					}
				}

			}
			matchScore = (matchScore / noisePrints[k].length)
			console.log("score: " + k + " " + matchScore);
			scores.min = Math.min(scores.min, matchScore);
			scores.max = Math.max(scores.max, matchScore);
			scores[k] = {};
			scores[k].score = matchScore;

		}
	});
}
