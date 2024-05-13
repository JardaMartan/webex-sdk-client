import * as types from "../actions/actionTypes";
import initialState from "./initialState";

const settingsReducer = (state = initialState.settings, action) => {
  switch (action.type) {
    case types.SET_SETTINGS:
      return { ...state, ...action.settings };
    default:
      return state;
  }
};

export default settingsReducer;
