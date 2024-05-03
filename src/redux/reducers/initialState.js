import * as constants from "../../constants/meeting";

const initialState = {
  user: {
    loggedIn: false,
    email: "",
    formErrors: { email: "" },
    name: "",
    emailValid: false,
    formValid: false,
    formTouched: false,
  },
  webex: {
    accessToken: "",
  },
  log: [
    {
      timeStamp: new Date().toISOString(),
      source: "app",
      level: "info",
      message: "Application started",
    },
  ],
  mediaDevices: {
    selected: {
      audio_input: "",
      audio_output: "",
      video_input: "",
      video_quality: "720p",
      virtual_background: {
        mode: "NONE",
        imageUrl: constants.DEFAULT_VBG_IMAGE,
        videoUrl: constants.DEFAULT_VBG_VIDEO,
      },
      audio_noise_removal: false,
    },
    available: {
      audio_input: [],
      audio_output: [],
      video_input: [],
    },
    active: {
      audio: null,
      video: null,
    },
  },
};

export default initialState;
