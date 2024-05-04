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
import {
  getDevices,
  createCameraStream,
  createMicrophoneStream,
} from "@webex/plugin-meetings";

import { MEETING_STATUSES } from "../../constants/meeting";
import MeetingIdForm from "../meeting/MeetingIdForm";
import MeetingControls from "../meeting/MeetingControls";
import {
  setAudioDeviceInput,
  setAudioNoiseRemoval,
  setVideoDeviceInput,
  setVirtualBackgroundMode,
  setVirtualBackgroundImage,
  setVirtualBackgroundVideo,
} from "../../redux/actions/mediaDevicesActions";

/* TODO:
- 24kHz problem of AirPods (BNR)
- virtual background
- audio output

stretch:
- content share
- audio level indicator in audio settings
- participants list
- chat
- password entry at the meeting start
- multistream

*/

const MeetingContext = createContext(null);
const MeetingDispatchContext = createContext(null);
const MeetingActionContext = createContext(null);

//eslint-disable-next-line no-unused-vars
export const MeetingProvider = ({
  children,
  user,
  webexConfig,
  mediaDevices,
  setAudioDeviceInput,
  setVideoDeviceInput,
  setAudioNoiseRemoval,
  setVirtualBackgroundMode,
  setVirtualBackgroundImage,
  setVirtualBackgroundVideo,
  ...props
}) => {
  const [webexClient, setWebexClient] = useState(null);
  const [meeting, setMeeting] = useState(null);
  const [addMediaOnceReady, setAddMediaOnceReady] = useState(false);

  const meetingReducer = (state, action) => {
    // console.log(
    //   `meetingContextReducer, state: ${JSON.stringify(
    //     state
    //   )}\naction: ${JSON.stringify(action)}`
    // );
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
      case actionTypes.SET_ALERT_ENTER_PASSWORD:
        return { ...state, alertEnterPassword: action.alertEnterPassword };
      case actionTypes.SET_ALERT_ENTER_CAPTCHA:
        return { ...state, alertEnterCaptcha: action.alertEnterCaptcha };
      case actionTypes.SET_MEETING_CAPTCHA:
        return { ...state, meetingCaptcha: action.meetingCaptcha };
      case actionTypes.SET_MEETING_JOIN:
        return {
          ...state,
          meetingJoin: { ...state.meetingJoin, ...action.meetingJoin },
        };
      case actionTypes.SET_CONTROL_PANEL:
        return { ...state, controlPanel: action.controlPanel };
      case actionTypes.SET_DTMF_PANEL:
        return {
          ...state,
          dtmfPanel: { ...state.dtmfPanel, ...action.dtmfPanel },
        };
      case actionTypes.GET_MEDIA_DEVICES_SUCCESS:
        return {
          ...state,
          localMedia: { ...state.localMedia, available: action.mediaDevices },
        };
      case actionTypes.GET_MEDIA_DEVICES_FAILED:
        return { ...state, localMedia: { ...state.localMedia, available: {} } };
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

  const setAlertEnterPassword = (alertEnterPassword) => {
    dispatch({
      type: actionTypes.SET_ALERT_ENTER_PASSWORD,
      alertEnterPassword,
    });
  };

  const setAlertEnterCaptcha = (alertEnterCaptcha) => {
    dispatch({ type: actionTypes.SET_ALERT_ENTER_CAPTCHA, alertEnterCaptcha });
  };

  const setMeetingCaptcha = (meetingCaptcha) => {
    dispatch({ type: actionTypes.SET_MEETING_CAPTCHA, meetingCaptcha });
  };

  const setMeetingJoin = (meetingJoin) => {
    dispatch({ type: actionTypes.SET_MEETING_JOIN, meetingJoin });
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

  // create meeting
  useEffect(() => {
    if (state.meetingJoin.number && state.meetingJoin.number !== "") {
      if (!webexClient) {
        console.error("Webex client not initialized");
        return;
      }

      webexClient.meetings
        .register()
        .then(() => {
          console.log("Meetings registered");
          // const meetingNum = meetingNumber.replaceAll(" ", "") + "@webex.com";
          const meetingNum = state.meetingJoin.number.replaceAll(" ", "");
          console.log(`Creating meeting client for: ${meetingNum}`);
          webexClient.meetings
            .create(meetingNum)
            .then((newMeeting) => {
              // should automatically recognize link or SIP URI MEETING_LINK

              try {
                const url = new URL(state.meetingJoin.number); //eslint-disable-line no-unused-vars
                console.log(
                  "Meeting number is a URL, we will not check for valid passwrord or captcha"
                );
                setMeetingJoin({ verified: true });
              } catch (_) {
                setMeetingJoin({ verified: false });
              }

              // register meeting event handlers
              newMeeting.on("all", meetingStatusHandler);
              newMeeting.members.on("all", memberStatusHandler);

              console.log("Meeting client created: ", newMeeting);
              setMeeting(newMeeting);
            })
            .catch((error) => {
              console.error(`Error creating the meeting: ${error}`);
            });
        })
        .catch((error) => {
          console.error(`Error registering meetings: ${error}`);
          return;
        });

      // start media streams - takes a while, but both are async
      startMicrophoneStream(mediaDevices.selected.audio_input);
      startCameraStream(
        mediaDevices.selected.video_input,
        mediaDevices.selected.video_quality
      );
    }
  }, [state.meetingJoin.number]); //eslint-disable-line react-hooks/exhaustive-deps

  // verify password or captcha
  useEffect(() => {
    if (meeting && !state.meetingJoin.verified) {
      console.log(
        `Verifying password: ${state.meetingJoin.password} and captcha: ${state.meetingJoin.captcha}`
      );
      try {
        meeting
          .verifyPassword(state.meetingJoin.password, state.meetingJoin.captcha)
          .then(({ isPasswordValid, requiredCaptcha, failureReason }) => {
            console.log(
              "Password verification result: ",
              isPasswordValid,
              requiredCaptcha,
              failureReason
            );
            if (failureReason === "WRONG_CAPTCHA") {
              setMeetingCaptcha(requiredCaptcha);
              setAlertEnterCaptcha(true);
              return;
            } else if (failureReason === "WRONG_PASSWORD") {
              setAlertEnterPassword(true);
              return;
            }
            setMeetingJoin({ verified: isPasswordValid });
          })
          .catch((error) => {
            if (error.name === "BadRequest") {
              console.log(
                "Verification failed, however looks like we are calling non Webex URI. Skipping verification."
              );
              setMeetingJoin({ verified: true });
            } else {
              console.error(
                `Error verifying password: ${JSON.stringify(error)}`
              );
            }
          });
      } catch (error) {
        console.error(`Error verifying password: ${JSON.stringify(error)}`);
      }
    }
  }, [meeting, state.meetingJoin.password, state.meetingJoin.captcha]); //eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (
      meeting &&
      state.meetingJoin.number &&
      state.meetingJoin.number !== "" &&
      state.meetingJoin.verified
    ) {
      console.log(`Joining meeting: ${state.meetingJoin.number}`);
      setMeetingStatus(MEETING_STATUSES.JOINING);

      const joinOptions = {
        enableMultistream: false, // Multistream is an experimental feature
        moderator: false,
        breakoutsSupported: false, // Enable breakout rooms in the meeting
        receiveTranscription: false,
        rejoin: true,
        locale: "cs_CZ", // audio disclaimer language
      };
      // newMeeting.joinWithMedia(meetingOptions);
      meeting
        .join(joinOptions)
        .then(() => {
          console.log("Join meeting request complete");
        })
        .catch((error) => {
          /*          if (error.name === "PasswordError") {
            setAlertEnterPassword(true);
          } else if (error.name === "CaptchaError") {
            setMeetingCaptcha(meeting.requiredCaptcha);
            setAlertEnterCaptcha(true);
          }*/
          console.error(`Error joining the meeting: ${JSON.stringify(error)}`);
        });
    }
  }, [state.meetingJoin, meeting]); //eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    console.log(
      `Meeting status changed: ${state.meetingStatus}, updating control panel`
    );
    switch (state.meetingStatus) {
      case MEETING_STATUSES.IN_MEETING:
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
  }, [state.meetingStatus, user.loggedIn]); //eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (meeting) {
      switch (state.meetingStatus) {
        case MEETING_STATUSES.ACTIVE:
          break;
        case MEETING_STATUSES.IN_MEETING:
          // addMediaToMeeting();
          setAddMediaOnceReady(true);
          break;
        case MEETING_STATUSES.INACTIVE:
          console.log("About to stop media streams");
          stopMicrophoneStream();
          stopCameraStream();
          break;
        default:
          console.log("No changes in meeting status for media devices");
      }
    }
  }, [state.meetingStatus]); //eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    console.log(
      "(Re)creating Webex cliebt due to access token change: ",
      webexConfig.accessToken
    );
    try {
      const newWebexClient = initWebex({
        credentials: {
          access_token: webexConfig.accessToken,
        },
      });
      console.log("Webex client created");
      setWebexClient(newWebexClient);
    } catch (error) {
      console.error(`Error creating webex client: ${error}`);
    }
  }, [webexConfig.accessToken]); //eslint-disable-line react-hooks/exhaustive-deps

  async function addAudioVideoToMeeting() {
    console.log("Existing meeting media: ", meeting?.currentMediaStatus);
    const camOption =
      state.localMedia.video && !meeting?.currentMediaStatus?.video
        ? { camera: state.localMedia.video }
        : null;
    const micOption =
      state.localMedia.audio && !meeting?.currentMediaStatus?.audio
        ? { microphone: state.localMedia.audio }
        : null;
    if (!camOption && !micOption) {
      console.log("No media to add to the meeting");
      return;
    }

    const mOptions = {
      localStreams: {
        ...camOption,
        ...micOption,
      },
      allowMediaInLobby: false,
    };
    console.log(
      "About to add media to the meeting: ",
      JSON.stringify(mOptions)
    );

    try {
      await meeting.addMedia(mOptions);
      console.log("Media added");
    } catch (error) {
      console.error(`Error adding media: ${error}`);
    }
  }

  useEffect(() => {
    if (addMediaOnceReady && state.localMedia.video && state.localMedia.audio) {
      addAudioVideoToMeeting();
      setAddMediaOnceReady(false);
    }
  }, [addMediaOnceReady, state.localMedia.video, state.localMedia.audio]); //eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    console.log("Local video source changed to ", state.localMedia.video);
    if (state.localMedia.video) {
      const vbg = mediaDevices.selected.virtual_background;
      console.log("Changing virtual background to: ", vbg);
      setVirtualBackground(vbg.mode, vbg.imageUrl, vbg.videoUrl);
    }
    if (
      state.localMedia.video
      // meeting?.hasMediaConnectionConnectedAtLeastOnce
      // state.meetingStatus === MEETING_STATUSES.IN_MEETING &&
    ) {
      if (meeting?.currentMediaStatus?.video) {
        // replace existing video stream in the meeting
        meeting.publishStreams({ camera: state.localMedia.video }).then(() => {
          console.log("Meeting camera stream published");
        });
      } else {
        if (state.meetingStatus === MEETING_STATUSES.IN_MEETING) {
          console.log("Adding camera stream to the meeting");
          // addAudioVideoToMeeting();
        }
      }
    }
  }, [state.localMedia.video]); //eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    console.log("Local audio source changed to ", state.localMedia.audio);
    if (state.localMedia.audio) {
      setNoiseRemoval(mediaDevices.selected.audio_noise_removal);
    }
    if (
      state.localMedia.audio
      // meeting?.hasMediaConnectionConnectedAtLeastOnce
      // state.meetingStatus === MEETING_STATUSES.IN_MEETING &&
    ) {
      if (meeting?.currentMediaStatus?.audio) {
        // replace existing audio stream in the meeting
        meeting
          .publishStreams({ microphone: state.localMedia.audio })
          .then(() => {
            console.log("Meeting microphone stream published");
          });
      } else {
        if (state.meetingStatus === MEETING_STATUSES.IN_MEETING) {
          console.log("Adding microphone stream to the meeting");
          // addAudioVideoToMeeting();
        }
      }
    }
  }, [state.localMedia.audio]); //eslint-disable-line react-hooks/exhaustive-deps

  // meeting state update
  const meetingStatusHandler = (event, payload) => {
    // the payload format is inconsistent, sometimes it is payload.payload, sometimes just payload
    // also the payload is not always an object
    const pload = payload ? payload.payload || payload : {};
    try {
      const ploadStr = JSON.stringify(pload);
      console.log(`Meeting event: ${event}, payload: ${ploadStr}`);
    } catch (error) {
      console.log(`Error stringifying payload: ${error}`);
      console.log(`Meeting event: ${event}`);
    }
    switch (event) {
      case "media:ready":
        console.log(`Media ready: ${pload.type}`);
        switch (pload.type) {
          case "remoteVideo":
            setRemoteMedia({ video: pload });
            break;
          case "remoteAudio":
            setRemoteMedia({ audio: pload });
            break;
          case "remoteShare":
            // meetingStreamsRemoteShare.srcObject = media.stream;
            break;
          default:
            console.log(`Unknown media type: ${pload.type}`);
            break;
        }
        break;
      // remove stream if media stopped
      case "media:stopped":
        console.log(`Media stopped: ${pload.type}`);
        switch (pload.type) {
          case "remoteVideo":
            stopCameraStream();
            setRemoteMedia({ video: null });
            setLocalMedia({ video: null });
            break;
          case "remoteAudio":
            stopMicrophoneStream();
            setRemoteMedia({ audio: null });
            setLocalMedia({ audio: null });
            break;
          case "remoteShare":
            setRemoteMedia({ share: null });
            break;
          default:
            console.log(`Unknown media type: ${pload.type}`);
            break;
        }
        break;

      case "meeting:stateChange":
        console.log(`Meeting state changed`); // ${JSON.stringify(state)}`);
        switch (pload.currentState) {
          case "ACTIVE":
            setMeetingStatus(MEETING_STATUSES.ACTIVE);
            break;
          case "INACTIVE":
            console.log("Meeting ended");
            setMeetingStatus(MEETING_STATUSES.INACTIVE);
            break;
          default:
            console.log("Meeting state changed to: " + pload.currentState);
        }
        break;
      case "meeting:self:lobbyWaiting":
        console.log("Meeting lobby waiting");
        setMeetingStatus(MEETING_STATUSES.IN_LOBBY);
        setOverlay({
          hidden: false,
          message: "Čekejte, prosím, na vstup do konference",
          canClose: false,
        });
        break;
      case "meeting:self:guestAdmitted":
        console.log("Meeting guest admitted");
        setMeetingStatus(MEETING_STATUSES.IN_MEETING);
        setOverlay({ hidden: true, message: "" });
        break;

      case "meeting:self:unmutedByOthers":
        console.log("I have been unmuted by others");
        setIsAudioMuted(false);
        break;

      case "meeting:self:mutedByOthers":
        console.log("I have been muted by others");
        setIsAudioMuted(true);
        break;
      case "meeting:self:requestedToUnmute":
        console.log("I have been requested to unmute");
        setOverlay({
          hidden: false,
          message: "Prosím, zapněte si mikrofon",
          canClose: true,
        });
        break;
      case "meeting:streamPublishStateChanged":
        console.log(
          `Stream ${pload.stream.label} ${
            pload.isPublished ? "" : "un"
          }published`
        );
        break;
      case "DESTROY_MEETING":
        unregisterMeetings();
        break;
      default:
        console.log(`Unknown meeting event: ${event}`);
        break;
    }
  };

  // meeting members update
  const memberStatusHandler = (event, payload) => {
    // the payload format is inconsistent, sometimes it is payload.payload, sometimes just payload
    // also the payload is not always an object
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
        if (pload.delta) {
          if (pload.delta.updated && pload.delta.updated.length > 0) {
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
                  // leaveMeeting();
                  // unregisterMeetings();
                }
              }
            }
          } else if (pload.delta.added && pload.delta.added.length > 0) {
            // the event of "members:update" with "added" and "isSelf" is probably the best way to detect that we are in the meeting and we can start sending/receiving media
            const added = pload.delta.added.filter(
              (member) => member.isSelf && member.isInMeeting
            );
            if (added.length > 0) {
              console.log("Self added to the meeting");
              setMeetingStatus(MEETING_STATUSES.IN_MEETING);
            }
          }
        }
        // setParticipants(payload.full);
        break;
      }
    }
  };

  const unregisterMeetings = () => {
    setAlertLeaveMeeting(false);
    setMeetingStatus(MEETING_STATUSES.INACTIVE);
    if (webexClient && webexClient.meetings.registered) {
      setTimeout(() => {
        console.log("Unregistering meetings...");
        webexClient.meetings.unregister().then(() => {
          console.log("Meetings unregistered");
          setMeeting(null);
          setMeetingJoin({
            number: "",
            password: "",
            captcha: "",
            verified: false,
          });
        }, 3000);
      });
    } else {
      console.log("Meetings not registered");
      setMeeting(null);
    }
  };

  const leaveMeeting = async () => {
    if (!meeting) {
      console.error("Meeting not found when trying to leave");
      return;
    }
    try {
      console.log("Leaving the meeting...");
      await meeting.leave();
      console.log("Meeting left");
      // unregisterMeetings();
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
    console.log(`Audio ${isAudioMuted ? "" : "un"}mute requested`);
    state.localMedia.audio.setMuted(isAudioMuted);
  };

  const setVideoMuted = (isVideoMuted) => {
    if (!meeting || !state.localMedia.video) {
      console.log("Meeting or camera stream not found");
      return;
    }
    console.log(`Video ${isVideoMuted ? "" : "un"}mute requested`);
    state.localMedia.video.setMuted(isVideoMuted);
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

  const getMediaDevices = () => {
    getDevices().then((devices) => {
      // console.log("All detected devices - ", devices);
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
      dispatch({
        type: actionTypes.GET_MEDIA_DEVICES_SUCCESS,
        mediaDevices: {
          audio_input: audioDevicesIn,
          audio_output: audioDevicesOut,
          video_input: videoDevices,
        },
      });
    });
  };

  const clearMediaDevices = () => {
    dispatch({
      type: actionTypes.GET_MEDIA_DEVICES_SUCCESS,
      mediaDevices: { audio_input: [], audio_output: [], video_input: [] },
    });
  };

  const stopMicrophoneStream = () => {
    try {
      if (state.localMedia.audio) {
        console.log("Stopping microphone stream...");
        state.localMedia.audio.stop();
        console.log(`Microphone stream ${state.localMedia.audio} stopped`);
        setLocalMedia({ audio: null });
      }
    } catch (error) {
      console.log(`Error stopping microphone stream: ${error}`);
    }
  };

  const startMicrophoneStream = async (deviceId = null) => {
    stopMicrophoneStream();
    let stream;
    const otherConstraints = {
      // sampleRate: { ideal: 24000 },
    };
    const constraints = {
      deviceId: deviceId ? { exact: deviceId } : undefined,
      ...otherConstraints,
    };
    try {
      stream = await createMicrophoneStream(constraints);
      console.log("Started microphone stream - ", stream);
      setLocalMedia({ audio: stream });
    } catch (err) {
      if (
        err.type === "CREATE_STREAM_FAILED" &&
        err.message.includes("OverconstrainedError")
      ) {
        console.log("Retrying to create microphone stream without deviceId");
        setAudioDeviceInput("");
        try {
          stream = await createMicrophoneStream(otherConstraints);
          console.log("Started microphone stream - ", stream);
          setLocalMedia({ audio: stream });
        } catch (err) {
          console.log("Error starting microphone stream - ", err);
          setLocalMedia({ audio: null });
        }
      } else {
        console.log("Error starting microphone stream - ", err);
        setLocalMedia({ audio: null });
      }
    }
  };

  const stopCameraStream = () => {
    try {
      if (state.localMedia.video) {
        console.log("Stopping camera stream...");
        state.localMedia.video.stop();
        console.log(`Camera stream ${state.localMedia.video} stopped`);
        if (meeting?.currentMediaStatus?.video) {
          meeting
            .unpublishStreams([state.localMedia.video])
            .then(() => {
              console.log("Camera stream unpublished from meeting");
            })
            .catch((error) => {
              console.error(`Error unpublishing camera stream: ${error}`);
            });
        }
        setLocalMedia({ video: null });
      }
    } catch (error) {
      console.error(`Error stopping camera stream: ${error}`);
    }
  };

  const startCameraStream = async (deviceId = null, quality = "720p") => {
    stopCameraStream();
    let stream;
    const baseVideoConstraints =
      state.localMedia.videoConstraints[localVideoQuality[quality]];
    const constraints = {
      ...baseVideoConstraints, // 720p
      deviceId: deviceId ? { exact: deviceId } : undefined,
    };
    try {
      console.log("Creating camera stream with constraints - ", constraints);
      stream = await createCameraStream(constraints);
      console.log("Created camera stream - ", stream);
      setLocalMedia({ video: stream });
    } catch (err) {
      if (
        err.type === "CREATE_STREAM_FAILED" &&
        err.message.includes("OverconstrainedError")
      ) {
        console.log("Retrying to create camera stream without deviceId");
        setVideoDeviceInput("");
        try {
          stream = await createCameraStream(baseVideoConstraints);
          console.log("Created camera stream - ", stream);
          setLocalMedia({ video: stream });
        } catch (err) {
          console.error("Error creating camera stream - ", err);
          setLocalMedia({ video: null });
        }
      } else {
        console.error("Error creating camera stream - ", err);
        setLocalMedia({ video: null });
      }
    }
  };

  const setNoiseRemoval = async (enable) => {
    let effect;
    try {
      effect = await state.localMedia.audio.getEffectByKind(
        "noise-reduction-effect"
      );
      if (enable) {
        if (!effect?.isEnabled) {
          console.log("Applying BNR to local microphone stream...");

          if (!effect) {
            effect = await webexClient.meetings.createNoiseReductionEffect();
            await state.localMedia.audio.addEffect(effect);
            console.log("BNR effect created");
          }

          await effect.enable();
          console.log("Successfully applied BNR to local microphone stream");
          setAudioNoiseRemoval(enable);
        }
      } else {
        if (effect?.isEnabled) {
          console.log("Disabling BNR from local microphone stream");

          await effect.disable();
          console.log("Successfully disabled BNR from local microphone stream");
          setAudioNoiseRemoval(enable);
        }
      }
    } catch (error) {
      console.log("Error applying noise reduction effect!", error);
    }
  };

  const setVirtualBackground = async (mode, imageUrl, videoUrl) => {
    let effect;
    try {
      effect = await state.localMedia.video.getEffectByKind(
        "virtual-background-effect"
      );

      if (mode === "NONE") {
        if (effect?.isEnabled) {
          console.log("Disabling virtual background from local camera stream");

          await effect.disable();
          console.log(
            "Successfully disabled virtual background from local camera stream"
          );
          setVirtualBackgroundMode("NONE");
        }
        return;
      } else {
        console.log("Applying virtual background to local camera stream");

        effect = await webexClient.meetings.createVirtualBackgroundEffect({
          mode: mode,
          bgImageUrl: imageUrl,
          bgVideoUrl: videoUrl,
        });
        await state.localMedia.video.addEffect(effect);

        await effect.enable();
        console.log(
          "Successfully applied virtual background to local camera stream"
        );
        setVirtualBackgroundMode(mode);
        setVirtualBackgroundImage(imageUrl);
        setVirtualBackgroundVideo(videoUrl);
      }
    } catch (error) {
      console.log("Error applying background effect!", error);
    }
  };

  return (
    <MeetingContext.Provider value={state}>
      <MeetingDispatchContext.Provider value={dispatch}>
        <MeetingActionContext.Provider
          value={{
            leaveMeeting,
            setHandRaised,
            setAudioMuted,
            setVideoMuted,
            sendDTMF,
            getMediaDevices,
            clearMediaDevices,
            startMicrophoneStream,
            stopMicrophoneStream,
            startCameraStream,
            stopCameraStream,
            setNoiseRemoval,
            setVirtualBackground,
            setMeetingJoin,
            setMeetingCaptcha,
            localVideoQualityOptions,
            vbgModes,
            webexClient,
          }}
        >
          {children}
        </MeetingActionContext.Provider>
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
const localVideoQualityOptions = Object.keys(localVideoQuality);

const localVideoConstraints = {
  [localVideoQuality["360p"]]: { width: 640, height: 360 },
  [localVideoQuality["480p"]]: { width: 640, height: 480 },
  [localVideoQuality["720p"]]: { width: 1280, height: 720 },
  [localVideoQuality["1080p"]]: { width: 1920, height: 1080 },
};

const vbgModes = {
  NONE: "Nic",
  BLUR: "Rozmazání",
  IMAGE: "Obrázek",
  VIDEO: "Video",
};

const initialState = {
  isHandRaised: false,
  isAudioMuted: false,
  isVideoMuted: false,
  isUnmuteAllowed: true,
  meetingStatus: MEETING_STATUSES.INACTIVE,
  alertLeaveMeeting: false,
  alertEnterPassword: false,
  alertEnterCaptcha: false,
  meetingJoin: {
    number: "",
    password: "",
    captcha: "",
    verified: false,
  },
  meetingCaptcha: {},
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
    share: {
      audio: null,
      video: null,
    },
    videoConstraints: localVideoConstraints,
    available: {
      audio_input: [],
      audio_output: [],
      video_input: [],
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
export const useMeetingAction = () => useContext(MeetingActionContext);

MeetingProvider.propTypes = {
  children: propTypes.node.isRequired,
  user: propTypes.object.isRequired,
  webexConfig: propTypes.object.isRequired,
  mediaDevices: propTypes.object.isRequired,
  setAudioDeviceInput: propTypes.func.isRequired,
  setVideoDeviceInput: propTypes.func.isRequired,
  setAudioNoiseRemoval: propTypes.func.isRequired,
  setVirtualBackgroundMode: propTypes.func.isRequired,
  setVirtualBackgroundImage: propTypes.func.isRequired,
  setVirtualBackgroundVideo: propTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
    webexConfig: state.webex,
    mediaDevices: state.mediaDevices,
  };
};

const mapDispatchToProps = {
  setAudioDeviceInput,
  setVideoDeviceInput,
  setAudioNoiseRemoval,
  setVirtualBackgroundMode,
  setVirtualBackgroundImage,
  setVirtualBackgroundVideo,
};

export default connect(mapStateToProps, mapDispatchToProps)(MeetingProvider);
