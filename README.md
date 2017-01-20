shaircast
====================
*So your iPhone can play music all around your house*

AirPlay is cool if you want to stream music from your phone to one room in your house. But who has a house with one room? iTunes will let you stream to multiple speakers, but who wants to only listen to what they have in iTunes on their computer?

This is a *major* first world problem. shaircast solves this problem. shaircast is a super simple Node.js application that combines [nodetunes](https://github.com/stephen/nodetunes) and [node-airtunes](https://github.com/lperrin/node_airtunes) to take a single AirPlay stream (from your iPhone or iPad) and broadcast it to multiple AirPlay speakers. Oh, and it keeps everything in sync too! Like magic!

I use a couple of Raspberry Pis plugged into speakers, running [shairport-sync](https://github.com/mikebrady/shairport-sync). shaircast also runs great on a Raspberry Pi 2, side by side with shairport-sync, so you don't even have to have a huge server to run it!

##How do I get it?
You will need Node.js. And a computer. Hopefully you have one of those.

> Note: Currently the LTS version of Node.js is supported (6.9.x). Installing shaircast successfully on a linux based system is likely to require **libasound2-dev** and **libavahi-compat-libdnssd-dev**. On a Raspberry Pi you can install those packages via *sudo apt-get install libavahi-compat-libdnssd-dev libasound2-dev*.

First, get the code from GitHub:

	$ git clone https://github.com/nguyer/shaircast

Then install the dependencies:

	$ cd shaircast
	$ npm install

### Configuration

There is a file called `config.json` in the application directory. You should modify it to list the IP addresses of the AirPlay speakers you wish to broadcast to. You can also set the name of the group in the config file.

The config file looks like this:

```json
{
	"groupName": "All Speakers",
	"endpoints": [
		"192.168.1.116",
		"192.168.1.117"
	]
}
```

### Starting the server
Just run:

	$ npm start

### Connect and play!
If your server and iOS device are on the same network, you should see a new AirPlay target called "All Speakers", or whatever you named your group in the `config.json`. Select that AirPlay target and start playing!

##To-Do
This is very early still, and there are a few enhancements I would like to make such as:
 - Optimizing network performance over Wi-Fi (reduce audio dropouts)
 - Enabling multiple groups
 - Installation via `npm` and command line

Please feel free to provide other suggestions, or report bugs on GitHub.
