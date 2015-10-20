import urlParser from 'url';
import Throttle from 'throttle';
import Track from '../track';
import fs from 'fs';
import url from 'url';
import mm from 'musicmetadata';
import ffprobe from 'node-ffprobe';

/**
 * File Track
 */
export class FileTrack extends Track {
  constructor(track) {
    if (!track.platform) track = _normalize(track);
    super(track);
  }

  /**
   * Returns a stream with the mp3 data from the filesystem.
   * Emits `progress` events.
   */
  play() {
    const parsedUrl = url.parse(this.streamUrl);
    const options = {};
    if (this.position) options.start = this.position;

    const output = new Throttle(320*1000/8); // throttle at 128kbps

    fs.createReadStream(parsedUrl.path, options)
      .pipe(output);

    let currentLength = this.position || 0;
    const totalLength = this.size;

    output.on('data', chunk => {
      currentLength += chunk.length;
      this.emit('progress', { current: currentLength, total: totalLength });
    });

    this.emit('progress', { current: currentLength, total: totalLength });

    return output;
  }
}


/**
 * Detects if the input match this source.
 */
export function detectOnInput(input) {
  const url = urlParser.parse(input, true, true);
  return (url.protocol && url.protocol.indexOf('file') > -1);
}

/**
 * Fetches the full track object from the Filesystem.
 * Returns a Promise resolving to a FileTrack.
 * TODO: read ID3 tags
 */
export function resolve(trackUrl) {
  const deferred = new Promise();
  const url = urlParser.parse(trackUrl, true, true);

  ffprobe(url.path, function (err, results) {
    if (err) return deferred.reject(err);
    const track = {
      title: results.filename,
      size: results.format.size,
      duration: results.format.duration * 1000,
      path: url.path,
      bitrate: results.format.bit_rate
    };

    const stream = fs.createReadStream(url.path);
    const parser = mm(stream);

    parser.on('metadata', metadata => {
      track.title = metadata.title;
      track.artist = metadata.artist.join(' ');
      const pic = metadata.picture[0];
      if (pic) {
        const picPath = 'public/img/covers/' + results.filename.replace(results.fileext, '.' + pic.format);
        track.cover = picPath.replace('public', '');
        const file = fs.createWriteStream(picPath);
        file.end(pic.data);
      }
    });

    parser.on('done', err => {
      if (err) return deferred.reject(err);
      stream.destroy();
      deferred.resolve(new FileTrack(track));
    });
  });

  return deferred.promise;
}

/**
 * Private helpers
 */
function _normalize(track) {
  return {
    title: track.title,
    artist: track.artist,
    duration: track.duration,
    streamUrl: track.path,
    cover: track.cover,
    createdAt: new Date(),
    platform: 'file',
    bitrate: track.bitrate,
    size: track.size,
  };
}
