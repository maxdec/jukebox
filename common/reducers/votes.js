import { VOTES_SET } from '../constants/votes';

export default function votes(state = { favorable: 0, total: 0 }, action) {
  switch (action.type) {
  case VOTES_SET:
    return action.payload;
  default:
    return state;
  }
}
