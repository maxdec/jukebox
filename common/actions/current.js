import { CURRENT_SET, CURRENT_PROGRESS } from '../constants/current';

export const set = track =>({ type: CURRENT_SET, payload: track });
export const progress = perc => ({ type: CURRENT_PROGRESS, payload: perc });
