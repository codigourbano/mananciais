#!/usr/bin/env node

var program = require('commander'),
	colorsTmpl = require('colors-tmpl'),
	tablify = require('tablify'),
	fs = require('fs'),
	_ = require('underscore'),
	csv = require('csv'),
	scrap = require('./lib/scrap'),
	request = require('request');

function print(s) {
	console.log(colorsTmpl(s));
}

program
	.version('0.0.1')
	.option('-u, --update', 'Scrap data from SABESP and update local database')
	.option('-d, --date [value]', 'Get specific date from database.')
	.option('-m, --manancial [value]', 'Get info on specific date from an especific water system. Date parameter is required')
	.option('serve', 'Run server and update database on a 3 hours interval')
	.parse(process.argv);

if(program.date) {
	if(typeof(program.date) == 'string') {
		csv().from.path('data/data.csv', {
			columns: true
		}).to.array(function(data) {
			if(program.manancial && typeof(program.manancial) == 'string') {
				print('\n{yellow}{bold}Buscando dados em: ' + program.date + ' de ' + program.manancial + '{/bold}{/yellow}\n');
				print(tablify(_.filter(data, function(d) { return d['data'] == program.date && d['manancial'] == program.manancial; })));
			} else {
				print('\n{yellow}{bold}Buscando dados em: ' + program.date + '{/bold}{/yellow}\n');
				print(tablify(_.filter(data, function(d) { return d['data'] == program.date; })));
			}
		});
	}
}

if(program.update) {

	print('{yellow}{bold}Scrapping data{/bold}{/yellow}');
	scrap();

}

if(program.serve) {

	var port = process.env.PORT || 3000;

	var express = require('express');

	var app = express();

	// Bootstrap application settings
	require('./config/express')(app);

	// Bootstrap routes
	require('./config/routes')(app);


	// Init update routine
	// setInterval(scrap, 1000 * 60 * 60 * 3); // 3 hours interval
	// scrap();

	app.listen(port, function() {
		print('{yellow}{bold}Server running at port ' + port + '{/bold}{/yellow}');
		print('{bold}Data url: http://localhost:' + port + '/data.csv{/bold}');
	});

}