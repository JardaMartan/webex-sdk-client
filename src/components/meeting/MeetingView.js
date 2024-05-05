import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Box from "@mui/joy/Box";
import RemoteVideoOverlay from "./RemoteVideoOverlay";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import { useMeeting } from "../meetingcontext/MeetingContext";
import { MEETING_STATUSES } from "../../constants/meeting";
import ModalLeaveMeeting from "./ModalLeaveMeeting";
import ModalDtmf from "./ModalDtmf";
import ModalMeetingPassword from "./ModalMeetingPassword";
import ModalMeetingCaptcha from "./ModalMeetingCaptcha";

const MeetingView = ({ mediaDevices }) => {
  const remoteVideoRef = useRef("remoteVideo");
  const localVideoRef = useRef("localVideo");
  const remoteAudioRef = useRef("remoteAudio");
  const contextState = useMeeting();

  // console.log("Meeting status: " + contextState.meetingStatus);
  // console.log(
  //   `Media streams. Microphone: ${contextState.localMedia.audio}, Camera: ${contextState.localMedia.video}, Remote audio: ${contextState.remoteMedia.audio}, Remote video: ${contextState.remoteMedia.video}`
  // );

  /**
   * Set local video stream to the local video (selfview) element
   */
  useEffect(() => {
    try {
      if (
        [
          MEETING_STATUSES.ACTIVE,
          MEETING_STATUSES.IN_LOBBY,
          MEETING_STATUSES.JOINED,
          MEETING_STATUSES.IN_MEETING,
        ].includes(contextState.meetingStatus) &&
        contextState.localMedia.video
      ) {
        if (localVideoRef.current.srcObject == null) {
          console.log("Setting local video for selfview");
          localVideoRef.current.srcObject =
            contextState.localMedia.video.outputStream;
        }
      } else if (localVideoRef.current.srcObject != null) {
        console.log("Unsetting local video for selfview");
        localVideoRef.current.srcObject = null;
      }
    } catch (error) {
      console.log(`Error setting local video: ${error}`);
    }
  }, [contextState.localMedia.video, contextState.meetingStatus]);

  /**
   * Set remote video stream to the remote video element
   */
  useEffect(() => {
    try {
      if (
        MEETING_STATUSES.IN_MEETING === contextState.meetingStatus &&
        contextState.remoteMedia.video
      ) {
        if (remoteVideoRef.current.srcObject == null) {
          console.log("Setting remote video");
          remoteVideoRef.current.srcObject =
            contextState.remoteMedia.video.stream;
        }
      } else if (remoteVideoRef.current.srcObject != null) {
        console.log("Unsetting remote video");
        remoteVideoRef.current.srcObject = null;
      }
    } catch (error) {
      console.log(`Error setting remote video: ${error}`);
    }
  }, [contextState.remoteMedia.video, contextState.meetingStatus]);

  /**
   * Set remote audio stream to the remote audio element
   */
  useEffect(() => {
    try {
      if (
        MEETING_STATUSES.IN_MEETING === contextState.meetingStatus &&
        contextState.remoteMedia.audio
      ) {
        if (remoteAudioRef.current.srcObject == null) {
          console.log("Setting remote audio");
          remoteAudioRef.current.srcObject =
            contextState.remoteMedia.audio.stream;
        }
      } else if (remoteAudioRef.current.srcObject != null) {
        console.log("Unsetting remote audio");
        remoteAudioRef.current.srcObject = null;
      }
    } catch (error) {
      console.log(`Error setting remote audio: ${error}`);
    }
  }, [contextState.remoteMedia.audio, contextState.meetingStatus]);

  /**
   * Set audio output device for the remote audio element
   */
  useEffect(() => {
    if (mediaDevices.selected?.audio_output.length > 0 && remoteAudioRef) {
      console.log(
        "Selected audio output: ",
        mediaDevices.selected.audio_output
      );
      remoteAudioRef.current.setSinkId(mediaDevices.selected.audio_output);
    }
  }, [mediaDevices.selected]); //eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box
      my={2}
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        flexGrow: 1,
        display: "grid",
        gridTemplateColumns: "repeat(1, minmax(80px, 1fr))",
        gap: 1,
      }}
    >
      <ModalLeaveMeeting />
      <ModalDtmf />
      <ModalMeetingPassword />
      <ModalMeetingCaptcha />
      {/* <MeetingIdForm /> */}
      <Box
        visibility={
          contextState.meetingStatus !== MEETING_STATUSES.INACTIVE &&
          contextState.meetingStatus !== MEETING_STATUSES.JOINING
            ? "visible"
            : "hidden"
        }
        id="meetingStreams"
        width={1280}
        height={720}
        // my={2}
        display="flex"
        alignItems="center"
        // gap={4}
        sx={{
          display: "grid",
          // gridTemplateColumns: "repeat(1, minmax(80px, 1fr))",
          // gap: 1,
          mx: "auto",
          position: "relative",
        }}
      >
        <Paper
          display="flex"
          sx={{
            width: 1,
            height: 1,
            position: "absolute",
            overflow: "hidden",
            borderRadius: 2,
            justifyContent: "flex-start",
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
              width="100%"
              height="100%"
              id="remoteVideo"
              ref={remoteVideoRef}
              autoPlay
              playsInline
            />
          </Container>
        </Paper>
        <RemoteVideoOverlay className="remote-video-overlay" />
        <Paper
          elevation={6}
          display="flex"
          sx={{
            width: 240,
            height: 135,
            bottom: 10,
            right: 10,
            zindex: 5,
            overflow: "hidden",
            position: "absolute",
            justifyContent: "flex-end",
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
              id="localVideo"
              ref={localVideoRef}
              autoPlay
              playsInline
              width="100%"
              height="100%"
              zindex={4}
            />
          </Container>
        </Paper>
      </Box>
      <Box visibility="hidden">
        Remote Audio
        <audio id="remote-audio" controls autoPlay ref={remoteAudioRef} />
      </Box>
      {/* <MeetingControls /> */}
    </Box>
  );
};

MeetingView.propTypes = {
  mediaDevices: PropTypes.object,
};

const mapStateToProps = (state) => {
  return {
    mediaDevices: state.mediaDevices,
  };
};

export default connect(mapStateToProps)(MeetingView);
