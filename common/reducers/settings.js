import { SETTINGS_SET, SETTINGS_SET_ALL } from '../constants/settings';

export default function settings(state = {}, action) {
  switch (action.type) {
  case SETTINGS_SET:
    return Object.assign({}, state, { [action.type]: action.payload });
  case SETTINGS_SET_ALL:
    return Object.assign({}, action.payload);
  default:
    return state;
  }
}
