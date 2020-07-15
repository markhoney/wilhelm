const {createReadStream, createWriteStream} = require("fs");
const {Transform, Writable} = require('stream');
const {spawn} = require('child_process');
// const wav = require('node-wav');
const wav = require('wav');

const {Converter} = require("ffmpeg-stream");
const converter = new Converter();

const interval = 8192;
const rate = 44100;
const overlap = 2;

const wav;
const input = converter
	// .createInputFromFile('./samples/Wilhelm_Scream.ogg')
	.createOutputStream({
		acodec: 'pcm_s16le',
		ar: rate,
		ac: 1,
		f: 'wav',
	})
	.on("data", (frame) => {
	})
	.on("end", () => {
	});

	const reader = new wav.Reader();
	reader.on('format', function (format) {
		console.log(format);
	});


	// createReadStream('./samples/Wilhelm_Scream.ogg').pipe(input);
	// createReadStream('./samples/Sintel (2010)-trailer.mkv').pipe(input);
	createReadStream('./samples/The Enemies Within (2016).mkv').pipe(input).pipe(reader);

const FingerPrint = new Transform({
	transform(chunk, encoding, callback) {
		console.log(chunk);
	}
});

const Write = new Writable({
	write(chunk, encoding, callback) {
		console.log(chunk);
	}
});
