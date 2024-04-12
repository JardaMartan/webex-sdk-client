import * as types from "../actions/actionTypes";
import initialState from "./initialState";

const loginReducer = (state = initialState.user, action) => {
  switch (action.type) {
    case types.LOGIN_USER:
      return { ...state, ...action.user };
    case types.LOGOUT_USER:
      return { ...state, ...action.user };
    default:
      return state;
  }
};

export default loginReducer;
