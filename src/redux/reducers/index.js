import { combineReducers } from "redux";
import userReducer from "./userReducer";
import webexReducer from "./webexReducer";
import mediaDevicesReducer from "./mediaDevicesReducer";

const rootReducer = combineReducers({
  user: userReducer,
  webex: webexReducer,
  mediaDevices: mediaDevicesReducer,
});

export default rootReducer;
