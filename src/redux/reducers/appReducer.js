import * as types from "../actions/actionTypes";
import initialState from "./initialState";

const appReducer = (state = initialState.app, action) => {
  console.log(
    `appReducer, state: ${JSON.stringify(state)}\naction: ${JSON.stringify(
      action
    )}`
  );
  switch (action.type) {
    case types.SET_CONTROL_PANEL:
      return {
        ...state,
        controlPanel: { ...state.controlPanel, ...action.controlPanel },
      };
    case types.SET_CONTROL_PANEL_CALLBACK:
      const result = {
        ...state,
        controlPanel: { ...state.controlPanel, callback: action.callback },
      };
      console.log(`appReducer, result: ${JSON.stringify(result)}`);
      return result;
    case types.SET_CONTROL_PANEL_ID:
      return {
        ...state,
        controlPanel: { ...state.controlPanel, id: action.id },
      };
    case types.SET_CONTROL_PANEL_COMPONENT:
      return {
        ...state,
        controlPanel: { ...state.controlPanel, component: action.component },
      };
    case types.SET_CONTROL_PANEL_DATA:
      return {
        ...state,
        controlPanel: { ...state.controlPanel, data: action.data },
      };
    default:
      return state;
  }
};

export default appReducer;
