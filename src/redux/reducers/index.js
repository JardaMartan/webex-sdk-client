import { combineReducers } from "redux";
import userReducer from "./userReducer";
import webexReducer from "./webexReducer";
import mediaDevicesReducer from "./mediaDevicesReducer";
import settingsReducer from "./settingsReducer";

const rootReducer = combineReducers({
  user: userReducer,
  webex: webexReducer,
  mediaDevices: mediaDevicesReducer,
  settings: settingsReducer,
});

export default rootReducer;
