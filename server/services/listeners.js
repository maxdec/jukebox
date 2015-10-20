import {EventEmitter} from 'events';
import {client as redis} from '../redis';
import logger from '../logger';
const key = 'jukebox:listeners';
const listenersRes = [];

class ListenersService extends EventEmitter {
  constructor(...args) {
    super(...args);
  }

  getAllSync() {
    return listenersRes;
  }

  count(callback) {
    redis.scard(key, (err, count) => {
      if (err) return callback(err);
      callback(null, count);
    });
  }

  add(uid, res, callback = () => {}) {
    logger.log('Adding listener');
    listenersRes.push(res);
    redis.sadd(key, uid, (err, newCount) => {
      if (err) return callback(err);
      this.emit('created', newCount);
      callback();
    });
  }

  remove(uid, res, callback = () => {}) {
    logger.log('Removed listener. ' + listenersRes.length + ' are left.');
    var idx = listenersRes.indexOf(res);
    listenersRes.splice(idx, 1);
    redis.srem(key, uid, (err, removedCount) => {
      if (err) return callback(err);
      this.emit('removed', removedCount);
      callback();
    });
  }
}

export default new ListenersService();
