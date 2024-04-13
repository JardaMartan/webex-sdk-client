import { combineReducers } from "redux";
import userReducer from "./userReducer";
import webexReducer from "./webexReducer";
import appReducer from "./appReducer";

const rootReducer = combineReducers({
  user: userReducer,
  webex: webexReducer,
  app: appReducer,
});

export default rootReducer;
