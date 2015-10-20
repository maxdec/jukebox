import {EventEmitter} from 'events';
import {client as redis} from '../redis';
import trackBuilder from '../track_builder';
const key = 'jukebox:current';

class CurrentService extends EventEmitter {
  constructor(...args) {
    super(...args);
  }

  get(callback) {
    redis.get(key, (err, current) => {
      if (err) return callback(err);
      if (!current) return callback();
      callback(null, trackBuilder.fromJSONSync(current));
    });
  }

  set(track, callback = () => {}) {
    redis.set(key, JSON.stringify(track), err => {
      if (err) return callback(err);
      this.emit('set', track);
      callback();
    });
  }

  remove(callback = () => {}) {
    redis.del(key, err => {
      if (err) return callback(err);
      this.emit('removed');
      callback();
    });
  }

  updateCurrentPosition(pos, total, callback = () => {}) {
    this.get((err, current) => {
      if (err) return callback(err);
      if (!current) return callback();
      current.position = pos;
      current.total = total;
      redis.set(key, JSON.stringify(current), err => {
        if (err) return callback(err);
        this.emit('position', Math.round(pos / total * 100));
        callback();
      });
    });
  }
}

export default new CurrentService();
