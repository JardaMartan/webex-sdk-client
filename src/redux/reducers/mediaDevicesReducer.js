import * as types from "../actions/actionTypes";
import initialState from "./initialState";

const mediaDevicesReducer = (state = initialState.mediaDevices, action) => {
  switch (action.type) {
    case types.GET_MEDIA_DEVICES_SUCCESS:
      return { ...state, available: action.mediaDevices };
    case types.GET_MEDIA_DEVICES_FAILED:
      return { ...state, error: action.error };
    case types.SET_AUDIO_DEVICE_INPUT:
      return {
        ...state,
        selected: { ...state.selected, audio_input: action.deviceId },
      };
    case types.SET_AUDIO_DEVICE_OUTPUT:
      return {
        ...state,
        selected: { ...state.selected, audio_output: action.deviceId },
      };
    case types.SET_VIDEO_DEVICE_INPUT:
      return {
        ...state,
        selected: { ...state.selected, video_input: action.deviceId },
      };
    case types.SET_VIDEO_DEVICE_QUALITY:
      return {
        ...state,
        selected: { ...state.selected, video_quality: action.quality },
      };
    case types.SET_AUDIO_NOISE_REMOVAL:
      return {
        ...state,
        selected: { ...state.selected, audio_noise_removal: action.enabled },
      };
    case types.SET_VIRTUAL_BACKGROUND_MODE:
      return {
        ...state,
        selected: {
          ...state.selected,
          virtual_background: {
            ...state.selected.virtual_background,
            mode: action.mode,
          },
        },
      };
    case types.SET_VIRTUAL_BACKGROUND_IMAGE:
      return {
        ...state,
        selected: {
          ...state.selected,
          virtual_background: {
            ...state.selected.virtual_background,
            imageUrl: action.imageUrl,
          },
        },
      };
    case types.SET_VIRTUAL_BACKGROUND_VIDEO:
      return {
        ...state,
        selected: {
          ...state.selected,
          virtual_background: {
            ...state.selected.virtual_background,
            videoUrl: action.videoUrl,
          },
        },
      };
    case types.SET_MICROPHONE_STREAM:
      return {
        ...state,
        active: { ...state.active, audio: action.audio },
      };
    case types.SET_CAMERA_STREAM:
      return { ...state, active: { ...state.active, video: action.video } };
    default:
      return state;
  }
};

export default mediaDevicesReducer;
