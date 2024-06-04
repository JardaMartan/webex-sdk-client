import * as types from "./actionTypes";

export function setSelfView(selfView) {
  return async function (dispatch, getState) {
    console.log(`set selfview: ${JSON.stringify(selfView)}`);
    dispatch({ type: types.SET_SELF_VIEW, selfView });
  };
}

export function updateSelfView(selfView) {
  return async function (dispatch, getState) {
    console.log(`update selfview: ${JSON.stringify(selfView)}`);
    dispatch({ type: types.UPDATE_SELF_VIEW, selfView });
  };
}

export function setSelfViewPosition(position) {
  return async function (dispatch, getState) {
    console.log(`set selfview position: ${JSON.stringify(position)}`);
    dispatch({ type: types.SET_SELFVIEW_POSITION, position });
  };
}
