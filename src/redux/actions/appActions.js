import * as types from "./actionTypes";

export function setControlPanel(controlPanel) {
  return { type: types.SET_CONTROL_PANEL, controlPanel };
}

export function setControlPanelCallback(callback) {
  return { type: types.SET_CONTROL_PANEL_CALLBACK, callback };
}

export function setControlPanelId(id) {
  return { type: types.SET_CONTROL_PANEL_ID, id };
}

export function setControlPanelComponent(component) {
  return { type: types.SET_CONTROL_PANEL_COMPONENT, component };
}

export function setControlPanelData(data) {
  return { type: types.SET_CONTROL_PANEL_DATA, data };
}
