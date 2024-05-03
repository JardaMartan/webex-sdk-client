import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  Select,
  Stack,
  InputLabel,
  FormControl,
  FormControlLabel,
  Switch,
  Box,
} from "@mui/material";
// import { useMeetingAction } from "../meetingcontext/MeetingContext";
import {
  setAudioDeviceInput,
  setAudioDeviceOutput,
} from "../../redux/actions/mediaDevicesActions";
import { useMeeting, useMeetingAction } from "../meetingcontext/MeetingContext";
import { MEETING_STATUSES } from "../../constants/meeting";

const AudioSettings = ({
  visible,
  mediaDevices,
  setAudioDeviceInput,
  setAudioDeviceOutput,
}) => {
  const contextState = useMeeting();
  const { startMicrophoneStream, stopMicrophoneStream, setNoiseRemoval } =
    useMeetingAction();
  const [noiseRemovalChanging, setNoiseRemovalChanging] = useState(false);
  const remoteAudioRef = useRef("remoteAudio");
  const selectWidth = "300px";
  const selectHeight = "300px";

  /*  useEffect(() => {
    console.log("Selected audio source: ", mediaDevices.selected.audio_input);
    if (mediaDevices.selected.audio_input) {
      contextState.localMedia.available.audio_input.forEach((device) => {
        if (device.deviceId === mediaDevices.selected.audio_input) {
          console.log("Selected audio source: ", device.label);
        }
      });
    }
  }, [
    mediaDevices.selected.audio_input,
    contextState.localMedia.available.audio_input,
  ]);*/

  useEffect(() => {
    setNoiseRemovalChanging(false);
  }, [mediaDevices.selected.audio_noise_removal]);

  useEffect(() => {
    if (!visible) {
      if (
        ![
          MEETING_STATUSES.ACTIVE,
          MEETING_STATUSES.IN_LOBBY,
          MEETING_STATUSES.IN_MEETING,
        ].includes(contextState.meetingStatus)
      ) {
        stopMicrophoneStream();
      }
    } else {
      if (
        ![
          MEETING_STATUSES.ACTIVE,
          MEETING_STATUSES.IN_LOBBY,
          MEETING_STATUSES.IN_MEETING,
        ].includes(contextState.meetingStatus)
      ) {
        startMicrophoneStream(mediaDevices.selected.audio_input);
      }
    }
  }, [visible]); //eslint-disable-line react-hooks/exhaustive-deps

  // useEffect(() => {
  //   try {
  //     if (contextState.remoteMedia.audio) {
  //       if (remoteAudioRef.current.srcObject == null) {
  //         console.log("Setting remote audio");
  //         remoteAudioRef.current.srcObject =
  //           contextState.remoteMedia.audio.stream;
  //       }
  //     } else if (remoteAudioRef.current.srcObject != null) {
  //       console.log("Unsetting remote audio");
  //       remoteAudioRef.current.srcObject = null;
  //     }
  //   } catch (error) {
  //     console.log(`Error setting remote audio: ${error}`);
  //   }
  // }, [contextState.remoteMedia.audio]);

  useEffect(() => {
    if (visible && mediaDevices.selected?.audio_output) {
      console.log(
        "Selected audio output: ",
        mediaDevices.selected.audio_output
      );
      remoteAudioRef.current.setSinkId(mediaDevices.selected.audio_output);
    }
  }, [mediaDevices.selected]); //eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) {
    return null;
  }

  return (
    <div>
      <Stack
        direction="row"
        spacing={2}
        // justifyContent="space-between"
        alignItems="top"
      >
        <Stack
          direction="column"
          spacing={2}
          justifyContent="top"
          alignItems="left"
        >
          <InputLabel htmlFor="mic-select">Mikrofon</InputLabel>
          <FormControl
            sx={{ m: 1, minWidth: selectWidth, maxHeight: selectHeight }}
          >
            <Select
              native
              sx={{ width: selectWidth, maxHeight: selectHeight }}
              value={mediaDevices.selected.audio_input}
              onChange={(event) => {
                console.log("Audio input changed", event.target.value);
                setAudioDeviceInput(event.target.value);
                startMicrophoneStream(event.target.value);
              }}
            >
              {contextState.localMedia.available.audio_input.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </option>
              ))}
            </Select>
            <FormControlLabel
              control={
                <Switch
                  checked={mediaDevices.selected.audio_noise_removal}
                  disabled={noiseRemovalChanging}
                  onChange={() => {
                    setNoiseRemovalChanging(true);
                    setNoiseRemoval(
                      !mediaDevices.selected.audio_noise_removal
                    ).then(() => {
                      setNoiseRemovalChanging(false);
                    });
                  }}
                />
              }
              label="Odstranění rušivých zvuků"
            />
          </FormControl>
        </Stack>
        <Stack
          direction="column"
          spacing={2}
          justifyContent="top"
          alignItems="left"
        >
          <InputLabel htmlFor="out-select">Reproduktor</InputLabel>
          <FormControl
            sx={{ m: 1, minWidth: selectWidth, maxHeight: selectHeight }}
          >
            <Select
              native
              value={mediaDevices.selected.audio_output}
              inputProps={{
                id: "out-select",
              }}
              onChange={(event) => {
                console.log("Audio output changed", event.target.value);
                setAudioDeviceOutput(event.target.value);
              }}
            >
              {contextState.localMedia.available.audio_output.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </option>
              ))}
            </Select>
          </FormControl>
          <Box hidden={true}>
            Remote Audio
            <audio id="audio-output" controls autoPlay ref={remoteAudioRef} />
          </Box>
        </Stack>
      </Stack>
    </div>
  );
};

AudioSettings.propTypes = {
  visible: PropTypes.bool.isRequired,
  mediaDevices: PropTypes.object.isRequired,
  setAudioDeviceInput: PropTypes.func.isRequired,
  setAudioDeviceOutput: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    mediaDevices: state.mediaDevices,
  };
}

const mapDispatchToProps = {
  setAudioDeviceInput,
  setAudioDeviceOutput,
};

export default connect(mapStateToProps, mapDispatchToProps)(AudioSettings);
