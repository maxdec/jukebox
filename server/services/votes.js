import {EventEmitter} from 'events';
import {client as redis} from '../redis';
const key = 'jukebox:votes';

class VotesService extends EventEmitter {
  constructor(...args) {
    super(...args);
  }

  count(callback) {
    redis.scard(key, (err, count) => {
      if (err) return callback(err);
      callback(null, count);
    });
  }

  create(uid, callback = () => {}) {
    redis.sadd(key, uid, (err, newCount) => {
      if (err) return callback(err);
      this.emit('created', newCount);
      callback();
    });
  }

  remove(uid, callback = () => {}) {
    redis.srem(key, uid, (err, removedCount) => {
      if (err) return callback(err);
      this.emit('removed', removedCount);
      callback();
    });
  }

  clear(callback = () => {}) {
    redis.del(key, err => {
      if (err) return callback(err);
      this.emit('cleared');
      callback();
    });
  }
}

export default new VotesService();
