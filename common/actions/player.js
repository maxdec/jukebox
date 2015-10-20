import { PLAYER_PLAY, PLAYER_STOP, PLAYER_SET_VOLUME, PLAYER_RESET } from '../constants/player';
import player from '../../client/player';

export const play = () => dispatch => {
  player.play();
  dispatch({ type: PLAYER_PLAY });
};
export const stop = () => dispatch => {
  player.stop();
  dispatch({ type: PLAYER_STOP });
};
export const volume = perc => dispatch => {
  player.setVolume(perc);
  dispatch({ type: PLAYER_SET_VOLUME, payload: perc });
};
export const reset = streamUrl => dispatch => {
  player.reset(streamUrl);
  dispatch(({ type: PLAYER_RESET, payload: streamUrl }));
};
