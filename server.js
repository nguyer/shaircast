"use strict";

var fs = require("fs");
var path = require("path");
var config = JSON.parse(fs.readFileSync("config.json"));

var AirTunesServer = require("nodetunes");
var server = new AirTunesServer({
	serverName: config.groupName
});

var AirplaySplitter = require("./airplay-splitter");
var airplay = new AirplaySplitter(config.endpoints);

/********** AIRPLAY BRIDGE **********/

server.on("clientConnected", function(stream) {
	console.log("clientConnected");
	try {
		airplay.startStreaming(stream);
	} catch(err) {
		console.log("clientConnected error: " + err);
	}
});

server.on("clientDisconnected", function(client) {
	console.log("clientDisconnected");
	try {
		airplay.stopStreaming();
	} catch(err) {
		console.log("clientDisconnected error: " + err);
	}
});

server.on("error", function(err) {
	console.log("Error: " + err.message);
});

server.on("metadataChange", function(metadata) {
	console.log("metadataChange");
	try {
		airplay.updateMetadata(metadata.minm, metadata.asar, metadata.asal);
	} catch(err) {
		console.log("metadataChange error: " + err);
	}
});

server.on("volumeChange", function(volume) {
	console.log("volumeChange");
	try {
		airplay.setVolume(volume);
	} catch(err) {
		console.log("volumeChange error: " + err);
	}
});

server.start();

console.log(config.groupName + " started");

/******* REMOTE CONTROL ********/

var express = require('express'),
	app = express(),
	port = process.env.PORT || 5010;

app.get('/speakers/:name/enable', function(req, res) {
	var name = req.params.name;
	try {
		airplay.enableSpeaker(name);
		res.send('Speaker ' + name + ' enabled');
	} catch(err) {
		res.status(400);
		res.send("Error: " + err);
	}
});

app.get('/speakers/:name/disable', function(req, res) {
	var name = req.params.name;
	try {
		airplay.disableSpeaker(name);
		res.send('Speaker ' + name + ' disabled');
	} catch(err) {
		res.status(400);
		res.send("Error: " + err);
	}
});

app.get('/speakers/:name', function(req, res) {
	try {
		var name = req.params.name;

		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify({
			enabled: airplay.isSpeakerEnabled(name)
		}));
	} catch(err) {
		res.status(400);
		res.send("Error: " + err);
	}
});

app.listen(port);

console.log('Shaircast remote control started on port ' + port);
