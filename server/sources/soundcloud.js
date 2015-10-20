import urlParser from 'url';
import https from 'https';
import Throttle from 'throttle';
import Track from '../track';
import unirest from 'unirest';
import config from '../config';
import url from 'url';
const regexRange = new RegExp(/bytes (\d+)-(\d+)\/(\d+)/);

/**
 * Soundcloud Track
 */
export class SoundcloudTrack extends Track {
  constructor(track) {
    if (!track.platform) track = _normalize(track);
    super(track);
  }

  /**
   * Returns an mp3 stream from Soundcloud.
   */
  play() {
    return this._download(this.streamUrl, this.position);
  }

  /**
   * Returns a stream with the mp3 data from Soundcloud.
   * Also performs recurrently to follow redirections.
   * Emits `progress` events.
   */
  _download(streamUrl, position) {
    // do not add the clientId after a redirection
    if (streamUrl.indexOf('Key-Pair-Id') < 0) {
      streamUrl += '?client_id=' + config.soundcloud.clientId;
    }
    const parsedUrl = url.parse(streamUrl);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.path,
      headers: {}
    };

    if (position) {
      options.headers.Range = ['bytes=', position, '-'].join('');
    } else {
      options.headers.Range = 'bytes=0-';
    }

    const output = new Throttle(1.05 * 128*1000/8); // throttle at 128kbps

    https.get(options, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return this._download(res.headers.location, position).pipe(output);
      } else if (res.statusCode >= 400 ) {
        // 404 or whatever, we skip
        output.end();
        return;
      }

      // Content-Range: bytes 20962036-61451700/61451701
      let totalLength, currentLength;
      if (res.headers['content-range']) {
        const splits = regexRange.exec(res.headers['content-range']);
        totalLength = parseInt(splits[3], 10);
        currentLength = parseInt(splits[1], 10);
      } else {
        totalLength = res.headers['content-length'];
        currentLength = 0;
      }

      this.emit('progress', { current: currentLength, total: totalLength });

      res.on('data', chunk => {
        currentLength += chunk.length;
        this.emit('progress', { current: currentLength, total: totalLength });
      }).pipe(output);

    }).end();

    return output;
  }
}


/**
 * Detects if the input match this source.
 */
export function detectOnInput(input) {
  const url = urlParser.parse(input, true, true);
  if (!url.hostname) return false;
  return (url.hostname.indexOf('soundcloud.com') > -1);
}

/**
 * Fetches the full track object from the Soundcloud API.
 * Returns a Promise resolving to a SoundcloudTrack.
 */
export function resolve(trackUrl) {
  const deferred = new Promise();

  unirest.get('https://api.soundcloud.com/resolve.json')
  .query({
    client_id: config.soundcloud.clientId,
    url: trackUrl
  })
  .end(response => {
    if (response.error) return deferred.reject(response.error);
    if (response.body.kind === 'track') {
      const track = response.body;
      // Better image resolution
      track.artwork_url = track.artwork_url.replace('large.jpg', 't300x300.jpg');
      track.bitrate = 128 * 1000;
      deferred.resolve(new SoundcloudTrack(track));
    } else if (response.body.kind === 'playlist') {
      const tracks = response.body.tracks.map(tr => {
        // Better image resolution
        tr.artwork_url = tr.artwork_url.replace('large.jpg', 't300x300.jpg');
        tr.bitrate = 128 * 1000;
        return new SoundcloudTrack(tr);
      });

      deferred.resolve(tracks);
    } else {
      deferred.reject('This is not a track.');
    }
  });

  return deferred.promise;
}

/**
 * Private helpers
 */
function _normalize(track) {
  return {
    title: track.title,
    artist: track.user.username,
    duration: track.duration,
    url: track.permalink_url,
    streamUrl: track.stream_url,
    cover: track.artwork_url,
    createdAt: new Date(),
    platform: 'soundcloud',
  };
}
