const {Transform, Writable} = require('stream');
const extractAudio = require('ffmpeg-extract-audio');
const wav = require('wav');
const nwav = require('node-wav');
const concat = require('concat-stream');

const concatStream = concat(waveFile);

function waveFile(buffer) {
	const audio = nwav.decode(buffer);
	console.log(audio.sampleRate);
}


const FingerPrint = new Transform({
	transform(chunk, encoding, callback) {
		callback();
	}
});

const reader = new wav.Reader();
reader.on('format', function (format) {
	// reader.pipe(new Speaker(format));
	console.log(format);
});

async function stream() {
	const stream = await extractAudio({
		input: './samples/Sintel (2010)-trailer.mkv',
		format: 'wav',
		/* transform: (cmd) => {
			// console.log(cmd);
		} */
	});
	stream.pipe(concatStream);
}

stream();
