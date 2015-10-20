import {EventEmitter} from 'events';
import {client as redis} from '../redis';
import trackBuilder from '../track_builder';
const key = 'jukebox:history';

class HistoryService extends EventEmitter {
  constructor(...args) {
    super(...args);
  }

  find(query, callback) {
    const start = query.start || 0;
    const stop = query.stop || -1;
    redis.lrange(key, start, stop, (err, tracks) => {
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
}

export default new HistoryService();
