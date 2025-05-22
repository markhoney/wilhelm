const { stft } = require('./fft');
const { filters, maxima } = require('./filter'); // Import necessary functions

function points(wav, config) {
	const points = [];
	// Ensure stft is called with config.stft, not config.chunk if it's an alias
	const stftConfig = config.stft || config.chunk; // Use stft config, fallback to chunk if it was an old alias
	const slices = stft(wav, stftConfig);

	for (const [slice_index_str, slice] of Object.entries(slices)) {
		const slice_index = parseInt(slice_index_str, 10);
		let filtered_peaks_for_slice;

		// 1. Determine strategy from config.filter.mode and call filter function
		if (config.filter.mode === 'bands') {
			filtered_peaks_for_slice = filters.bands(slice, config.filter.limit);
		} else if (config.filter.mode === 'peaks') {
			filtered_peaks_for_slice = filters.peaks(slice, config.filter.limit, config.filter.smooth);
		} else {
			// Default or error handling if mode is not recognized
			console.warn(`Unsupported filter mode: ${config.filter.mode}. Defaulting to peaks.`);
			filtered_peaks_for_slice = filters.peaks(slice, config.filter.limit, config.filter.smooth);
		}

		// 2. Apply magnitude thresholding using maxima
		filtered_peaks_for_slice = maxima(filtered_peaks_for_slice, config.filter.magnitude);

		// 3. Implement Band-Pass Filtering
		const band_passed_points = [];
		for (const peak of filtered_peaks_for_slice) {
			const frequency_bin_index = peak[0];
			const magnitude = peak[1];
			// Convert frequency_bin_index to actual frequency in Hz
			const freq_hz = frequency_bin_index * config.sample.rate / (stftConfig.size * 2);

			if (freq_hz >= config.filter.low && freq_hz <= config.filter.high) {
				band_passed_points.push([frequency_bin_index, magnitude, freq_hz]); // Keep freq_hz for final mapping
			}
		}

		// 4. Final Point Mapping
		const final_prints = band_passed_points.map((band) => {
			const time_ms = Math.floor((slice_index * stftConfig.step * 1000) / config.sample.rate);
			// Freq_hz is already calculated and stored in band[2]
			// We need to round it if the original did, or ensure it's used directly.
			// The original rounded band[0] * factor, so we round the pre-calculated freq_hz.
			const freq_hz_rounded = Math.round(band[2]);
			const magnitude = band[1];
			return [time_ms, freq_hz_rounded, magnitude];
		});

		points.push(...final_prints);
	}
	return points;
}

// Remove the old 'print' function if it's no longer needed or update it similarly.
// For now, assuming 'points' is the primary function to be refactored.
// If 'print' function is still used, it should undergo a similar refactoring.
// Based on the previous subtasks, `command.js` uses `audioModules.points`, so the old `print` is likely unused.

module.exports = points;
