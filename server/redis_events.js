import {client as redis} from './redis';

import current from './services/current';
import tracklist from './services/tracklist';
import history from './services/history';
import listeners from './services/listeners';
import votes from './services/votes';

current.on('set', track => redis.publish('current:set', JSON.stringify(track)));
current.on('removed', () => redis.publish('current:removed', true));
current.on('position', perc => redis.publish('current:position', perc));
tracklist.on('created', track => redis.publish('tracklist:created', JSON.stringify(track)));
tracklist.on('removed', track => redis.publish('tracklist:removed', JSON.stringify(track)));
history.on('created', track => redis.publish('history:created', JSON.stringify(track)));
listeners.on('created', count => redis.publish('listeners:created', count));
listeners.on('removed', count => redis.publish('listeners:removed', count));
votes.on('created', count => redis.publish('votes:created', count));
votes.on('removed', count => redis.publish('votes:removed', count));
