import * as types from "./actionTypes";

export function setSelfView(selfView) {
  return { type: types.SET_SELF_VIEW, selfView };
}

export function setSelfViewPosition(position) {
  return { type: types.SET_SELFVIEW_POSITION, position };
}
