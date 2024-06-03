import { combineReducers } from "redux";
import userReducer from "./userReducer";
import webexReducer from "./webexReducer";
import mediaDevicesReducer from "./mediaDevicesReducer";
import settingsReducer from "./settingsReducer";
import viewReducer from "./viewReducer";

const rootReducer = combineReducers({
  user: userReducer,
  webex: webexReducer,
  mediaDevices: mediaDevicesReducer,
  settings: settingsReducer,
  view: viewReducer,
});

export default rootReducer;
