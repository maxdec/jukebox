import {
  PLAYER_PLAY,
  PLAYER_STOP,
  PLAYER_SET_VOLUME,
  PLAYER_RESET
} from '../constants/player';

export default function play(state = {
  streamUrl: '/stream?cache-buster=' + Date.now(),
  playing: false,
  volume: 0.5
}, action) {
  switch (action.type) {
  case PLAYER_PLAY:
    return Object.assign({}, state, { playing: true });
  case PLAYER_STOP:
    return Object.assign({}, state, { playing: false });
  case PLAYER_SET_VOLUME:
    return Object.assign({}, state, { volume: action.payload });
  case PLAYER_RESET:
    return Object.assign({}, state, { streamUrl: action.payload });
  default:
    return state;
  }
}
