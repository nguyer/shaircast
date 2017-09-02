shaircast
====================
*So your iPhone can play music all around your house*

AirPlay is cool if you want to stream music from your phone to one room in your house. But who has a house with one room? iTunes will let you stream to multiple speakers, but who wants to only listen to what they have in iTunes on their computer?

This is a *major* first world problem. shaircast solves this problem. shaircast is a super simple Node.js application that combines [nodetunes](https://github.com/stephen/nodetunes) and [node-airtunes](https://github.com/lperrin/node_airtunes) to take a single AirPlay stream (from your iPhone or iPad) and broadcast it to multiple AirPlay speakers. Oh, and it keeps everything in sync too! Like magic!

I use a couple of Raspberry Pis plugged into speakers, running [shairport-sync](https://github.com/mikebrady/shairport-sync). shaircast also runs great on a Raspberry Pi 2, side by side with shairport-sync, so you don't even have to have a huge server to run it!

##How do I get it?
You will need Node.js. And a computer. Hopefully you have one of those.

> Note: Because of a project dependency, for now shaircast only works on Node.js 0.10.x. Hopefully in the future it will also work on Node.js 0.12.x.

First, get the code from GitHub:

	$ git clone https://github.com/nguyer/shaircast

Then install the dependencies:

	$ cd shaircast
	$ npm install

### Configuration

There is a file called `config.json` in the application directory. You should modify it to list the IP addresses of the AirPlay speakers you wish to broadcast to. You can also set the name of the group in the config file.

A minimal config file looks like this:

```json
{
	"groupName": "All Speakers",
	"endpoints": {
		"kitchen": {
			"host": "192.168.1.116",
			"enabled": true
		},
		"living-room": {
			"host": "192.168.1.117",
			"enabled": true
		}
	}
}
```

See below for a full example with all options.

### Starting the server
Just run:

	$ npm start

### Connect and play!
If your server and iOS device are on the same network, you should see a new AirPlay target called "All Speakers", or whatever you named your group in the `config.json`. Select that AirPlay target and start playing!

## Advanced Configuration
The main part of the configuration is a list of endpoints, i.e. the Airplay speakers.
Each speaker has a name as key, which is also used as identifier in the remote control API.
The speaker configuration consists of:

- **host**: Hostname or IP-address of the Airplay speaker (required)
- **options**: Options object passed to *airtunes* (optional)
- **powerOnRequest**: Request sent before starting to stream. Automatic wake-up from sleep does not work reliably with airtunes, so a manual wake-up is recommended. The value is a [node request](https://www.npmjs.com/package/request) object. Below example shows the power-on request of a Yamaha MusicCast WX-030 for kitchen and the power-on command for a Yamaha AVR in living room (optional)
- **powerOffRequest**: Just like `powerOnCommand`, but sent after the server disconnects from a speaker. (optional)
- **enabled**: By default, all speakers are disconnected and require explicit enablement via the remote-control API. If `enabled` is set to true, then the speakers are enabled by default without doing an API call first. (optional)

```
{
	"groupName": "All Speakers",
	"endpoints": {
		"kitchen": {
			"host": "192.168.1.116",
			"powerOnRequest": {
				"url": "http://192.168.1.116/YamahaExtendedControl/v1/main/setPower?power=on"
			},
			"powerOffRequest": {
				"url": "http://192.168.1.116/YamahaExtendedControl/v1/main/setPower?power=standby"
			}
		},
		"living-room": {
			"host": "192.168.1.117",
			"options": {
				"port": 1028
			},
			"powerOnRequest": {
				"url": "http://192.168.1.117/YamahaRemoteControl/ctrl",
				"method": "POST",
				"headers": {
					"Content-Type": "application/xml"
				},
 				"body": "<YAMAHA_AV cmd=\"PUT\"><Main_Zone><Power_Control><Power>On</Power></Power_Control></Main_Zone></YAMAHA_AV>"
			},
			"powerOffRequest": {
				"url": "http://192.168.1.53/YamahaRemoteControl/ctrl",
				"method": "POST",
				"headers": {
					"Content-Type": "application/xml"
				},
 				"body": "<YAMAHA_AV cmd='PUT'><Main_Zone><Power_Control><Power>Standby</Power></Power_Control></Main_Zone></YAMAHA_AV>"
			}
		}
	}
}
```

## Remote control API
Shaircast exposes an API on port `5010` to enable or disable speakers and to retrieve the current status.

- `http://localhost:5010/speakers/kitchen`: returns the `enabled`-status of the speaker
- `http://localhost:5010/speakers/kitchen/enable`: enables the speaker with name `kitchen`. Audio steam will be forwarded to this speaker.
- `http://localhost:5010/speakers/kitchen/disable`: disables the speaker with name `kitchen`. Audio streaming to this speaker stops immediately.


## To-Do
This is very early still, and there are a few enhancements I would like to make such as:
 - Optimizing network performance over Wi-Fi (reduce audio dropouts)
 - Enabling multiple groups
 - Installation via `npm` and command line

Please feel free to provide other suggestions, or report bugs on GitHub.

## Troubleshooting
### Installation is failing due to *fatal error: alsa/asoundlib.h: No such file or directory*
`sudo apt-get install libasound2-dev`
