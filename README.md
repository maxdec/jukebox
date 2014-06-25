jukebox
=======

Spotistic's Jukebox

A music player with a web interface for our Office.  
Runs on a Raspberry Pi plugged to the speakers.  
It allows everyone to add Soundcloud URLs to the tracklist.

The backend is running on top of [Node.js](http://nodejs.org/) and [Redis](http://redis.io/).  
The frontend uses [AngularJS](https://angularjs.org/), [Font Awesome](http://fontawesome.io/), [AngularStrap](http://mgcrea.github.io/angular-strap/) and a custom Bootstrap theme from [Bootswatch](http://bootswatch.com/superhero/).  
Real-time updates with [Socket.io](http://socket.io/).

## Installation
This projects requires `nodejs/npm` and `redis` to be installed.

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

- Collaborative music track list (Soundcloud)
- Voting feature to skip the current track
- Pause and resume streaming
- History of played tracks
- Mobile friendly

## Screenshots

Main view:

![Player](https://github.com/maxdec/jukebox/raw/master/images/playing.png)

History:

![History](https://github.com/maxdec/jukebox/raw/master/images/history.png)

On mobile:

![Mobile](https://github.com/maxdec/jukebox/raw/master/images/mobile.png)


## What's next?

- YouTube URLs
- Volume adjustement
- Better voting system
- Tracks rating? Votes in the tracklist?
- Other platforms?