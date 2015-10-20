import { TRACKLIST_SET, TRACKLIST_ADD, TRACKLIST_REMOVE } from '../constants/tracklist';

export default function tracklist(state = [], action) {
  switch (action.type) {
  case TRACKLIST_SET:
    return action.payload;
  case TRACKLIST_ADD:
    return [].concat(state, [action.payload]);
  case TRACKLIST_REMOVE:
    return state.filter((_, i) => i !== action.payload); // splice mutates the list
  default:
    return state;
  }
}
