# Wilhelm Scream Detector

This code attempts to fingerprint and detect the [Wilhelm scream](https://intelligentsoundengineering.wordpress.com/2017/04/19/322/
) in movies, using a custom Short Time Fourier Transform (STFT). However, this code can also be used to detect any sound, including other [stock sound effects](https://tvtropes.org/pmwiki/pmwiki.php/Main/StockSoundEffects).

## Requirements

### FFMPEG

FFMPEG needs to be installed and in your path for audio extraction from video files to work.

This can be done with Chocolatey for Windows (`choco install -y ffmpeg`), Homebrew for Mac (`brew install ffmpeg`) or your package manager for Linux (e.g. `sudo apt install ffmpeg` for Ubuntu).

## Technical

The code uses an efficient Fast Fourier Transform (FFT) library to calculate the audio frequencies present in a series of overlapping snapshots (which each need to be of length 2 to an integer power of samples, e.g. 128, 512 or 4096) of small sections of a piece of source audio (e.g. the Wilhelm Scream). A Window function is applied to these snapshots, which puts more weight on the frequencies at the centre of the snapshot than the edges. This gives a spectrogram, where for each sampled time slice there is an array of intensities of audio frequencies (the Fourier Transform of that snapshot). A Fast Fourier Transform (FFT) is used, rather than a Discrete Fourier Transform (DFT), as it is a much quicker algorithm - with the restriction that the number of samples must be a power of 2 (e.g. 1024, 8192). [Overlapping windows](http://blog.phash.org/posts/audioscout) can be used, to increase the number of samples that are taken, by adjusting the sample size (which, as stated before, must be a power of 2) and sample step so that the sample step is smaller than the sample size.

Once we have an array of frequency magnitudes, we need to use a form of [perceptual hashing](https://en.wikipedia.org/wiki/Perceptual_hashing) to detect similarities between our two audio sources. We use a fingerprinting method similar to that used by Shazam, thanks to a [great breakdown](http://coding-geek.com/how-shazam-works/) of the technology from the Coding Geek website. We first separate our frequencies into groups, with the group size being larger the higher the frequency. We then find the frequency in each of these groups with the largest magnitude, and discard the other frequencies. We average the magnitude of our resulting frequency peaks and discard any that are lower than the average.

We now discard our magnitudes, and save a set of data arrays using the weird and wonderful idea of anchor points. For each anchor point, we save data about a set of points close to the anchor - each point's frequency and temporal distance from the anchor.

A future avenue might be to use some kind of distance measurement - possibly by encoding all data points as ASCII strings and using an [Edit Distance](https://en.wikipedia.org/wiki/Edit_distance) algorithm such as the [Levenshtein Distance](https://www.npmjs.com/package/levenshtein).
