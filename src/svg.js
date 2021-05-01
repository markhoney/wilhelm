const {writeFileSync} = require('fs');
const vega = require('vega');

module.exports = function chart(ft, filename) {
	// console.log(wave);
	const values = ft.map((value, index) => ({x: index, y: value}));
	// console.log(values);
	const chart = {
		$schema: 'https://vega.github.io/schema/vega/v5.json',
		description: 'Wilhelm Scream Frequency distribution',
		width: 400,
		height: 200,
		padding: 5,
		data: [{name: 'table', values}],
		signals: [
			{
				name: 'interpolate',
				value: 'linear',
				bind: {
					input: "select",
					options: [
						"basis",
						"cardinal",
						"catmull-rom",
						"linear",
						"monotone",
						"natural",
						"step",
						"step-after",
						"step-before",
					],
				},
			},
		],
		scales: [
			{
				name: 'xscale',
				type: 'linear',
				range: 'width',
				nice: true,
				zero: false,
				domain: {
					data: 'table',
					field: 'x',
				},
			},
			{
				name: 'yscale',
				type: 'linear',
				range: 'height',
				nice: true,
				zero: true,
				domain: {
					data: 'table',
					field: 'y',
				},
			},
		],
		axes: [
			{
				orient: 'bottom',
				scale: 'xscale',
				tickCount: 10,
			},
			{
				orient: 'left',
				scale: 'yscale',
			},
		],
		marks: [
			{
				type: 'line',
				from: {
					data: 'table',
				},
				encode: {
					enter: {
						x: {
							scale: 'xscale',
							field: 'x',
						},
						y: {
							scale: 'yscale',
							field: 'y',
						},
					},
				},
			},
		],
	};
	const view = new vega.View(vega.parse(chart), {renderer: 'none'});
	view.toSVG().then((svg) => writeFileSync(filename + '.svg', svg));
}
