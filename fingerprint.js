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

const input = converter
	// .createInputFromFile('./samples/Wilhelm_Scream.ogg')
	.createOutputStream({
		acodec: 'pcm_s16le',
		ar: rate,
		ac: 1,
		f: 'wav',
	})
	// .pipe(new ExtractFrames("FFD8FF")) // use jpg magic number as delimiter
	.on("data", frame => {
		/* do things with frame (instance of Buffer) */
		console.log(wav.decode(frame));
	})
	.on("end", () => {
		/* do things on complete */
	});

	// createReadStream('./samples/Wilhelm_Scream.ogg').pipe(input);
	// createReadStream('./samples/Sintel (2010)-trailer.mkv').pipe(input);
	createReadStream('./samples/The Enemies Within (2016).mkv').pipe(input);



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

function getStream(file) {
	const decoder = spawn('ffmpeg', [
		'-i', file,
		'-acodec', 'pcm_s16le',
		'-ar', rate,
		'-ac', 1,
		'-f', 'wav',
		'-v', 'fatal',
		'pipe:1'
	], {stdio: ['pipe', 'pipe', process.stderr]});
	process.stdin.pipe(decoder.stdin);
	decoder.stdout.pipe(FingerPrint);
	// return decoder.stdout;
}

// const stream = getStream('./samples/Wilhelm_Scream.wav');

// stream.pipe(FingerPrint);

/* stream.on('data', function(data) {
	console.log(data);
}); */
