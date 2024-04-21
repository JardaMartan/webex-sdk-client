import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import * as actionTypes from "./MeetingContextActionTypes";
import propTypes from "prop-types";
import { connect } from "react-redux";
import { init as initWebex } from "webex";
import { MEETING_STATUSES } from "../../constants/meeting";
import MeetingIdForm from "../meeting/MeetingIdForm";
import MeetingControls from "../meeting/MeetingControls";

const MeetingContext = createContext(null);
const MeetingDispatchContext = createContext(null);
const MeetinActionContext = createContext(null);

//eslint-disable-next-line no-unused-vars
export const MeetingProvider = ({ children, user, webexConfig, ...props }) => {
  const [webexClient, setWebexClient] = useState(null);
  const [meeting, setMeeting] = useState(null);

  const meetingReducer = (state, action) => {
    console.log(
      `meetingContextReducer, state: ${JSON.stringify(
        state
      )}\naction: ${JSON.stringify(action)}`
    );
    switch (action.type) {
      case actionTypes.SET_HAND_RAISED:
        return { ...state, isHandRaised: action.isHandRaised };
      case actionTypes.SET_AUDIO_MUTED:
        if (!state.overlay.hidden && !action.isAudioMuted) {
          return {
            ...state,
            isAudioMuted: action.isAudioMuted,
            overlay: { hidden: true, message: "" },
          };
        }
        return { ...state, isAudioMuted: action.isAudioMuted };
      case actionTypes.SET_VIDEO_MUTED:
        return { ...state, isVideoMuted: action.isVideoMuted };
      case actionTypes.SET_UNMUTE_ALLOWED:
        return { ...state, isUnmuteAllowed: action.isUnmuteAllowed };
      case actionTypes.SET_MEETING_STATUS:
        return { ...state, meetingStatus: action.status };
      case actionTypes.SET_LOCAL_MEDIA:
        return {
          ...state,
          localMedia: { ...state.localMedia, ...action.localMedia },
        };
      case actionTypes.SET_REMOTE_MEDIA:
        return {
          ...state,
          remoteMedia: { ...state.remoteMedia, ...action.remoteMedia },
        };
      case actionTypes.SET_OVERLAY:
        return { ...state, overlay: { ...state.overlay, ...action.overlay } };
      case actionTypes.SET_ALERT_LEAVE_MEETING:
        return { ...state, alertLeaveMeeting: action.alertLeaveMeeting };
      case actionTypes.SET_CONTROL_PANEL:
        return { ...state, controlPanel: action.controlPanel };
      case actionTypes.SET_DTMF_PANEL:
        return {
          ...state,
          dtmfPanel: { ...state.dtmfPanel, ...action.dtmfPanel },
        };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(meetingReducer, initialState);

  const setIsAudioMuted = (isAudioMuted) => {
    dispatch({ type: actionTypes.SET_AUDIO_MUTED, isAudioMuted });
  };

  const setOverlay = (overlay) => {
    dispatch({ type: actionTypes.SET_OVERLAY, overlay });
  };

  const setIsHandRaised = (isHandRaised) => {
    dispatch({ type: actionTypes.SET_HAND_RAISED, isHandRaised });
  };

  const setIsVideoMuted = (isVideoMuted) => {
    dispatch({ type: actionTypes.SET_VIDEO_MUTED, isVideoMuted });
  };

  const setIsUnmuteAllowed = (isUnmuteAllowed) => {
    dispatch({ type: actionTypes.SET_UNMUTE_ALLOWED, isUnmuteAllowed });
  };

  const setAlertLeaveMeeting = (alertLeaveMeeting) => {
    dispatch({ type: actionTypes.SET_ALERT_LEAVE_MEETING, alertLeaveMeeting });
  };

  const setMeetingStatus = (status) => {
    dispatch({ type: actionTypes.SET_MEETING_STATUS, status });
  };

  const setLocalMedia = (localMedia) => {
    dispatch({ type: actionTypes.SET_LOCAL_MEDIA, localMedia });
  };

  const setRemoteMedia = (remoteMedia) => {
    dispatch({ type: actionTypes.SET_REMOTE_MEDIA, remoteMedia });
  };

  const setControlPanel = (controlPanel) => {
    dispatch({ type: actionTypes.SET_CONTROL_PANEL, controlPanel });
  };

  useEffect(() => {
    console.log(
      `Meeting status changed: ${state.meetingStatus}, updating control panel`
    );
    switch (state.meetingStatus) {
      case MEETING_STATUSES.ACTIVE:
        setControlPanel({
          name: "meeting-controls",
          component: <MeetingControls />,
        });
        setOverlay({ hidden: true, message: "" });
        break;
      case MEETING_STATUSES.INACTIVE:
        setControlPanel(
          user.loggedIn
            ? {
                name: "meeting-id-form",
                component: <MeetingIdForm />,
              }
            : { name: "none", component: <></> }
        );
        break;
      default:
        setControlPanel(
          user.loggedIn
            ? {
                name: "meeting-id-form",
                component: <MeetingIdForm />,
              }
            : { name: "none", component: <></> }
        );
        break;
    }
  }, [state.meetingStatus, user.loggedIn, webexClient]);

  const createWebexClient = () => {
    if (webexClient) {
      console.log("Webex client already exists");
      return webexClient;
    }

    try {
      const newWebexClient = initWebex({
        credentials: {
          access_token: webexConfig.accessToken,
        },
      });
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
      const micStream =
        await wxClient.meetings.mediaHelpers.createMicrophoneStream({
          audio: true,
        });
      const camStream = await wxClient.meetings.mediaHelpers.createCameraStream(
        {
          video: true,
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        }
      );
      setLocalMedia({
        audio: micStream,
        video: camStream,
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
          microphone: micStream,
          camera: camStream,
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
        switch (media.type) {
          case "remoteVideo":
            setRemoteMedia({ video: media });
            break;
          case "remoteAudio":
            setRemoteMedia({ audio: media });
            break;
          case "remoteShare":
            // meetingStreamsRemoteShare.srcObject = media.stream;
            break;
          default:
            console.log(`Unknown media type: ${media.type}`);
            break;
        }
      });

      // remove stream if media stopped
      newMeeting.on("media:stopped", (media) => {
        console.log(`Media stopped: ${media.type}`);
        switch (media.type) {
          case "remoteVideo":
            camStream.stop();
            setRemoteMedia({ video: null });
            setLocalMedia({ video: null });
            break;
          case "remoteAudio":
            micStream.stop();
            setRemoteMedia({ audio: null });
            setLocalMedia({ audio: null });
            break;
          case "remoteShare":
            setRemoteMedia({ share: null });
            break;
          default:
            console.log(`Unknown media type: ${media.type}`);
            break;
        }
      });

      newMeeting.on("meeting:stateChange", (state) => {
        console.log(`Meeting state changed`); // ${JSON.stringify(state)}`);
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
        setOverlay({
          hidden: false,
          message: "Čekejte, prosím, na vstup do konference",
          canClose: false,
        });
        // state.localVideoRef.current.srcObject =
        //   state.localMedia.video.outputStream;
      });

      newMeeting.on("meeting:self:guestAdmitted", () => {
        console.log("Meeting guest admitted");
        setMeetingStatus(MEETING_STATUSES.ACTIVE);
        setOverlay({ hidden: true, message: "" });
        newMeeting
          .addMedia(mediaOptions)
          .then(() => {
            console.log("Media added");
          })
          .catch((error) => {
            console.error(`Error adding media: ${error}`);
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
        setOverlay({
          hidden: false,
          message: "Prosím, zapněte si mikrofon",
          canClose: true,
        });
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
                if (value.isSelf) {
                  if (value.isInMeeting) {
                    setIsHandRaised(value.isHandRaised);
                    setIsAudioMuted(value.isAudioMuted);
                    setIsVideoMuted(value.isVideoMuted);
                    setIsUnmuteAllowed(
                      !value.participant.controls.audio.disallowUnmute
                    );
                  } else if (value.isInLobby) {
                    // in lobby
                  } else {
                    // not in meeting
                    leaveMeeting();
                  }
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
    } catch (error) {
      console.error(`Error registering meeting: ${error}`);
    }
  };

  const leaveMeeting = () => {
    function unregisterMeeting() {
      setAlertLeaveMeeting(false);
      setMeetingStatus(MEETING_STATUSES.INACTIVE);
      if (webexClient && webexClient.meetings.registered) {
        setTimeout(() => {
          webexClient.meetings.unregister().then(() => {
            console.log("Meetings unregistered");
            setMeeting(null);
          }, 3000);
        });
      } else {
        console.log("Meetings not registered");
        setMeeting(null);
      }
    }

    if (!meeting) {
      console.error("Meeting not found");
      unregisterMeeting();
      return;
    }
    try {
      meeting
        .leave()
        .then(() => {
          console.log("Meeting left");
          unregisterMeeting();
        })
        .catch((error) => {
          console.error(`Error leaving meeting: ${error}`);
        });
    } catch (error) {
      console.error(`Error leaving meeting: ${error}`);
    }
  };

  const setHandRaised = (isHandRaised) => {
    meeting.members
      .raiseOrLowerHand(meeting.members.selfId, isHandRaised)
      .then(() => {
        console.log("Hand raise requested");
      })
      .catch((error) => {
        console.error(`Error raising hand: ${error}`);
      });
  };

  const setAudioMuted = (isAudioMuted) => {
    if (!meeting || !state.localMedia.audio) {
      console.log("Meeting or microphone stream not found");
      return;
    }
    state.localMedia.audio.setMuted(isAudioMuted);
    console.log("Audio mute requested");
  };

  const setVideoMuted = (isVideoMuted) => {
    if (!meeting || !state.localMedia.video) {
      console.log("Meeting or camera stream not found");
      return;
    }
    state.localMedia.video.setMuted(isVideoMuted);
    console.log("Video mute requested");
  };

  const sendDTMF = (digit) => {
    if (!meeting) {
      console.error("Meeting not found");
      return;
    }
    if (
      ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "#"].includes(
        digit
      )
    ) {
      meeting
        .sendDTMF(digit)
        .then(() => {
          console.log(`DTMF sent: ${digit}`);
          dispatch({
            type: actionTypes.SET_DTMF_PANEL,
            dtmfPanel: { input: state.dtmfPanel.input + digit },
          });
        })
        .catch((error) => {
          console.error(`Error sending DTMF: ${error}`);
        });
    } else {
      console.error(`Invalid DTMF digit: ${digit}`);
    }
  };

  return (
    <MeetingContext.Provider value={state}>
      <MeetingDispatchContext.Provider value={dispatch}>
        <MeetinActionContext.Provider
          value={{
            joinMeeting,
            leaveMeeting,
            setHandRaised,
            setAudioMuted,
            setVideoMuted,
            sendDTMF,
          }}
        >
          {children}
        </MeetinActionContext.Provider>
      </MeetingDispatchContext.Provider>
    </MeetingContext.Provider>
  );
};

const localVideoQuality = {
  "360p": "360p",
  "480p": "480p",
  "720p": "720p",
  "1080p": "1080p",
};

const initialState = {
  isHandRaised: false,
  isAudioMuted: false,
  isVideoMuted: false,
  isUnmuteAllowed: true,
  meetingStatus: MEETING_STATUSES.INACTIVE,
  alertLeaveMeeting: false,
  overlay: {
    message: "",
    hidden: true,
    canClose: false,
  },
  dtmfPanel: {
    hidden: true,
    input: "",
  },
  localMedia: {
    audio: null,
    video: null,
    screenShare: {
      video: null,
      audio: null,
    },
    videoConstraints: {
      [localVideoQuality["360p"]]: { width: 640, height: 360 },
      [localVideoQuality["480p"]]: { width: 640, height: 480 },
      [localVideoQuality["720p"]]: { width: 1280, height: 720 },
      [localVideoQuality["1080p"]]: { width: 1920, height: 1080 },
    },
  },
  remoteMedia: {
    audio: null,
    video: null,
    share: null,
  },
  controlPanel: {
    name: "none",
    component: <></>,
  },
};

export const useMeeting = () => useContext(MeetingContext);
export const useMeetingDispatch = () => useContext(MeetingDispatchContext);
export const useMeetingAction = () => useContext(MeetinActionContext);

MeetingProvider.propTypes = {
  children: propTypes.node.isRequired,
  user: propTypes.object.isRequired,
  webexConfig: propTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
    webexConfig: state.webex,
  };
};

export default connect(mapStateToProps)(MeetingProvider);
