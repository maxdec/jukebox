import { HISTORY_SET } from '../constants/history';

export default function history(state = [], action) {
  switch (action.type) {
  case HISTORY_SET:
    return action.payload.sort((a, b) => {
      (new Date(b.playedAt) - new Date(a.playedAt));
    });
  default:
    return state;
  }
}
