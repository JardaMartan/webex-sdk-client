import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
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
import { DialogActions, DialogContent, DialogTitle, Input } from "@mui/joy";
// import MeetingControls from "./MeetingControls";
// import MeetingIdForm from "./MeetingIdForm";
import {
  useMeeting,
  useMeetingAction,
  useMeetingDispatch,
} from "../meetingcontext/MeetingContext";
import { MEETING_STATUSES } from "../../constants/meeting";
import * as actionTypes from "../meetingcontext/MeetingContextActionTypes";
import DtmfPanel from "./DtmfPanel";

const MeetingView = ({ mediaDevices }) => {
  const remoteVideoRef = useRef("remoteVideo");
  const localVideoRef = useRef("localVideo");
  const remoteAudioRef = useRef("remoteAudio");
  const contextState = useMeeting();
  const { leaveMeeting, setMeetingJoin } = useMeetingAction();
  const dispatch = useMeetingDispatch();
  const [meetingPassword, setMeetingPassword] = useState("");
  const [meetingCaptcha, setMeetingCaptcha] = useState("");

  const setAlertLeaveMeeting = (alertLeaveMeeting) => {
    dispatch({ type: actionTypes.SET_ALERT_LEAVE_MEETING, alertLeaveMeeting });
  };

  const setAlertEnterPassword = (alertEnterPassword) => {
    dispatch({
      type: actionTypes.SET_ALERT_ENTER_PASSWORD,
      alertEnterPassword,
    });
  };

  const setAlertEnterCaptcha = (alertEnterCaptcha) => {
    dispatch({
      type: actionTypes.SET_ALERT_ENTER_CAPTCHA,
      alertEnterCaptcha,
    });
  };

  // console.log("Meeting status: " + contextState.meetingStatus);
  // console.log(
  //   `Media streams. Microphone: ${contextState.localMedia.audio}, Camera: ${contextState.localMedia.video}, Remote audio: ${contextState.remoteMedia.audio}, Remote video: ${contextState.remoteMedia.video}`
  // );

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
      <Modal
        open={contextState.alertLeaveMeeting}
        onClose={() => setAlertLeaveMeeting(true)}
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
      <Modal
        open={contextState.alertEnterPassword}
        onClose={() => setAlertEnterPassword(false)}
      >
        <ModalDialog>
          <ModalClose onClick={() => setAlertEnterPassword(false)} />
          <DialogTitle>Heslo konference</DialogTitle>
          <Divider inset="none" />
          <DialogContent>
            Zadejte heslo konference
            <Input
              value={meetingPassword}
              onChange={(e) => setMeetingPassword(e.target.value)}
            />
          </DialogContent>
          <DialogActions
            buttonFlex="none"
            sx={{ pt: 1.5, justifyContent: "flex-start" }}
          >
            <ButtonGroup variant="outlined" color="primary" spacing="0.5rem">
              <Button onClick={() => setAlertEnterPassword(false)}>
                Zrušit
              </Button>
              <Button
                onClick={() => {
                  setMeetingJoin({ password: meetingPassword });
                  setMeetingPassword("");
                  setAlertEnterPassword(false);
                }}
              >
                OK
              </Button>
            </ButtonGroup>
          </DialogActions>
        </ModalDialog>
      </Modal>
      <Modal
        open={contextState.alertEnterCaptcha}
        onClose={() => setAlertEnterCaptcha(false)}
      >
        <ModalDialog>
          <ModalClose onClick={() => setAlertEnterCaptcha(false)} />
          <DialogTitle>Kód z obrázku</DialogTitle>
          <Divider inset="none" />
          <DialogContent>
            Zadejte kód z obrázku
            <img
              src={contextState.meetingCaptcha.verificationImageURL}
              alt="Captcha"
              style={{ display: "block" }}
            />
            <Input
              value={meetingCaptcha}
              onChange={(e) => setMeetingCaptcha(e.target.value)}
            />
          </DialogContent>
          <DialogActions
            buttonFlex="none"
            sx={{ pt: 1.5, justifyContent: "flex-start" }}
          >
            <ButtonGroup variant="outlined" color="primary" spacing="0.5rem">
              <Button onClick={() => setAlertEnterCaptcha(false)}>
                Zrušit
              </Button>
              <Button
                onClick={() => {
                  setMeetingJoin({ captcha: meetingCaptcha });
                  setMeetingCaptcha("");
                  setAlertEnterCaptcha(false);
                }}
              >
                OK
              </Button>
            </ButtonGroup>
          </DialogActions>
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
      <Box visibility="hidden">
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

MeetingView.propTypes = {
  mediaDevices: PropTypes.object,
};

const mapStateToProps = (state) => {
  return {
    mediaDevices: state.mediaDevices,
  };
};

export default connect(mapStateToProps)(MeetingView);
