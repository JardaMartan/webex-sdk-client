import React, { useRef } from "react";
import Button from "@mui/joy/Button";
import Box from "@mui/joy/Box";
import ButtonGroup from "@mui/joy/ButtonGroup";
import RemoteVideoOverlay from "./RemoteVideoOverlay";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import ModalClose from "@mui/joy/ModalClose";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import { DialogActions, DialogContent, DialogTitle } from "@mui/joy";
// import MeetingControls from "./MeetingControls";
// import MeetingIdForm from "./MeetingIdForm";
import {
  useMeeting,
  useMeetingAction,
  useMeetingDispatch,
} from "./MeetingContext";
import { MEETING_STATUSES } from "../../constants/meeting";
import * as actionTypes from "./MeetingContextActionTypes";
import DtmfPanel from "./DtmfPanel";

const MeetingView = () => {
  const remoteVideoRef = useRef("remoteVideo");
  const localVideoRef = useRef("localVideo");
  const remoteAudioRef = useRef("remoteAudio");
  const contextState = useMeeting();
  const { leaveMeeting } = useMeetingAction();
  const dispatch = useMeetingDispatch();

  const setAlertLeaveMeeting = (alertLeaveMeeting) => {
    dispatch({ type: actionTypes.SET_ALERT_LEAVE_MEETING, alertLeaveMeeting });
  };

  console.log("Meeting status: " + contextState.meetingStatus);
  console.log(
    `Media streams. Microphone: ${contextState.localMedia.audio}, Camera: ${contextState.localMedia.video}, Remote audio: ${contextState.remoteMedia.audio}, Remote video: ${contextState.remoteMedia.video}`
  );

  try {
    if (
      [MEETING_STATUSES.ACTIVE, MEETING_STATUSES.IN_LOBBY].includes(
        contextState.meetingStatus
      ) &&
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

  try {
    if (
      MEETING_STATUSES.ACTIVE === contextState.meetingStatus &&
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

  try {
    if (
      MEETING_STATUSES.ACTIVE === contextState.meetingStatus &&
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
      <Modal
        open={contextState.alertLeaveMeeting}
        onClose={() =>
          dispatch({
            type: actionTypes.SET_ALERT_LEAVE_MEETING,
            alertLeaveMeeting: true,
          })
        }
      >
        <ModalDialog>
          <ModalClose onClick={() => setAlertLeaveMeeting(false)} />
          <DialogTitle>Opustit konferenci</DialogTitle>
          <Divider inset="none" />
          <DialogContent>Chcete opustit konferenci?</DialogContent>
          <DialogActions
            buttonFlex="none"
            sx={{ pt: 1.5, justifyContent: "flex-start" }}
          >
            <ButtonGroup variant="outlined" color="primary" spacing="0.5rem">
              <Button onClick={() => setAlertLeaveMeeting(false)}>Ne</Button>
              <Button onClick={leaveMeeting}>Ano</Button>
            </ButtonGroup>
          </DialogActions>
        </ModalDialog>
      </Modal>
      <Modal open={!contextState.dtmfPanel.hidden}>
        <ModalDialog>
          <ModalClose
            onClick={() =>
              dispatch({
                type: actionTypes.SET_DTMF_PANEL,
                dtmfPanel: { hidden: true },
              })
            }
          />
          <Box pt={3}>
            <DtmfPanel />
          </Box>
        </ModalDialog>
      </Modal>
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
      <Box hidden={true}>
        Remote Audio
        <audio id="remote-audio" controls autoPlay ref={remoteAudioRef} />
      </Box>
      {/* <MeetingControls /> */}

      {/* <Box>
        Local Audio
        <audio id="local-audio" muted controls ref={localAudioRef} />
      </Box> */}
    </Box>
  );
};

export default MeetingView;