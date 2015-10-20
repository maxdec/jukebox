import { combineReducers } from 'redux';
import current from './current';
import history from './history';
import player from './player';
import settings from './settings';
import tracklist from './tracklist';
import votes from './votes';

const rootReducer = combineReducers({
  current,
  history,
  player,
  settings,
  tracklist,
  votes,
});

export default rootReducer;
