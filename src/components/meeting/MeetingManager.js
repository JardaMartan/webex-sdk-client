import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
// import { useNavigate } from "react-router-dom";
import { init as initWebex } from "webex";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import Box from "@mui/joy/Box";
import ButtonGroup from "@mui/joy/ButtonGroup";
import CircularProgress from "@mui/joy/CircularProgress";
import RemoteVideoOverlay from "./RemoteVideoOverlay";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import ModalClose from "@mui/joy/ModalClose";
// import Typography from "@mui/joy/Typography";
import Grid from "@mui/joy/Grid";
import IconButton from "@mui/joy/IconButton";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import { DialogActions, DialogContent, DialogTitle } from "@mui/joy";

import {
  Mic,
  MicOff,
  MicRounded, //eslint-disable-line no-unused-vars
  MicOffRounded, //eslint-disable-line no-unused-vars
  Videocam,
  VideocamOff,
  BackHand,
} from "@mui/icons-material";

// eslint-disable-next-line no-unused-vars
const MeetingManager = ({ user, webexConfig, ...props }) => {
  const MEETING_STATUSES = {
    INACTIVE: "inactive",
    ACTIVE: "active",
    IN_LOBBY: "lobby",
    JOINING: "joining",
  };
  const [meetingStatus, setMeetingStatus] = useState(MEETING_STATUSES.INACTIVE); //eslint-disable-line no-unused-vars

  const buttonSides = 64;

  const [meetingNumber, setMeetingNumber] = useState(""); //eslint-disable-line no-unused-vars
  const [webexClient, setWebexClient] = useState(null); //eslint-disable-line no-unused-vars
  const [meeting, setMeeting] = useState(null); //eslint-disable-line no-unused-vars
  const [buttonDisabled, setButtonDisabled] = useState(true); //eslint-disable-line no-unused-vars
  const [buttonText, setButtonText] = useState("Join Meeting"); //eslint-disable-line no-unused-vars
  const [overlayHidden, setOverlayHidden] = useState(true); //eslint-disable-line no-unused-vars
  const [overlayMessage, setOverlayMessage] = useState(""); //eslint-disable-line no-unused-vars
  const [isAudioMuted, setIsAudioMuted] = useState(false); //eslint-disable-line no-unused-vars
  const [isVideoMuted, setIsVideoMuted] = useState(false); //eslint-disable-line no-unused-vars
  const [isHandRaised, setIsHandRaised] = useState(false); //eslint-disable-line no-unused-vars
  const [alertLeaveMeeting, setAlertLeaveMeeting] = useState(false); //eslint-disable-line no-unused-vars
  // const navigate = useNavigate();
  const remoteVideoRef = useRef("remoteVideo");
  const localVideoRef = useRef("localVideo");
  const remoteAudioRef = useRef("remoteAudio");

  const localVideoQuality = {
    "360p": "360p",
    "480p": "480p",
    "720p": "720p",
    "1080p": "1080p",
  };

  //eslint-disable-next-line no-unused-vars
  const [localMedia, setLocalMedia] = useState({
    microphoneStream: undefined,
    cameraStream: undefined,
    screenShare: {
      video: undefined,
      audio: undefined,
    },
    videoConstraints: {
      [localVideoQuality["360p"]]: { width: 640, height: 360 },
      [localVideoQuality["480p"]]: { width: 640, height: 480 },
      [localVideoQuality["720p"]]: { width: 1280, height: 720 },
      [localVideoQuality["1080p"]]: { width: 1920, height: 1080 },
    },
  });

  const handleMeetingNumberChange = (e) => {
    setMeetingNumber(e.target.value);
    if (e.target.value.replaceAll(" ", "").length > 8) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  };

  const toggleAudio = () => {
    if (meeting && localMedia.microphoneStream) {
      const newMuteValue = !localMedia.microphoneStream.muted;
      localMedia.microphoneStream.setMuted(newMuteValue);
      setIsAudioMuted(newMuteValue);
      if (!newMuteValue) {
        setOverlayHidden(true);
      }
    }
  };

  const toggleVideo = () => {
    if (meeting && localMedia.cameraStream) {
      const newMuteValue = !localMedia.cameraStream.muted;
      localMedia.cameraStream.setMuted(newMuteValue);
      setIsVideoMuted(newMuteValue);
    }
  };

  const toggleRaiseHand = () => {
    if (meeting) {
      console.log("Raise hand");
      meeting.members
        .raiseOrLowerHand(meeting.members.selfId, !isHandRaised)
        .then(() => {
          console.log("Hand raise done");
          setIsHandRaised(!isHandRaised);
        });
    }
  };

  useEffect(() => {
    console.log("Meeting status changed: " + meetingStatus);
    switch (meetingStatus) {
      case MEETING_STATUSES.INACTIVE:
        setButtonText("Připojit");
        setOverlayHidden(true);
        break;
      case MEETING_STATUSES.ACTIVE:
      case MEETING_STATUSES.IN_LOBBY:
        setButtonText("Ukončit");
        break;
      case MEETING_STATUSES.JOINING:
        setButtonText("Připojuji...");
        break;
      default:
        setButtonText("Připojit");
    }
  }, [
    meetingStatus,
    MEETING_STATUSES.ACTIVE,
    MEETING_STATUSES.IN_LOBBY,
    MEETING_STATUSES.JOINING,
    MEETING_STATUSES.INACTIVE,
  ]);

  const meetingAction = () => {
    switch (meetingStatus) {
      case MEETING_STATUSES.INACTIVE:
        joinMeeting();
        break;
      case MEETING_STATUSES.ACTIVE:
      case MEETING_STATUSES.IN_LOBBY:
        setAlertLeaveMeeting(true);
        break;
      case MEETING_STATUSES.JOINING:
        leaveMeeting();
        break;
      default:
        break;
    }
  };

  const createWebexClient = () => {
    if (webexClient) {
      console.log("Webex client already exists");
      return webexClient;
    }

    try {
      const newWebexClient = (window.webex = initWebex({
        credentials: {
          access_token: webexConfig.accessToken,
        },
      }));
      setWebexClient(newWebexClient);
      console.log("Webex client created");
      return newWebexClient;
    } catch (error) {
      console.error(`Error creating webex client: ${error}`);
    }
  };

  const registerMeeting = async (webexClient) => {
    if (!webexClient) {
      console.error("Webex client not found");
      return false;
    }
    if (webexClient.meetings.registered) {
      console.log("Meetings already registered");
      return true;
    }
    try {
      await webexClient.meetings.register();
      console.log("Meeting registered");
    } catch (error) {
      console.error(`Error registering meeting: ${error}`);
      return false;
    }
    return true;
  };

  const joinMeeting = async () => {
    const wxClient = createWebexClient();
    if (!wxClient) {
      return;
    }
    setMeetingStatus(MEETING_STATUSES.JOINING);
    if (!(await registerMeeting(wxClient))) {
      setMeetingStatus(MEETING_STATUSES.INACTIVE);
      return;
    }

    try {
      // const meetingNum = meetingNumber.replaceAll(" ", "") + "@webex.com";
      const meetingNum = meetingNumber.replaceAll(" ", "");
      console.log(`joining meeting: ${meetingNum}`);
      // const newMeeting = await wxClient.meetings.create(meetingNum, "SIP_URI"); // MEETING_LINK
      const newMeeting = await wxClient.meetings.create(meetingNum); // MEETING_LINK
      setMeeting(newMeeting);
      localMedia.microphoneStream =
        await wxClient.meetings.mediaHelpers.createMicrophoneStream({
          audio: true,
          video: true,
        });
      localMedia.cameraStream =
        await wxClient.meetings.mediaHelpers.createCameraStream({
          video: true,
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        });
      const joinOptions = {
        enableMultistream: false, // Multistream is an experimental feature
        moderator: false,
        breakoutsSupported: false, // Enable breakout rooms in the meeting
        receiveTranscription: false,
        rejoin: true,
        locale: "cs_CZ", // audio disclaimer language
      };
      const mediaOptions = {
        localStreams: {
          microphone: localMedia.microphoneStream,
          camera: localMedia.cameraStream,
        },
        allowMediaInLobby: false,
      };
      //eslint-disable-next-line no-unused-vars
      const meetingOptions = {
        joinOptions: joinOptions,
        mediaOptions: mediaOptions,
      };

      newMeeting.on("media:ready", (media) => {
        console.log(`Media ready: ${media.type}`);
        // eslint-disable-next-line default-case
        switch (media.type) {
          case "remoteVideo":
            remoteVideoRef.current.srcObject = media.stream;
            localVideoRef.current.srcObject =
              localMedia.cameraStream.outputStream;
            break;
          case "remoteAudio":
            remoteAudioRef.current.srcObject = media.stream;
            // localAudioRef.current.srcObject = localMedia.microphoneStream;
            // meetingStreamsRemoteAudio.srcObject = media.stream;
            break;
          case "remoteShare":
            // meetingStreamsRemoteShare.srcObject = media.stream;
            break;
        }
      });

      // remove stream if media stopped
      newMeeting.on("media:stopped", (media) => {
        console.log(`Media stopped: ${media.type}`);
        // eslint-disable-next-line default-case
        switch (media.type) {
          case "remoteVideo":
            localMedia.cameraStream.stop();
            localMedia.microphoneStream.stop();
            remoteVideoRef.current.srcObject = null;
            localVideoRef.current.srcObject = null;
            remoteAudioRef.current.srcObject = null;
            break;
          case "remoteAudio":
            // meetingStreamsRemoteAudio.srcObject = null;
            break;
          case "remoteShare":
            // meetingStreamsRemoteShare.srcObject = null;
            break;
        }
      });

      newMeeting.on("meeting:stateChange", (state) => {
        console.log(`Meeting state changed ${JSON.stringify(state)}`);
        switch (state.payload.currentState) {
          case "ACTIVE":
            setMeetingStatus(MEETING_STATUSES.ACTIVE);
            break;
          case "INACTIVE":
            console.log("Meeting ended");
            setMeetingStatus(MEETING_STATUSES.INACTIVE);
            break;
          default:
            console.log(
              "Meeting state changed to: " + state.payload.currentState
            );
        }
      });

      newMeeting.on("meeting:self:lobbyWaiting", () => {
        console.log("Meeting lobby waiting");
        setMeetingStatus(MEETING_STATUSES.IN_LOBBY);
        setOverlayHidden(false);
        setOverlayMessage("Čekejte, prosím, na vstup do konference");
        localVideoRef.current.srcObject = localMedia.cameraStream.outputStream;
      });

      newMeeting.on("meeting:self:guestAdmitted", () => {
        console.log("Meeting guest admitted");
        setMeetingStatus(MEETING_STATUSES.ACTIVE);
        setOverlayHidden(true);
        newMeeting.addMedia(mediaOptions).then(() => {
          console.log("Media added");
        });
      });

      newMeeting.on("meeting:self:unmutedByOthers", () => {
        console.log("I have been unmuted by others");
        setIsAudioMuted(false);
      });

      newMeeting.on("meeting:self:mutedByOthers", () => {
        console.log("I have been muted by others");
        setIsAudioMuted(true);
      });

      newMeeting.on("meeting:self:requestedToUnmute", () => {
        console.log("I have been requested to unmute");
        setOverlayMessage("Prosím, zapněte si mikrofon");
        setOverlayHidden(false);
      });

      // meeting members update
      newMeeting.members.on("all", (event, payload) => {
        console.log(
          `Meeting member event: ${event}, payload: ${JSON.stringify(payload)}`
        );
        // eslint-disable-next-line default-case
        switch (event) {
          case "members:update": {
            if (
              payload.delta &&
              payload.delta.updated &&
              payload.delta.updated.length > 0
            ) {
              console.log(
                "Members updated: " + JSON.stringify(payload.delta.updated)
              );
              for (let [key, value] of Object.entries(payload.delta.updated)) {
                console.log(`Member ${key} updated: ${JSON.stringify(value)}`);
                if (value.isSelf) {
                  setIsHandRaised(value.isHandRaised);
                }
              }
            }
            // setParticipants(payload.full);
            break;
          }
        }
      });

      await newMeeting.join(joinOptions);
      // await newMeeting.joinWithMedia(meetingOptions);
      console.log("Meeting joined");
      await newMeeting.addMedia(mediaOptions);
      console.log("Media added");
      // remoteVideoRef.current.srcObject = newMeeting.remoteMediaStream;
      // localVideoRef.current.srcObject = localMedia.cameraStream.outputStream;
    } catch (error) {
      console.error(`Error registering meeting: ${error}`);
    }
  };

  const leaveMeeting = async () => {
    if (!meeting) {
      console.error("Meeting not found");
      return;
    }
    try {
      await meeting.leave();
      console.log("Meeting left");
      setMeetingStatus(MEETING_STATUSES.INACTIVE);
      setAlertLeaveMeeting(false);
    } catch (error) {
      console.error(`Error leaving meeting: ${error}`);
    }
  };

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
        open={alertLeaveMeeting}
        onClose={() => setAlertLeaveMeeting(false)}
      >
        <ModalDialog>
          <ModalClose />
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
      <Box
        width={1280}
        my={2}
        display="flex"
        alignItems="center"
        gap={4}
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(1, minmax(80px, 1fr))",
          gap: 1,
          mx: "auto",
        }}
      >
        <Grid container spacing={2}>
          <Grid xs={10}>
            <Input
              label="Meeting Number"
              type="text"
              id="meetingNunber"
              name="meetingNumber"
              variant="outlined"
              onChange={handleMeetingNumberChange}
            />
          </Grid>
          <Grid xs={2}>
            <Button
              variant="soft"
              disabled={buttonDisabled}
              onClick={meetingAction}
              startDecorator={
                meetingStatus === MEETING_STATUSES.JOINING ? (
                  <CircularProgress variant="solid" />
                ) : null
              }
              sx={{ width: 1, mx: "auto" }}
            >
              {buttonText}
            </Button>
          </Grid>
        </Grid>
      </Box>
      <Box
        visibility={
          meetingStatus !== MEETING_STATUSES.INACTIVE &&
          meetingStatus !== MEETING_STATUSES.JOINING
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
        <RemoteVideoOverlay
          className="remote-video-overlay"
          hidden={overlayHidden}
          message={overlayMessage}
        />
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
      <Box
        my={2}
        display="flex"
        alignItems="center"
        gap={4}
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(1, minmax(80px, 1fr))",
          gap: 1,
          mx: "auto",
        }}
      >
        <ButtonGroup
          spacing="0.5rem"
          variant="soft"
          sx={{ border: "4px" }}
          hidden={meetingStatus !== MEETING_STATUSES.ACTIVE}
        >
          <IconButton
            color={isAudioMuted ? "danger" : "primary"}
            onClick={toggleAudio}
            sx={{ width: buttonSides, height: buttonSides }}
          >
            {/* Audio {isAudioMuted ? "Zap." : "Vyp."} */}
            {isAudioMuted ? (
              <MicOff fontSize="large" />
            ) : (
              <Mic fontSize="large" />
            )}
          </IconButton>
          <IconButton
            color={isVideoMuted ? "danger" : "primary"}
            onClick={toggleVideo}
            sx={{ width: buttonSides, height: buttonSides }}
          >
            {/* Video {isVideoMuted ? "Zap." : "Vyp."} */}
            {isVideoMuted ? (
              <VideocamOff fontSize="large" />
            ) : (
              <Videocam fontSize="large" />
            )}
          </IconButton>
          <IconButton
            color={isHandRaised ? "danger" : "primary"}
            onClick={toggleRaiseHand}
            sx={{ width: buttonSides, height: buttonSides }}
          >
            <BackHand fontSize="large" />
          </IconButton>
        </ButtonGroup>
      </Box>
      {/* <Box>
        Local Audio
        <audio id="local-audio" muted controls ref={localAudioRef} />
      </Box> */}
    </Box>
  );
};

MeetingManager.propTypes = {
  user: PropTypes.object,
  webexConfig: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
  return {
    user: state.user,
    webexConfig: state.webex,
  };
}

export default connect(mapStateToProps)(MeetingManager);
