# Wilhelm Scream Detector

This code attempts to fingerprint and detect the Wilhelm scream in movies, using a custom Short Time Fourier Transform (STFT).

## Requirements

### FFMPEG

FFMPEG needs to be installed and in your path for audio extraction from video files to work.

This can be done with Chocolatey for Windows (`choco install -y ffmpeg`), Homebrew for Mac (`brew install ffmpeg`) or your package manager for Linux (e.g. `sudo apt install ffmpeg` for Ubuntu).

## Technical

The code uses an efficient Fast Fourier Transform (FFT) library to calculate the audio frequencies present in a series of overlapping snapshots (which each need to be of length 2 to an integer power of samples, e.g. 128, 512 or 4096) of small sections of a piece of source audio (e.g. the Wilhelm Scream). This gives a form of audio fingerprint, where each part of the fingerprint consists of an array of intensities of a range of audio frequencies (the Fourier Transform of that snapshot). The code then uses another library to attempt to match each of the parts of the fingerprint to a target audio file. It does this by moving along the audio file and taking a series of fingerprints that match the metrics of the source audio sample, and then using an array correlation library to work out how closely each of the parts of the source and target fingerprints match. Each starting timecode for the target audio is given a score for the closeness of the match, and the closest matching results, above a threshold, are returned - these are the audio timecodes where the source audio is most likely to be found in the target file.
