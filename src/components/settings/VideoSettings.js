import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Select, Stack, InputLabel, Container, Paper } from "@mui/material";
import {
  setVideoDeviceInput,
  setVideoDeviceQuality,
} from "../../redux/actions/mediaDevicesActions";
import { useMeeting, useMeetingAction } from "../meetingcontext/MeetingContext";
import { MEETING_STATUSES } from "../../constants/meeting";
import * as constants from "../../constants/meeting";
// import cisco from "../../assets/cisco_animated.gif";

const VideoSettings = ({
  visible,
  mediaDevices,
  setVideoDeviceInput,
  setVideoDeviceQuality,
}) => {
  const contextState = useMeeting();
  const {
    startCameraStream,
    stopCameraStream,
    localVideoQualityOptions,
    setVirtualBackground,
    vbgModes,
  } = useMeetingAction(); //eslint-disable-line no-unused-vars
  const videoPreviewRef = useRef("videoPreview");
  const selectWidth = "300px";
  const selectHeight = "56px";

  //   eslint-disable-next-line no-unused-vars
  const videoActive = () => {
    try {
      const proto = Object.getPrototypeOf(
        contextState.localMedia.video.outputStream
      );
      console.log(
        "There is an active video stream: ",
        proto === MediaStream.prototype
      );
      return proto === MediaStream.prototype;
    } catch (error) {
      console.log("There is no active video stream");
      return false;
    }
  };

  useEffect(() => {
    if (visible) {
      if (
        ![
          MEETING_STATUSES.ACTIVE,
          MEETING_STATUSES.IN_LOBBY,
          MEETING_STATUSES.IN_MEETING,
        ].includes(contextState.meetingStatus)
      ) {
        startCameraStream(mediaDevices.selected.video_input);
      }
    } else {
      if (
        ![
          MEETING_STATUSES.ACTIVE,
          MEETING_STATUSES.IN_LOBBY,
          MEETING_STATUSES.IN_MEETING,
        ].includes(contextState.meetingStatus)
      ) {
        stopCameraStream();
      }
    }
  }, [visible]); //eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (
      visible &&
      contextState.localMedia &&
      contextState.localMedia.video &&
      contextState.localMedia.video.outputStream
    ) {
      videoPreviewRef.current.srcObject =
        contextState.localMedia.video.outputStream;
      console.log("Video stream preview attached");
    }
  }, [contextState.localMedia.video, visible]); //eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) {
    return null;
  }
  return (
    <div>
      <Stack
        direction="column"
        spacing={2}
        // justifyContent="space-between"
        alignItems="left"
      >
        <InputLabel htmlFor="cam-select">Kamera</InputLabel>
        <Stack
          direction="row"
          spacing={2}
          //   justifyContent="space-between"
          alignItems="top"
        >
          <Stack
            direction="column"
            spacing={2}
            // justifyContent="space-between"
            alignItems="left"
          >
            <Select
              native
              value={mediaDevices.selected.video_input}
              inputProps={{
                id: "cam-select",
              }}
              sx={{ width: selectWidth, maxHeight: selectHeight }}
              onChange={(event) => {
                console.log("Video input changed", event.target.value);
                setVideoDeviceInput(event.target.value);
                startCameraStream(event.target.value);
              }}
            >
              {contextState.localMedia.available.video_input.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </option>
              ))}
            </Select>
            <Select
              native
              value={mediaDevices.selected.video_quality}
              inputProps={{
                id: "cam-quality",
              }}
              sx={{ width: selectWidth, maxHeight: selectHeight }}
              onChange={(event) => {
                console.log("Video quality changed", event.target.value);
                setVideoDeviceQuality(event.target.value);
                startCameraStream(
                  mediaDevices.selected.video_input,
                  event.target.value
                );
              }}
            >
              {localVideoQualityOptions.map((quality) => (
                <option key={quality} value={quality}>
                  {quality}
                </option>
              ))}
            </Select>
            <Select
              native
              value={mediaDevices.selected.virtual_background?.mode || "NONE"}
              inputProps={{
                id: "vbg-mode",
              }}
              sx={{ width: selectWidth, maxHeight: selectHeight }}
              onChange={(event) => {
                console.log(
                  "Virtual background mode changed",
                  event.target.value
                );
                setVirtualBackground(
                  event.target.value,
                  // cisco,
                  // constants.DEFAULT_VBG_IMAGE,
                  constants.CISCO_VBG_IMAGE,
                  constants.DEFAULT_VBG_VIDEO
                );
              }}
            >
              {Object.keys(vbgModes).map((mode) => (
                <option key={mode} value={mode}>
                  {vbgModes[mode]}
                </option>
              ))}
            </Select>
          </Stack>
          <Paper
            elevation={6}
            display="flex"
            sx={{
              width: 480,
              height: 270,
              bottom: 10,
              right: 10,
              zindex: 5,
              overflow: "hidden",
              borderRadius: 2,
            }}
          >
            <Container
              disableGutters={true}
              maxWidth={false}
              sx={{
                width: 1,
                height: 1,
              }}
            >
              <video
                id="videoPreview"
                ref={videoPreviewRef}
                autoPlay
                playsInline
                width="100%"
                height="100%"
                zindex={4}
              />
            </Container>
          </Paper>
        </Stack>
      </Stack>
    </div>
  );
};

VideoSettings.propTypes = {
  visible: PropTypes.bool.isRequired,
  mediaDevices: PropTypes.object.isRequired,
  setVideoDeviceInput: PropTypes.func.isRequired,
  setVideoDeviceQuality: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    mediaDevices: state.mediaDevices,
  };
}

const mapDispatchToProps = {
  setVideoDeviceInput,
  setVideoDeviceQuality,
};

export default connect(mapStateToProps, mapDispatchToProps)(VideoSettings);
