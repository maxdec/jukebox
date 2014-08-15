jukebox
=======

[Spotistic](https://spotistic.com)'s Jukebox

A music player with a web interface for our Office.
Runs on a Raspberry Pi plugged to the speakers.
It allows everyone to add Soundcloud or YouTube URLs to the tracklist.

The backend is running on top of [Node.js](http://nodejs.org/) and [Redis](http://redis.io/).
The frontend uses [AngularJS](https://angularjs.org/), [Font Awesome](http://fontawesome.io/), [AngularStrap](http://mgcrea.github.io/angular-strap/) and a custom Bootstrap theme from [Bootswatch](http://bootswatch.com/superhero/).
Real-time updates with [Socket.io](http://socket.io/).

## Installation
This projects requires `nodejs/npm` and `redis` to be installed.

You also need to have the `alsa.h` header, `ffmpeg` + codecs and `alsamixer`. On Debian/Ubuntu:

```
sudo apt-get install libasound2-dev ffmpeg libavcodec-extra-53 alsa alsa-tools
```

/!\ In the recent versions of Ubuntu, `ffmpeg` has been replaced by a forked (`avconv`).
`apt-get` can tell you to install `libav-tools` but that's not a good idea.
`avconv` contains a few breaking changed (in the syntax for instance).
You should use the official PPA repository which provides `ffmpeg` instead:

```
sudo add-apt-repository ppa:jon-severinsson/ffmpeg
sudo apt-get update
sudo apt-get install ffmpeg
```

Also make sure your user belongs to the `audio` group:

```
sudo adduser $(whoami) audio
```

Clone and install the dependencies:

```
git clone https://github.com/maxdec/jukebox
cd jukebox
npm install
```

## Utilisation
Launch the app:

```
node server.js
```
Then open your browser at `http://localhost:3000`.

## Features

- Collaborative music track list (Soundcloud/YouTube)
- Voting feature to skip the current track
- Pause and resume streaming
- History of played tracks
- Mobile friendly

## Screenshots

Main view:

![Player](https://github.com/maxdec/jukebox/raw/master/screenshots/playing.png)

History:

![History](https://github.com/maxdec/jukebox/raw/master/screenshots/history.png)

On mobile:

![Mobile](https://github.com/maxdec/jukebox/raw/master/screenshots/mobile.png)

## Known issues

Currently resuming the playback is not possible on YouTube (cf. [this issue](https://github.com/fent/node-ytdl/issues/32)).
Ideas are welcome.

## What's next?

- Volume adjustement
- Better voting system
- Tracks rating? Votes in the tracklist?
- Other platforms?
- Text-to-Speech useful info from time to time (weather?)
