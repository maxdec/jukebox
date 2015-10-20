import { TRACKLIST_SET, TRACKLIST_ADD, TRACKLIST_REMOVE } from '../constants/tracklist';

export const set = tracks => ({ type: TRACKLIST_SET, payload: tracks });
export const add = track => ({ type: TRACKLIST_ADD, payload: track });
export const remove = index => ({ type: TRACKLIST_REMOVE, payload: index });
export const addUrl = trackUrl => dispatch => {
  // api.tracks.post({ url: trackUrl }, function (err) {
  //   if (err) return console.error(err);
  // });
  dispatch({ type: TRACKLIST_ADD, payload: { url: trackUrl }});
};
