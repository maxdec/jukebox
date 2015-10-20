import { SETTINGS_SET, SETTINGS_SET_ALL } from '../constants/settings';

export const setAll = (settings) => ({ type: SETTINGS_SET_ALL, payload: settings });
export const set = (setting, value) => ({
  type: SETTINGS_SET, payload: { setting: setting, value: value }
});
