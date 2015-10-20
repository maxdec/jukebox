import { CURRENT_SET, CURRENT_PROGRESS } from '../constants/current';

export default function current(state = {}, action) {
  switch (action.type) {
  case CURRENT_SET:
    return Object.assign({}, action.payload);
  case CURRENT_PROGRESS:
    return Object.assign({}, state, { progress: action.payload });
  default:
    return state;
  }
}
