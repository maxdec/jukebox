import socket from './socket';
import {sub} from './redis';
import current from './services/current';
import tracklist from './services/tracklist';
import history from './services/history';
import listeners from './services/listeners';
import votes from './services/votes';
import throttle from './throttle';

sub.subscribe([
  'current:set',
  'current:removed',
  'current:position',
  'tracklist:created',
  'tracklist:removed',
  'history:created',
  'listeners:created',
  'listeners:removed',
  'votes:created',
  'votes:removed',
], () => {
  sub.on('message', (channel, data) => {
    socket().emit(channel, JSON.parse(data));
  });
});

current.on('set', track => socket().emit('current:set', track));
current.on('removed', () => socket().emit('current:removed'));
current.on('position', throttle(perc => socket().emit('current:position', perc), 1000));
tracklist.on('created', track => socket().emit('tracklist:created', track));
tracklist.on('removed', track => socket().emit('tracklist:removed', track));
history.on('created', track => socket().emit('history:created', track));
listeners.on('created', count => socket().emit('listeners:created', count));
listeners.on('removed', count => socket().emit('listeners:removed', count));
votes.on('created', count => socket().emit('votes:created', count));
votes.on('removed', count => socket().emit('votes:removed', count));
