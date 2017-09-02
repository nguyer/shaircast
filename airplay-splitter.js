var airtunes = require("airtunes");
var rp = require('request-promise');
var Promise = require("bluebird");

function AirplaySplitter(speakers) {
		this.speakers = speakers;
		this.devices = {};
		this.currentStream;
}

AirplaySplitter.prototype.speaker = function(name) {
	if (!this.speakers[name]) {
		throw "Speaker '" + name + "' is not configured.";
	}

	return this.speakers[name];
}

AirplaySplitter.prototype.enableSpeaker = function(name) {
	console.log("Enabling speaker " + name);
	this.speaker(name).enabled = true;
	if (this.isStreaming()) {
		this.connectSpeaker(name);
	}
}

AirplaySplitter.prototype.disableSpeaker = function(name) {
	console.log("Disabling speaker " + name);
	this.speaker(name).enabled = false;
	if (this.isStreaming()) {
		this.disconnectSpeaker(name);
	}
}

AirplaySplitter.prototype.isSpeakerEnabled = function(name) {
	return !!this.speaker(name).enabled;
}

AirplaySplitter.prototype.connectSpeaker = function(name) {
	console.log("Connecting speaker " + name);

	var self = this;
	var speaker = this.speaker(name);
	console.log("Adding " + name + " (" + speaker.host + ")");

  var powerOn = (speaker.powerOnRequest ? rp(speaker.powerOnRequest) : Promise.resolve());

	powerOn.then(function() {
		self.devices[name] = airtunes.add(speaker.host, speaker.options);
	}).catch(function(error) {
		throw "Power on of " + name + " failed with " + error;
	});
}

AirplaySplitter.prototype.disconnectSpeaker = function(name) {
	if (this.devices[name]) {
		console.log("Disconnecting speaker " + name);

		this.devices[name].stop(function() {
			console.log("Device " + name + " stopped");
		});

		delete this.devices[name];

		if (this.devices[name].powerOffRequest) {
			rp(speaker.powerOffRequest).catch(function(error) {
				// Power off error is not a severe. Will go to standby at some point
				console.log("Power off failed with " + error);
			});
		}
	} else {
		console.log("Speaker " + name + " is not connected");
	}
}

AirplaySplitter.prototype.isStreaming = function() {
	return !!this.currentStream;
}

AirplaySplitter.prototype.startStreaming = function(stream) {
	console.log("Starting streaming");
	if (this.isStreaming()) {
		console.log("Already streaming. Stop that first.");
		this.stopStreaming();
	}

	this.devices = {};

	for (var name in this.speakers) {
		var speaker = this.speaker(name);
		if (speaker.enabled) {
			this.connectSpeaker(name);
		}
	}

	this.currentStream = stream;
	stream.pipe(airtunes);
}

AirplaySplitter.prototype.stopStreaming = function() {
	console.log("Stopping streaming");

	this.currentStream.unpipe();
	airtunes.stopAll(function() {
		console.log("All devices stopped")
	});

	this.devices = {};
	this.currentStream = null;
}

AirplaySplitter.prototype.setVolume = function(volume) {
	volume = (volume + 30) / 30 * 100
	console.log("Changing volume to " + volume);
	for (var key in this.devices) {
		this.devices[key].setVolume(volume);
	}
}

AirplaySplitter.prototype.updateMetadata = function(title, artist, album) {
	console.log("Now playing \"" + title + "\" by " + artist + " from \"" + album + "\"");

	for (var key in this.devices) {
		this.devices[key].setTrackInfo(title, artist, album);
	}
}

module.exports = AirplaySplitter;
