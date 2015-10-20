import {EventEmitter} from 'events';
import {client as redis} from '../redis';
import trackBuilder from '../track_builder';
const key = 'jukebox:tracklist';

class TracklistService extends EventEmitter {
  constructor(...args) {
    super(...args);
  }

  find(query, callback) {
    const start = query.start || 0;
    const stop = query.stop || -1;
    redis.lrange(key, start, stop, function (err, tracks) {
      if (err) return callback(err);
      tracks = tracks.map(trackBuilder.fromJSONSync);
      callback(null, tracks);
    });
  }

  create(track, callback = () => {}) {
    redis.rpush(key, JSON.stringify(track), err => {
      if (err) return callback(err);
      this.emit('created', track);
      callback();
    });
  }

  /**
   * Blocking!
   * Removes and returns the first track in the tracklist,
   * or waits for a new one to be added.
   */
  waitForNext(callback) {
    redis.blpop(key, 0, (err, results) => {
      if (err) return callback(err);
      // Returns an array [key, value]
      const track = trackBuilder.fromJSONSync(results[1]);
      this.emit('removed', track);
      callback(null, track);
    });
  }
}

export default new TracklistService();
