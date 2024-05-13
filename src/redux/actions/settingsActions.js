import * as types from "./actionTypes";

export function setSettings(settings) {
  return { type: types.SET_SETTINGS, settings };
}
