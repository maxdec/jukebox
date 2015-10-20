import urlParser from 'url';
import Track from '../track';
import unirest from 'unirest';
import ytdl from 'ytdl-core';
import Transcoder from 'stream-transcoder';
import {format} from '../config';
import Throttle from 'throttle';

/**
 * Youtube Track
 */
export class YoutubeTrack extends Track {
  constructor(track) {
    if (!track.platform) track = _normalize(track);
    super(track);
  }

  /**
   * Plays the sound of a Youtube video.
   * It streams the content, removes the video
   * and encode the sound into mp3.
   * Emits `progress` events.
   *
   * /!\ Resuming a video is (currently?) not possible.
   * When using the `range` option Youtube just returns a chunk a data
   * which is not recognized as a valid video.
   * cf. https://github.com/fent/node-ytdl/issues/32
   */
  play() {
    let totalLength;
    let currentLength = 0;

    const ytOpts = {
      quality: 'highest',
      // filter: format => { return format.container === 'mp4'; }
    };
    if (this.position) ytOpts.range = this.position + '-';

    const ytStream = ytdl(this.streamUrl, ytOpts);
    ytStream
      .on('info', (_, format) => {
        totalLength = parseInt(format.size, 10);
      })
      .on('data', chunk => {
        currentLength += chunk.length;
        this.emit('progress', { current: currentLength, total: totalLength });
      })
      .on('error', () => {
        ytStream.push(null);
      })
      .on('end', () => {
        this.end();
      });

    return new Transcoder(ytStream)
      .custom('vn') // no video
      .audioCodec('libmp3lame')
      .sampleRate(format.sampleRate)
      .channels(format.channels)
      .audioBitrate(format.bitRate)
      .format('mp3')
      .stream()
      .pipe(new Throttle(format.bitRate / 8)); // throttle at 128kbps
  }
}


/**
 * Detects if the input match this source.
 */
export function detectOnInput(input) {
  const url = urlParser.parse(input, true, true);
  if (!url.hostname) return false;
  return (url.hostname.indexOf('youtube.com') > -1);
}

/**
 * Fetches the full track object from the Youtube API.
 * Returns a Promise resolving to a YoutubeTrack.
 */
export function resolve(trackUrl) {
  const deferred = new Promise();
  const url = urlParser.parse(trackUrl, true, true);

  unirest.get('http://gdata.youtube.com/feeds/api/videos/' + url.query.v)
  .query({
    v: 2,
    alt: 'json'
  })
  .end(response => {
    if (response.error) return deferred.reject(response.error);
    const track = response.body.entry;
    track.bitrate = 128 * 1000;
    deferred.resolve(new YoutubeTrack(track));
  });

  return deferred.promise;
}

/**
 * Private helpers
 */
function _normalize(track) {
  const normalizedTrack = {
    title: track.title.$t,
    duration: track.media$group.yt$duration.seconds * 1000,
    url: track.link[0].href,
    streamUrl: track.link[0].href,
    cover: track.media$group.media$thumbnail[1].url,
    createdAt: new Date(),
    platform: 'youtube',
  };

  if (track.author && track.author[0]) {
    normalizedTrack.artist = track.author[0].name.$t;
  }

  return normalizedTrack;
}
