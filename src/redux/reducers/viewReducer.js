import * as types from "../actions/actionTypes";
import initialState from "./initialState";

export default function viewReducer(state = initialState.view, action) {
  // console.log(
  //   `viewReducer\naction: ${JSON.stringify(action)}\nstate: ${JSON.stringify(
  //     state
  //   )}`
  // );

  switch (action.type) {
    case types.SET_SELF_VIEW:
      return { ...state, selfView: action.selfView };
    case types.UPDATE_SELF_VIEW:
      return { ...state, selfView: { ...state.selfView, ...action.selfView } };
    case types.SET_SELFVIEW_POSITION:
      return {
        ...state,
        selfView: { ...state.selfView, position: action.position },
      };
    case types.SET_SELFVIEW_VISIBLE:
      return {
        ...state,
        selfView: { ...state.selfView, visible: action.visible },
      };
    default:
      return state;
  }
}
