import { HISTORY_SET } from '../constants/history';

export const set = tracks => ({ type: HISTORY_SET, payload: tracks });
