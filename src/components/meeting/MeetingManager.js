import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
// import { useNavigate } from "react-router-dom";
import { init as initWebex } from "webex";
import Button from "@mui/joy/Button";
import Box from "@mui/joy/Box";
import ButtonGroup from "@mui/joy/ButtonGroup";
import RemoteVideoOverlay from "./RemoteVideoOverlay";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import ModalClose from "@mui/joy/ModalClose";
// import Typography from "@mui/joy/Typography";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import { DialogActions, DialogContent, DialogTitle } from "@mui/joy";
import MeetingControlsRedux from "./MeetingControlsRedux";
import MeetingControls from "./MeetingControls"; //eslint-disable-line no-unused-vars
import { MEETING_STATUSES } from "../../constants/meeting";
import MeetingIdForm from "./MeetingIdFormRedux";
import {
  setControlPanel,
  setControlPanelCallback,
  setControlPanelComponent,
  setControlPanelData,
  setControlPanelId,
} from "../../redux/actions/appActions";

const MeetingManager = ({
  user,
  webexConfig,
  setControlPanel,
  setControlPanelCallback,
  setControlPanelComponent,
  setControlPanelData,
  setControlPanelId,
  ...props //eslint-disable-line no-unused-vars
}) => {
  const [meetingStatus, setMeetingStatus] = useState(MEETING_STATUSES.INACTIVE); //eslint-disable-line no-unused-vars
  // const [meetingNumber, setMeetingNumber] = useState(""); //eslint-disable-line no-unused-vars
  const [webexClient, setWebexClient] = useState(null); //eslint-disable-line no-unused-vars
  const [meeting, setMeeting] = useState(null); //eslint-disable-line no-unused-vars
  const [buttonDisabled, setButtonDisabled] = useState(true); //eslint-disable-line no-unused-vars
  const [buttonText, setButtonText] = useState("Join Meeting"); //eslint-disable-line no-unused-vars
  const [overlayHidden, setOverlayHidden] = useState(true); //eslint-disable-line no-unused-vars
  const [overlayMessage, setOverlayMessage] = useState(""); //eslint-disable-line no-unused-vars
  const [isAudioMuted, setIsAudioMuted] = useState(false); //eslint-disable-line no-unused-vars
  const [isUnmuteAllowed, setIsUnmuteAllowed] = useState(false); //eslint-disable-line no-unused-vars
  const [isVideoMuted, setIsVideoMuted] = useState(false); //eslint-disable-line no-unused-vars
  const [isHandRaised, setIsHandRaised] = useState(false); //eslint-disable-line no-unused-vars
  const [alertLeaveMeeting, setAlertLeaveMeeting] = useState(false); //eslint-disable-line no-unused-vars
  const [meetingControls, setMeetingControls] = useState({}); //eslint-disable-line no-unused-vars
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
    setControlPanelCallback((data) => {
      switch (meetingStatus) {
        case MEETING_STATUSES.INACTIVE:
          joinMeeting(data);
          break;
        case MEETING_STATUSES.ACTIVE:
          switch (data) {
            case "toggleAudio":
              toggleAudio();
              break;
            case "toggleVideo":
              toggleVideo();
              break;
            case "toggleRaiseHand":
              toggleRaiseHand();
              break;
            case "leaveMeeting":
              setAlertLeaveMeeting(true);
              break;
            default:
              console.log(`Unknown meeting control: ${data}`);
              setAlertLeaveMeeting(true);
          }
          break;
        case MEETING_STATUSES.IN_LOBBY:
          setAlertLeaveMeeting(true);
          break;
        case MEETING_STATUSES.JOINING:
          leaveMeeting();
          break;
        default:
          break;
      }
    });
  });

  // //eslint-disable-next-line no-unused-vars
  // const meetingAction = (meetingNumber) => {
  //   switch (meetingStatus) {
  //     case MEETING_STATUSES.INACTIVE:
  //       joinMeeting(meetingNumber);
  //       break;
  //     case MEETING_STATUSES.ACTIVE:
  //     case MEETING_STATUSES.IN_LOBBY:
  //       setAlertLeaveMeeting(true);
  //       break;
  //     case MEETING_STATUSES.JOINING:
  //       leaveMeeting();
  //       break;
  //     default:
  //       break;
  //   }
  // };

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

  const joinMeeting = async (meetingNumber) => {
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
        const pload = payload ? payload.payload || payload : {};
        try {
          const ploadStr = JSON.stringify(pload);
          console.log(`Meeting event: ${event}, payload: ${ploadStr}`);
        } catch (error) {
          console.error(`Error stringifying payload: ${error}`);
          console.log(`Meeting event: ${event}`);
        }
        // eslint-disable-next-line default-case
        switch (event) {
          case "members:update": {
            if (
              pload.delta &&
              pload.delta.updated &&
              pload.delta.updated.length > 0
            ) {
              console.log(
                "Members updated: " + JSON.stringify(pload.delta.updated)
              );
              for (let [key, value] of Object.entries(pload.delta.updated)) {
                console.log(`Member ${key} updated: ${JSON.stringify(value)}`);
                if (value.isSelf && value.isInMeeting) {
                  setIsHandRaised(value.isHandRaised);
                  setIsAudioMuted(value.isAudioMuted);
                  setIsVideoMuted(value.isVideoMuted);
                  setIsUnmuteAllowed(
                    !value.participant.controls.audio.disallowUnmute
                  );
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

  const leaveMeeting = () => {
    if (!meeting) {
      console.error("Meeting not found");
      return;
    }
    try {
      meeting.leave().then(() => {
        console.log("Meeting left");
        setAlertLeaveMeeting(false);
        setMeetingStatus(MEETING_STATUSES.INACTIVE);
        webexClient.meetings.unregister().then(() => {
          console.log("Meetings unregistered");
        });
      });
    } catch (error) {
      console.error(`Error leaving meeting: ${error}`);
    }
  };
  //eslint-disable-next-line no-unused-vars
  // const meetingIdForm =
  //   () => (
  //     <MeetingIdForm
  //       meetingStatus={meetingStatus}
  //       buttonText={buttonText}
  //     />
  // );

  useEffect(() => {
    console.log("Meeting status changed: " + meetingStatus);
    switch (meetingStatus) {
      case MEETING_STATUSES.INACTIVE: {
        const btnText = "Připojit";
        setButtonText(btnText);
        setOverlayHidden(true);
        setControlPanel({
          id: "id-form",
          component: <MeetingIdForm />,
          data: { meetingStatus, buttonText: btnText },
        });
        break;
      }
      case MEETING_STATUSES.ACTIVE:
        setControlPanel({
          id: "meeting-controls",
          component: <MeetingControlsRedux />,
          data: {
            isAudioMuted,
            isVideoMuted,
            isUnmuteAllowed,
            isHandRaised,
          },
        });
        break;
      case MEETING_STATUSES.IN_LOBBY:
        setControlPanelData({ meetingStatus, buttonText: "Ukončit" });
        break;
      case MEETING_STATUSES.JOINING:
        setControlPanelData({ meetingStatus, buttonText: "Připojuji..." });
        break;
      default:
        setControlPanelData({ meetingStatus, buttonText: "Připojit" });
    }
  }, [
    meetingStatus,
    setControlPanel,
    setControlPanelData,
    isAudioMuted,
    isVideoMuted,
    isUnmuteAllowed,
    isHandRaised,
  ]);

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
      {/* <MeetingIdForm /> */}
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
      {/* <MeetingControls
        hidden={meetingStatus !== MEETING_STATUSES.ACTIVE}
        isAudioMuted={isAudioMuted}
        isUnmuteAllowed={isUnmuteAllowed}
        isVideoMuted={isVideoMuted}
        isHandRaised={isHandRaised}
        toggleAudio={toggleAudio}
        toggleVideo={toggleVideo}
        toggleRaiseHand={toggleRaiseHand}
        leaveMeeting={() => setAlertLeaveMeeting(true)}
      /> */}

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
  setControlPanel: PropTypes.func,
  setControlPanelCallback: PropTypes.func,
  setControlPanelComponent: PropTypes.func,
  setControlPanelData: PropTypes.func,
  setControlPanelId: PropTypes.func,
};

function mapStateToProps(state) {
  return {
    user: state.user,
    webexConfig: state.webex,
  };
}

const mapDispatchToProps = {
  setControlPanel,
  setControlPanelCallback,
  setControlPanelComponent,
  setControlPanelData,
  setControlPanelId,
};

export default connect(mapStateToProps, mapDispatchToProps)(MeetingManager);
