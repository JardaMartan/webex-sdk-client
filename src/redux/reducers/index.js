import { combineReducers } from "redux";
import userReducer from "./userReducer";
import webexReducer from "./webexReducer";

const rootReducer = combineReducers({
  user: userReducer,
  webex: webexReducer,
});

export default rootReducer;
