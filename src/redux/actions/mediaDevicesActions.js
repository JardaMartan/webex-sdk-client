import * as types from "./actionTypes";

async function stopMicStream(dispatch, getState) {
  try {
    const stream = getState().mediaDevices.active.audio;
    if (stream) {
      dispatch({ type: types.SET_MICROPHONE_STREAM, audio: null }); // needs to be run before stopping the stream, otherwise React complains about state modification
      stream.getTracks().forEach((track) => {
        if (track.readyState === "live" && track.kind === "audio") {
          console.log("Stopping microphone stream - ", track.label);
          track.stop();
        }
      });
      console.log("Microphone stream stopped");
      dispatch({ type: types.SET_MICROPHONE_STREAM, audio: null });
    }
  } catch (error) {
    console.log(`Error stopping microphone stream: ${error}`);
  }
}

export function startMicrophoneStream(deviceId = null) {
  //eslint-disable-next-line no-unused-vars
  return async function (dispatch, getState) {
    stopMicStream(dispatch, getState).then(() => {
      const constraints = {
        audio: { deviceId: deviceId ? { exact: deviceId } : undefined },
      };
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          console.log("Starting microphone stream - ", stream);
          dispatch({ type: types.SET_MICROPHONE_STREAM, audio: stream });
        })
        .catch((err) => {
          if (err.name === "OverconstrainedError") {
            console.log("Retrying without deviceId");
            dispatch({ type: types.SET_AUDIO_DEVICE_INPUT, deviceId: "" });
            navigator.mediaDevices
              .getUserMedia({
                audio: true,
              })
              .then((stream) => {
                console.log("Starting microphone stream - ", stream);
                dispatch({ type: types.SET_MICROPHONE_STREAM, audio: stream });
              })
              .catch((err) => {
                console.log("Error starting microphone stream - ", err);
                dispatch({ type: types.SET_MICROPHONE_STREAM, audio: null });
              });
          } else {
            console.log("Error starting microphone stream - ", err);
            dispatch({ type: types.SET_MICROPHONE_STREAM, audio: null });
          }
        });
    });
  };
}

export function stopMicrophoneStream() {
  return stopMicStream;
}

async function stopCamStream(dispatch, getState) {
  try {
    const stream = getState().mediaDevices.active.video;
    if (stream) {
      setAudioDeviceInput(null);
      stream.getTracks().forEach((track) => {
        if (track.readyState === "live" && track.kind === "video") {
          console.log("Stopping camera stream - ", track.label);
          track.stop();
        }
      });
      console.log("Camera stream stopped");
      dispatch({ type: types.SET_CAMERA_STREAM, video: null });
    }
  } catch (error) {
    console.log(`Error stopping camera stream: ${error}`);
  }
}

export function startCameraStream(deviceId = null) {
  //eslint-disable-next-line no-unused-vars
  return async function (dispatch, getState) {
    stopCamStream(dispatch, getState).then(() => {
      const constraints = {
        video: {
          width: 1280,
          height: 720,
          deviceId: deviceId ? { exact: deviceId } : undefined,
        },
      };
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          console.log("Starting camera stream - ", stream);
          dispatch({ type: types.SET_CAMERA_STREAM, video: stream });
        })
        .catch((err) => {
          if (err.name === "OverconstrainedError") {
            console.log("Retrying without deviceId");
            dispatch({ type: types.SET_VIDEO_DEVICE_INPUT, deviceId: "" });
            navigator.mediaDevices
              .getUserMedia({
                video: true,
              })
              .then((stream) => {
                console.log("Starting camera stream - ", stream);
                dispatch({ type: types.SET_CAMERA_STREAM, video: stream });
              })
              .catch((err) => {
                console.log("Error starting camera stream - ", err);
                dispatch({ type: types.SET_CAMERA_STREAM, video: null });
              });
          } else {
            console.log("Error starting camera stream - ", err);
            dispatch({ type: types.SET_CAMERA_STREAM, video: null });
          }
        });
    });
  };
}

export function stopCameraStream() {
  return stopCamStream;
}

export function getMediaDevicesSuccess(mediaDevices) {
  return { type: types.GET_MEDIA_DEVICES_SUCCESS, mediaDevices };
}

export function getMediaDevicesFailed(error) {
  return { type: types.GET_MEDIA_DEVICES_FAILED, error };
}

export function setAudioDeviceInput(deviceId) {
  return { type: types.SET_AUDIO_DEVICE_INPUT, deviceId: deviceId };
}

export function setAudioDeviceOutput(deviceId) {
  return { type: types.SET_AUDIO_DEVICE_OUTPUT, deviceId: deviceId };
}

export function setVideoDeviceInput(deviceId) {
  return { type: types.SET_VIDEO_DEVICE_INPUT, deviceId: deviceId };
}

export function setVideoDeviceQuality(quality) {
  return { type: types.SET_VIDEO_DEVICE_QUALITY, quality };
}

export function setAudioNoiseRemoval(enabled) {
  return { type: types.SET_AUDIO_NOISE_REMOVAL, enabled };
}

export function setVirtualBackgroundMode(mode) {
  return { type: types.SET_VIRTUAL_BACKGROUND_MODE, mode };
}

export function setVirtualBackgroundImage(imageUrl) {
  return { type: types.SET_VIRTUAL_BACKGROUND_IMAGE, imageUrl };
}

export function setVirtualBackgroundVideo(videoUrl) {
  return { type: types.SET_VIRTUAL_BACKGROUND_VIDEO, videoUrl };
}

export function getMediaDevices() {
  //eslint-disable-next-line no-unused-vars
  return async function (dispatch, getState) {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log("All detected devices - ", devices);
      const audioDevicesIn = devices.filter(
        (device) => device.kind === "audioinput"
      );
      const audioDevicesOut = devices.filter(
        (device) => device.kind === "audiooutput"
      );
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      console.log(
        `Detected devices - audioDevicesIn: ${JSON.stringify(
          audioDevicesIn
        )},\naudioDevicesOut: ${JSON.stringify(
          audioDevicesOut
        )}\nvideoDevices: ${JSON.stringify(videoDevices)}`
      );
      dispatch(
        getMediaDevicesSuccess({
          audio_input: audioDevicesIn,
          audio_output: audioDevicesOut,
          video_input: videoDevices,
        })
      );
    } catch (error) {
      dispatch(getMediaDevicesFailed(error));
    }
  };
}

export function clearMediaDevices() {
  return async function (dispatch, getState) {
    dispatch({
      type: types.GET_MEDIA_DEVICES_SUCCESS,
      mediaDevices: { audio_input: [], audio_output: [], video_input: [] },
    });
  };
}
