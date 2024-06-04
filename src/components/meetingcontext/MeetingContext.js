import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  useRef,
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
import { setSelfView, updateSelfView } from "../../redux/actions/viewActions";

/* TODO:
- 24kHz problem of AirPods (BNR)
  see: https://www.npmjs.com/package/@webex/web-media-effects#supported-bitrates

- handle cancel of password/captcha modals - should leave the meeting or add an option to re-open the modals?
- participants list
- chat
- raise/lower hand using DTMF (configurable in settings) if meeting is not Webex
- RemoteVideoOverlay in multistream mode

stretch:
- audio level indicator in audio settings
- audio output test in audio settings
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
  settings,
  selfView,
  setAudioDeviceInput,
  setVideoDeviceInput,
  setAudioNoiseRemoval,
  setVirtualBackgroundMode,
  setVirtualBackgroundImage,
  setVirtualBackgroundVideo,
  setSelfView,
  updateSelfView,
  ...props
}) => {
  const [webexClient, setWebexClient] = useState(null);
  const [meeting, setMeeting] = useState();
  const meetingRef = useRef(meeting);
  const [addMediaOnceReady, setAddMediaOnceReady] = useState(false);

  /**
   * make sure we have the latest meeting object in the ref - used by createVideoPane()
   */
  useEffect(() => {
    meetingRef.current = meeting;
  }, [meeting]);

  /**
   * context reducer and a couple of helper functions
   */
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
      case actionTypes.SET_REMOTE_SHARE_ACTIVE:
        return { ...state, isRemoteShareActive: action.isRemoteShareActive };
      case actionTypes.SET_IS_MULTISTREAM:
        return { ...state, isMultistream: action.isMultistream };
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
      case actionTypes.SET_MULTISTREAM_VIDEO:
        const newMultistreamVideo = {
          ...(state.multistreamVideo ? state.multistreamVideo : {}),
          ...action.multistreamVideo,
        };
        return {
          ...state,
          multistreamVideo: newMultistreamVideo,
        };
      case actionTypes.SET_MULTISTREAM_VIDEO_GROUP:
        return {
          ...state,
          multistreamVideo: {
            ...(state.multistreamVideo ? state.multistreamVideo : {}),
            [action.groupId]: action.videoPanes,
          },
        };
      case actionTypes.SET_MULTISTREAM_VIDEO_PANE:
        const newPane = {
          ...(state.multistreamVideo
            ? state.multistreamVideo[action.groupId][action.videoPane.paneId]
            : {}),
          ...action.videoPane,
        };
        const newGrp = {
          ...(state.multistreamVideo
            ? state.multistreamVideo[action.groupId]
            : {}),
          ...newPane,
        };
        return {
          ...state,
          multistreamVideo: {
            ...(state.multistreamVideo ? state.multistreamVideo : {}),
            [action.groupId]: newGrp,
          },
        };
      case actionTypes.SET_SELF_VIDEO_PANE:
        return {
          ...state,
          selfVideoPane: action.selfVideoPane,
        };
      case actionTypes.CLEAR_MULTISTREAM_VIDEO:
        return { ...state, multistreamVideo: null };
      case actionTypes.SET_ACTIVE_SPEAKERS:
        return { ...state, activeSpeakers: action.activeSpeakers };
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
      case actionTypes.SET_VIEW_PORT:
        return {
          ...state,
          viewPort: { ...state.viewPort, ...action.viewPort },
        };
      case actionTypes.SET_MEMBERS:
        return {
          ...state,
          members: action.members,
        };
      case actionTypes.ADD_MEMBERS:
      case actionTypes.UPDATE_MEMBERS:
        return {
          ...state,
          members: { ...state.members, ...action.members },
        };
      case actionTypes.REMOVE_MEMBERS:
        const newMembers = { ...state.members };
        action.members.forEach((member) => {
          delete newMembers[member.id];
        });
        return {
          ...state,
          members: newMembers,
        };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(meetingReducer, initialState);

  const setIsAudioMuted = (isAudioMuted) => {
    dispatch({ type: actionTypes.SET_AUDIO_MUTED, isAudioMuted });
    updateSelfView({ audioMuted: isAudioMuted });
  };

  const setOverlay = (overlay) => {
    dispatch({ type: actionTypes.SET_OVERLAY, overlay });
  };

  const setIsHandRaised = (isHandRaised) => {
    dispatch({ type: actionTypes.SET_HAND_RAISED, isHandRaised });
  };

  const setIsVideoMuted = (isVideoMuted) => {
    dispatch({ type: actionTypes.SET_VIDEO_MUTED, isVideoMuted });
    updateSelfView({ videoMuted: isVideoMuted });
  };

  const setIsUnmuteAllowed = (isUnmuteAllowed) => {
    dispatch({ type: actionTypes.SET_UNMUTE_ALLOWED, isUnmuteAllowed });
  };

  const setIsMultistream = (isMultistream) => {
    dispatch({ type: actionTypes.SET_IS_MULTISTREAM, isMultistream });
  };

  const setRemoteShareActive = (isRemoteShareActive) => {
    dispatch({
      type: actionTypes.SET_REMOTE_SHARE_ACTIVE,
      isRemoteShareActive,
    });
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

  //eslint-disable-next-line no-unused-vars
  const setMultistreamVideo = (multistreamVideo) => {
    dispatch({ type: actionTypes.SET_MULTISTREAM_VIDEO, multistreamVideo });
  };

  const setMultistreamVideoGroup = (groupId, videoPanes) => {
    dispatch({
      type: actionTypes.SET_MULTISTREAM_VIDEO_GROUP,
      groupId,
      videoPanes,
    });
  };

  const setMultistreamVideoPane = (groupId, videoPane) => {
    dispatch({
      type: actionTypes.SET_MULTISTREAM_VIDEO_PANE,
      groupId,
      videoPane,
    });
  };

  const setSelfVideoPane = (selfVideoPane) => {
    dispatch({ type: actionTypes.SET_SELF_VIDEO_PANE, selfVideoPane });
  };

  const clearMultistreamVideo = () => {
    dispatch({ type: actionTypes.CLEAR_MULTISTREAM_VIDEO });
  };

  const setActiveSpeakers = (activeSpeakers) => {
    dispatch({ type: actionTypes.SET_ACTIVE_SPEAKERS, activeSpeakers });
  };

  const setControlPanel = (controlPanel) => {
    dispatch({ type: actionTypes.SET_CONTROL_PANEL, controlPanel });
  };

  const setViewPort = (viewPort) => {
    dispatch({ type: actionTypes.SET_VIEW_PORT, viewPort });
  };

  function reduceArray(array, key) {
    if (Array.isArray(array) && array.length > 0 && key in array[0]) {
      return array.reduce((obj, item) => {
        obj[item[key]] = item;
        return obj;
      }, {});
    } else {
      return array;
    }
  }

  const setMembers = (members) => {
    console.log(`Setting members: ${JSON.stringify(members)}`);
    dispatch({ type: actionTypes.SET_MEMBERS, members });
  };

  const updateMembers = (members) => {
    console.log(`Updating members: ${JSON.stringify(members)}`);
    const newMembers = reduceArray(members, "id");
    dispatch({ type: actionTypes.UPDATE_MEMBERS, members: newMembers });
  };

  const addMembers = (members) => {
    console.log(`Adding members: ${JSON.stringify(members)}`);
    const newMembers = reduceArray(members, "id");
    dispatch({ type: actionTypes.ADD_MEMBERS, members: newMembers });
  };

  //eslint-disable-next-line no-unused-vars
  const removeMembers = (members) => {
    console.log(`Removing members: ${JSON.stringify(members)}`);
    const newMembers = reduceArray(members, "id");
    dispatch({ type: actionTypes.REMOVE_MEMBERS, members: newMembers });
  };

  /**
   * From here on is the main logic of the MeetingProvider.
   * The meeting join is split into several steps, each in a separate useEffect. This allows to split the control logic and the UI.
   * UI should just update the context state and the useEffects will act upon the changes. All UI components can be stateless
   * and just react to the context state changes. All UI components should be nested under the MeetingContextProvider hierarchy.
   *
   * STEP 1: create Webex client - requires a valid webex access token (stored in Redux state)
   *
   * STEP 2: create meeting - acts upon a meeting number entered by the user (stored in the context state),
   * in this step we also start the microphone and camera streams
   *
   * STEP 3: verify password or captcha - if the meeting requires a password or captcha, we verify it here.
   * non-Webex SIP URIs are treated as verified
   *
   * STEP 4: join the meeting - if the verification in STEP 3 passes, we join it
   *
   * in-meeting events are handled by meetingStatusHandler() and memberStatusHandler().
   * This includes media streams, meeting state changes, and member updates.
   *
   * Leaving the meeting intiated by user is handled by leaveMeeting(), otherwise it's handled by meetingStatusHandler().
   *
   * After the meeting ends, the unregisterMeetings() is called to clean up.
   * The media should be stopped by the meetingStatusHandler().
   *
   * The media streams are handled by startMicrophoneStream(), stopMicrophoneStream(), startCameraStream(), stopCameraStream().
   * Media stream effects can be added on the fly during the meeting.
   */
  // STEP 1: create Webex client
  useEffect(() => {
    console.log(
      "(Re)creating Webex client due to access token change: ",
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

  // STEP 2: create meeting
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

      // start media streams - takes a while, but both are async so they don't block the meeting join process
      startMicrophoneStream(mediaDevices.selected.audio_input);
      startCameraStream(
        mediaDevices.selected.video_input,
        mediaDevices.selected.video_quality
      );
    }
  }, [state.meetingJoin.number]); //eslint-disable-line react-hooks/exhaustive-deps

  // STEP 3: verify password or captcha
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
            console.error(`Error verifying password: ${JSON.stringify(error)}`);
            console.log(
              "Verification failed, however let's be optimistic. Skipping verification."
            );
            setMeetingJoin({ verified: true });
          });
      } catch (error) {
        console.error(`Error verifying password: ${JSON.stringify(error)}`);
      }
    }
  }, [meeting, state.meetingJoin.password, state.meetingJoin.captcha]); //eslint-disable-line react-hooks/exhaustive-deps

  // STEP 4: join the meeting
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
        enableMultistream: settings.multistream, // Multistream is an experimental feature
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
          if (meeting.isMultistream) {
            console.log("Multistream is enabled");
          }
          setIsMultistream(meeting.isMultistream);
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

  // update UI based on the meeting status
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
        if (selfView?.audioMuted ? selfView.audioMuted : false) {
          setAudioMuted(true);
        }
        if (selfView?.videoMuted ? selfView.videoMuted : false) {
          setVideoMuted(true);
        }
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

  // act upon meeting status changes
  useEffect(() => {
    if (meeting) {
      switch (state.meetingStatus) {
        case MEETING_STATUSES.ACTIVE:
          break;
        case MEETING_STATUSES.IN_MEETING:
          // media streams creation and meeting join happen in parallel,
          // meeting.addMedia() can only be called once and needs to be called after the media streams are ready
          // and meeting is joined
          setAddMediaOnceReady(true);
          break;
        case MEETING_STATUSES.INACTIVE:
          // sanity check for media streams, probably not needed, but doesn't hurt
          console.log("About to stop media streams");
          stopMicrophoneStream();
          stopCameraStream();
          stopScreenShare();
          break;
        default:
          console.log("No changes in meeting status for media devices");
      }
    }
  }, [state.meetingStatus]); //eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Add local media (audio/video) to the meeting. addMedia() should be called only once during the meeting,
   * the subsequent media changes are handled by publishStreams().
   */
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
        receiveVideo: true,
        receiveAudio: true,
        receiveShare: true,
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

  /**
   * Add local media (audio/video) to the meeting. Make sure the media streams are ready before calling this function,
   * because meeting join, audio and video streams initialization happen in parallel.
   */
  useEffect(() => {
    if (addMediaOnceReady && state.localMedia.video && state.localMedia.audio) {
      addAudioVideoToMeeting();
      setAddMediaOnceReady(false);
    }
  }, [addMediaOnceReady, state.localMedia.video, state.localMedia.audio]); //eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Re-publish video streams to the meeting when the media devices change.
   */
  useEffect(() => {
    console.log("Local video source changed to ", state.localMedia.video);
    // add video effects to the stream
    if (state.localMedia.video) {
      const vbg = mediaDevices.selected.virtual_background;
      console.log("Changing virtual background to: ", vbg);
      setVirtualBackground(vbg.mode, vbg.imageUrl, vbg.videoUrl);
    }
    // publish media stream to the meeting if there is one already active
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
      }
    }
    if (state.localMedia.video && meeting?.members?.selfId) {
      console.log("Creating selfview video pane");
      const selfVideoPane = createVideoPane(
        state.localMedia.video,
        state.localMedia.video.outputStream,
        state.localMedia.video.outputStream.id,
        "live",
        meeting.members.selfId,
        "self",
        "initialization"
      );
      setSelfVideoPane(selfVideoPane);
      if (state.isMultistream) {
        console.log("Adding selfview to multistream video panels");
        setMultistreamVideoGroup("self", {
          [state.localMedia.video.id]: selfVideoPane,
        });
      }
    }
  }, [state.localMedia.video, state.isMultistream, meeting?.members?.selfId]); //eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Re-publish audio streams to the meeting when the media devices change.
   */
  useEffect(() => {
    console.log("Local audio source changed to ", state.localMedia.audio);
    // set noise removal
    if (state.localMedia.audio) {
      setNoiseRemoval(mediaDevices.selected.audio_noise_removal);
    }
    // publish media stream to the meeting if there is one already active
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
      }
    }
  }, [state.localMedia.audio]); //eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Re-publish screen share streams to the meeting when the sharing source change.
   */
  useEffect(() => {
    console.log("Local share source changed to ", state.localMedia.share);
    // publish media stream to the meeting if there is one already active
    if (state.localMedia.share.video) {
      state.localMedia.share.video.on("stream-ended", () => {
        console.log("Local share video stream ended");

        setLocalMedia({ share: { video: undefined } });
      });

      publishScreenShare();
    } else {
      unpublishScreenShare();
    }
  }, [state.localMedia.share.video]); //eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Re-publish screen share audio to the meeting when the sharing source change.
   */
  useEffect(() => {
    console.log("Local share source changed to ", state.localMedia.share);
    // publish media stream to the meeting if there is one already active
    if (state.localMedia.share.audio) {
      state.localMedia.share.audio?.on("stream-ended", () => {
        console.log("Local share audio stream ended");

        setLocalMedia({ share: { audio: undefined } });
      });
    }
  }, [state.localMedia.share.audio]); //eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Watch the screen area for dimensions change. This area is used by meeting video and content share.
   * The dimensions are used to calculate the video and share layout. It's essential in multistream mode
   * as there are many independent video elements to arrange on the screen.
   */
  useEffect(() => {
    function updateSize() {
      // Get the viewport dimensions
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Consider any fixed elements on the page
      const headerHeight = document.querySelector("header")?.offsetHeight || 0;
      const footerHeight = document.querySelector("footer")?.offsetHeight || 0;
      const sidebarWidth = document.querySelector("aside")?.offsetWidth || 0;

      // Calculate the free area
      const freeWidth = viewportWidth - sidebarWidth;
      const freeHeight = viewportHeight - (headerHeight + footerHeight);

      console.log(`Viewport size: ${freeWidth} x ${freeHeight}`);
      setViewPort({
        screen: {
          width: freeWidth,
          height: freeHeight,
        },
      });
    }

    // Update size initially and on every window resize
    updateSize();
    window.addEventListener("resize", updateSize);

    // Clean up the event listener when the component unmounts
    return () => window.removeEventListener("resize", updateSize);
  }, []); //eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Set the screen area sizes for video and content share.
   * Set the "videoFactor" to the desired ratio of video to content share area.
   */
  useEffect(() => {
    if (state.viewPort.screen.width > 0 && state.viewPort.screen.height > 0) {
      const videoFactor = 0.25;
      const newViewPort = {
        video: {
          width: state.viewPort.screen.width,
          height: state.isRemoteShareActive
            ? Math.floor(state.viewPort.screen.height * videoFactor)
            : state.viewPort.screen.height,
        },
        share: {
          width: state.isRemoteShareActive ? state.viewPort.screen.width : 0,
          height: state.isRemoteShareActive
            ? Math.floor(state.viewPort.screen.height * (1 - videoFactor))
            : 0,
        },
      };
      console.log(`New viewport size: ${JSON.stringify(newViewPort)}`);
      setViewPort(newViewPort);
    }
  }, [state.isRemoteShareActive, state.viewPort.screen]); //eslint-disable-line react-hooks/exhaustive-deps

  // meeting state update
  const meetingStatusHandler = (event, payload) => {
    // the payload format is inconsistent, sometimes it is "payload.payload", sometimes just "payload"
    // also the payload is not always an object and JSON.stringify() can fail
    const pload = payload ? payload.payload || payload : {};
    try {
      const ploadString = JSON.stringify(pload);
      console.log(`Meeting event: ${event}, payload: ${ploadString}`);
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
            setRemoteMedia({ share: pload });
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
            clearMultistreamVideo();
            stopCameraStream();
            break;
          case "remoteAudio":
            stopMicrophoneStream();
            setRemoteMedia({ audio: null });
            stopMicrophoneStream();
            break;
          case "remoteShare":
            setRemoteMedia({ share: null });
            break;
          default:
            console.log(`Unknown media type: ${pload.type}`);
            break;
        }
        break;
      case "meeting:startedSharingRemote":
        console.log(`Remote sharing started`);
        setRemoteShareActive(true);
        break;
      case "meeting:stoppedSharingRemote":
        console.log(`Remote sharing stopped`);
        setRemoteShareActive(false);
        break;
      case "meeting:stoppedSharingLocal":
        console.log(`Local sharing stopped`);
        break;

      // multistream events start - events below are related only to multistream mode

      // layout change event provides remote media streams in groups ("main", "thumbnails")
      // "screenShareVideo" is provided only with some layouts, specifically "ScreenShareView".
      // Possible layouts are: "AllEqual", "ScreenShareView", "OnePlusFive", "OnePlusFive", "Stage"
      // layout change can be requested by calling meeting.remoteMediaManager.setLayout()
      case "media:remoteVideo:layoutChanged":
        const {
          layoutId,
          activeSpeakerVideoPanes,
          memberVideoPanes,
          screenShareVideo,
        } = pload;
        console.warn(
          `Remote video layout changed:\nlayoutId: ${layoutId}\nmemberVideoPanes: ${JSON.stringify(
            memberVideoPanes
          )}\nscreenShareVideo: ${JSON.stringify(screenShareVideo)}`
        );
        for (const [groupId, group] of Object.entries(
          activeSpeakerVideoPanes
        )) {
          // console.log(`Group ${groupId}:`);
          const groupMediaStreams = {};
          group.getRemoteMedia().forEach((remoteMedia, index) => {
            // console.warn(`  index ${index}: ${JSON.stringify(remoteMedia)}`);
            const newVideoPane = createVideoPane(
              remoteMedia,
              remoteMedia.stream,
              remoteMedia.id,
              remoteMedia.sourceState,
              remoteMedia.memberId,
              `${groupId}.${index} ${remoteMedia.id}`,
              "initialization"
            );
            remoteMedia.on("sourceUpdate", (data) => {
              const updatedVideoPane = createVideoPane(
                remoteMedia,
                remoteMedia.stream,
                remoteMedia.id,
                data.state,
                data.memberId,
                `${groupId}.${index} ${remoteMedia.id}`,
                "update"
              );
              setMultistreamVideoPane(groupId, {
                [remoteMedia.id]: updatedVideoPane,
              });
            });
            groupMediaStreams[remoteMedia.id] = newVideoPane;
          });
          setMultistreamVideoGroup(groupId, groupMediaStreams);
        }
        if (screenShareVideo) {
          const newSharePane = createVideoPane(
            screenShareVideo,
            screenShareVideo.stream,
            screenShareVideo.id,
            screenShareVideo.sourceState,
            screenShareVideo.memberId,
            `screenShare ${screenShareVideo.id}`,
            "initialization"
          );
          screenShareVideo.on("sourceUpdate", (data) => {
            const updatedSharePane = createVideoPane(
              screenShareVideo,
              screenShareVideo.stream,
              screenShareVideo.id,
              data.state,
              data.memberId,
              `screenShare ${screenShareVideo.id}`,
              "update"
            );
            setMultistreamVideoPane("share", {
              [screenShareVideo.id]: updatedSharePane,
            });
          });
          setMultistreamVideoGroup("share", {
            [screenShareVideo.id]: newSharePane,
          });
        }
        break;
      case "media:remoteAudio:created":
        console.log(`Remote audio stream created: ${JSON.stringify(pload)}`);
        break;
      case "media:remoteScreenShareAudio:created":
        console.log(
          `Remote screen share audio stream created: ${JSON.stringify(pload)}`
        );
        break;
      case "media:remoteVideoSourceCountChanged":
        console.log(
          `Remote video source count changed ${JSON.stringify(pload)}`
        );
        break;
      case "media:remoteAudioSourceCountChanged":
        console.log(
          `Remote audio source count changed ${JSON.stringify(pload)}`
        );
        break;
      case "media:activeSpeakerChanged":
        console.log(`Active speaker changed: ${JSON.stringify(pload)}`);
        setActiveSpeakers(pload.memberIds);
        break;
      // end multistream events

      case "meeting:stateChange":
        console.log(`Meeting state changed to: ${pload.currentState}`); // ${JSON.stringify(state)}`);
        switch (pload.currentState) {
          case "ACTIVE":
            setMeetingStatus(MEETING_STATUSES.ACTIVE);
            break;
          case "INACTIVE":
            setMeetingStatus(MEETING_STATUSES.INACTIVE);
            break;
          default:
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
          `Stream ${pload} ${pload.isPublished ? "" : "un"}published`
        );
        break;
      case "DESTROY_MEETING":
        // meeting was ended by a remote party
        unregisterMeetings();
        break;
      default:
        console.log(`Unknown meeting event: ${event}`);
        break;
    }
  };

  // just for logging
  useEffect(() => {
    console.log(`Viewport changed: ${JSON.stringify(state.viewPort)}`);
  }, [state.viewPort]);

  /**
   * Multistream requires a layout request from the client side.
   * This is specifically needed when there is a remote sharing: the default layout (typically "AllEqual")
   * doesn't include the remote share stream. So the "ScreenShareView" needs to be requested. Then the new event
   * of "media:remoteVideo:layoutChanged" is triggered in which the "screenShareVideo" contains the remote
   * screen share stream.
   *
   * In other words: the remote screen share is processed this way:
   * 1. "meeting:startedSharingRemote" event arrives, the "state.isRemoteShareActive" is set to true
   * 2. the layout "ScreenShareView" is requested to include the remote share stream
   * 3. "media:remoteVideo:layoutChanged" event arrives and the media streams ("share" and "thumbnails") are added
   * to the available video panes
   *
   * Note that in remote sharing mode, the participants' video streams may not be in the "main" group, instead they are
   * in the "thumbnails" group in lower resolution to conserve bandwidth.
   */
  useEffect(() => {
    if (meeting?.isMultistream) {
      const layout = meeting.remoteMediaManager?.getLayoutId();
      if (state.isRemoteShareActive) {
        console.log(
          `Current remote sharing layout: ${layout}, requesting screen share layout`
        );
        meeting.remoteMediaManager?.setLayout("ScreenShareView");
      } else {
        console.log(
          `Current remote sharing layout: ${layout}, requesting all equal layout`
        );
        meeting.remoteMediaManager?.setLayout("AllEqual");
      }
    }
  }, [state.isRemoteShareActive, meeting?.remoteMediaManager]); //eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Derived from https://github.com/webex/webex-js-sdk/blob/3132b517eeb146217e8f52824fbb93276cd7af90/docs/samples/browser-plugin-meetings/app.js#L2281
   * Create a video pane object for the multistream video layout. Original updateVideoPane() mixes the logic and the UI,
   * this function is just for creating the video pane object. UI is handled separately in MeetingVideoViewMultistream.js.
   *
   * @param {RemoteMedia} media - media object provided by the meeting
   * @param {MediaStream} stream - media stream object which can be attached to <video> element
   * @param {string} paneId - unique ID of the video pane
   * @param {string} sourceState - "live" or "no source"
   * @param {string} memberId - member ID associated to the video source
   * @param {string} title - title of the video pane
   * @param {string} debugString - debug string for logging
   * @returns Object
   */
  const createVideoPane = (
    media,
    stream,
    paneId,
    sourceState,
    memberId,
    title,
    debugString
  ) => {
    const videoPane = {
      media: media,
      stream: stream,
      paneId: paneId,
      width: 0,
      height: 0,
    };
    videoPane.debugText = title;
    videoPane.sourceState = sourceState;

    if (sourceState === "no source") {
      videoPane.isActive = false;
      videoPane.isLive = false;
      videoPane.name = "";
      videoPane.memberId = undefined;
      console.log(
        `createVideoPane() :: ${debugString} ${sourceState} ${title}`
      );
    } else {
      videoPane.isActive = true;

      try {
        videoPane.name =
          meetingRef.current.members.membersCollection.get(memberId).name;
      } catch (error) {
        videoPane.name = title;
      }

      videoPane.memberId = memberId;

      videoPane.isLive = sourceState === "live";

      console.warn(
        `createVideoPane() :: ${debugString} "${sourceState}" "${videoPane.name}" ${title} `
      );
    }

    return videoPane;
  };

  // meeting members update
  // the payload can contain 3 objects: added, delta, full
  const memberStatusHandler = (event, payload) => {
    // the payload format is inconsistent, sometimes it is payload.payload, sometimes just payload
    // also the payload is not always an object
    const pload = payload ? payload.payload || payload : {};
    try {
      const ploadString = JSON.stringify(pload);
      console.log(`Meeting event: ${event}, payload: ${ploadString}`);
    } catch (error) {
      console.log(`Error stringifying payload: ${error}`);
      console.log(`Meeting event: ${event}`);
    }
    // eslint-disable-next-line default-case
    switch (event) {
      case "members:update": {
        if (pload.delta) {
          if (
            pload.delta.removed &&
            pload.delta.removed.length === 0 &&
            pload.delta.updated &&
            pload.delta.updated.length === 0 &&
            pload.delta.added &&
            pload.delta.added.length === 0
          ) {
            console.log("No updates, performing full sync of members");
            setMembers(pload.full);
          } else {
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
              updateMembers(pload.delta.updated);
            } else if (pload.delta.added && pload.delta.added.length > 0) {
              // the event of "members:update" with "added" and "isSelf" is probably the best way to detect that we are in the meeting and we can start sending/receiving media
              const added = pload.delta.added.filter(
                (member) => member.isSelf && member.isInMeeting
              );
              if (added.length > 0) {
                console.log("Self added to the meeting");
                setMeetingStatus(MEETING_STATUSES.IN_MEETING);
              }
              addMembers(pload.delta.added);
            }
          }
        } else {
          console.log("Full sync of members");
          setMembers(pload.full);
        }
        break;
      }
    }
  };

  /**
   * Cleanup after the meeting ends. Sometimes there is a INVALID_STATE_ERROR error related to socket communication.
   */
  const unregisterMeetings = () => {
    setAlertLeaveMeeting(false);
    setMeetingStatus(MEETING_STATUSES.INACTIVE);
    if (webexClient && webexClient.meetings.registered) {
      setTimeout(() => {
        console.log("Unregistering meetings...");
        webexClient.meetings.unregister().then(() => {
          console.log("Meetings unregistered");
          setMeeting(undefined);
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
      setMeeting(undefined);
    }
  };

  /**
   * Leave meeting initiated by the user
   * @returns {Promise<void>}
   */
  const leaveMeeting = async () => {
    if (!meeting) {
      console.error("Meeting not found when trying to leave");
      return;
    }
    try {
      console.log("Leaving the meeting...");
      await meeting.leave();
      console.log("Meeting left");
      unregisterMeetings();
    } catch (error) {
      console.error(`Error leaving meeting: ${error}`);
    }
  };

  // following functions can be called directly on the meeting object, they may get removed in the future
  /**
   * Raise hand
   * @param {boolean} isHandRaised
   */
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

  /**
   * Mute audio
   * @param {boolean} isAudioMuted
   */
  const setAudioMuted = (isAudioMuted) => {
    if (!meeting || !state.localMedia.audio) {
      console.log("Meeting or microphone stream not found");
      return;
    }
    console.log(`Audio ${isAudioMuted ? "" : "un"}mute requested`);
    state.localMedia.audio.setMuted(isAudioMuted);
    console.log(`Saving audio muted state: ${isAudioMuted}`);
    updateSelfView({ audioMuted: isAudioMuted });
  };

  /**
   * Mute video
   * @param {boolean} isVideoMuted
   */
  const setVideoMuted = (isVideoMuted) => {
    if (!meeting || !state.localMedia.video) {
      console.log("Meeting or camera stream not found");
      return;
    }
    console.log(`Video ${isVideoMuted ? "" : "un"}mute requested`);
    state.localMedia.video.setMuted(isVideoMuted);
    // console.log(`Saving video muted state: ${isVideoMuted}`);
    // updateSelfView({ videoMuted: isVideoMuted });
  };

  /**
   * Send DTMF
   * @param {string} digit
   */
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

  /**
   * Get available media devices. Used by SettingsDialog to select audio/video input and audio output.
   */
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

  /**
   * Clear media devices from the context state. Can be used to make sure the device list is up to date.
   */
  const clearMediaDevices = () => {
    dispatch({
      type: actionTypes.GET_MEDIA_DEVICES_SUCCESS,
      mediaDevices: { audio_input: [], audio_output: [], video_input: [] },
    });
  };

  /**
   * Stop microphone stream
   */
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

  /**
   * Start microphone stream from a device. If no deviceId is provided or the requested device is not available,
   * the default device is used.
   * @param {string} deviceId
   */
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

  /**
   * Stop camera stream
   */
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

  /**
   * Start camera stream from a device. If no deviceId is provided or the requested device is not available,
   * the default device is used.
   * @param {string} deviceId
   * @param {string} quality
   */
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

  /**
   * (De)activate noise removal effect on the microphone stream.
   * @param {boolean} enable
   */
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

  /**
   * Activate virtual background effect on the camera stream.
   * @param {string} mode ("NONE, "BLUR", "IMAGE", "VIDEO) - see vbgModes
   * @param {string} imageUrl
   * @param {string} videoUrl
   * @returns
   */
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
      console.error("Error applying background effect!", error);
    }
  };

  /**
   * Start screen share stream
   */
  async function startScreenShare() {
    // Using async/await to make code more readable
    console.log("Starting screen share...");
    try {
      //TODO: Add audio share toggle in sample app
      const [localShareVideoStream, localShareAudioStream] =
        await webexClient.meetings.mediaHelpers.createDisplayStreamWithAudio();

      setLocalMedia({
        share: {
          video: localShareVideoStream,
          audio: localShareAudioStream,
        },
      });
    } catch (error) {
      console.error("Error starting screen share: ", error);
    }
  }

  /**
   * Publish screen share stream to the meeting
   */
  async function publishScreenShare() {
    if (!state.localMedia.share || !state.localMedia.share.video) {
      console.error("Screen share stream not available!");

      throw new Error("screen share stream not available");
    }

    try {
      console.log("Publishing share stream...");
      await meeting.publishStreams({
        screenShare: {
          video: state.localMedia.share.video,
          audio: state.localMedia.share.audio,
        },
      });

      console.log("Successfully started sharing in meeting!");
    } catch (error) {
      console.error("Error starting screen share in meeting!", error);
    }
  }

  /**
   * Unpublish screen share stream from the meeting
   */
  async function unpublishScreenShare() {
    console.log("Unpublishing share stream...");
    try {
      const streamsToUnpublish = [];

      if (state.localMedia.share.audio) {
        streamsToUnpublish.push(state.localMedia.share.audio);
      }
      if (state.localMedia.share.video) {
        streamsToUnpublish.push(state.localMedia.share.video);
      }

      if (streamsToUnpublish.length) {
        await meeting.unpublishStreams(streamsToUnpublish);
      }

      console.log("Unpublished share stream!");
    } catch (error) {
      console.error("Error unpublishing share stream: ", error);
    }
  }

  /**
   * Stop screen share stream
   */
  async function stopScreenShare() {
    console.log("Stopping screen share...");
    try {
      if (state.localMedia.share.audio) {
        state.localMedia.share.audio?.stop();
      }
      if (state.localMedia.share.video) {
        state.localMedia.share.video?.stop();
      }

      setLocalMedia({ share: { audio: undefined, video: undefined } });

      console.log("Successfully stopped sharing!");
    } catch (error) {
      console.error("Error stopping screen share: ", error);
    }
  }

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
            setAlertLeaveMeeting,
            setAlertEnterPassword,
            setAlertEnterCaptcha,
            startScreenShare,
            stopScreenShare,
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

// video resolutions used to setup the local video stream
// selection should affect the network bandwidth utilization
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

// virtual background modes
const vbgModes = {
  NONE: "Nic",
  BLUR: "Rozmazání",
  IMAGE: "Obrázek",
  VIDEO: "Video",
};

// initial value for "state" variable
const initialState = {
  isHandRaised: false,
  isAudioMuted: false,
  isVideoMuted: false,
  isUnmuteAllowed: true,
  isRemoteShareActive: false,
  isMultistream: false,
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
  selfVideoPane: null,
  remoteMedia: {
    audio: null,
    video: null,
    share: null,
  },
  // groupId with members, e.g. {"main": {member1Id: member1Obj, member2Id: member2Obj}}
  multistreamVideo: null,
  controlPanel: {
    name: "none",
    component: <></>,
  },
  viewPort: {
    screen: {
      width: 0,
      height: 0,
    },
    video: {
      width: 0,
      height: 0,
    },
    share: {
      width: 0,
      height: 0,
    },
  },
  activeSpeakers: [],
};

export const useMeeting = () => useContext(MeetingContext);
export const useMeetingDispatch = () => useContext(MeetingDispatchContext);
export const useMeetingAction = () => useContext(MeetingActionContext);

MeetingProvider.propTypes = {
  children: propTypes.node.isRequired,
  user: propTypes.object.isRequired,
  webexConfig: propTypes.object.isRequired,
  mediaDevices: propTypes.object.isRequired,
  settings: propTypes.object.isRequired,
  selfView: propTypes.object.isRequired,
  setAudioDeviceInput: propTypes.func.isRequired,
  setVideoDeviceInput: propTypes.func.isRequired,
  setAudioNoiseRemoval: propTypes.func.isRequired,
  setVirtualBackgroundMode: propTypes.func.isRequired,
  setVirtualBackgroundImage: propTypes.func.isRequired,
  setVirtualBackgroundVideo: propTypes.func.isRequired,
  setSelfView: propTypes.func.isRequired,
  updateSelfView: propTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
    webexConfig: state.webex,
    mediaDevices: state.mediaDevices,
    settings: state.settings,
    selfView: state?.view?.selfView || {
      isAudioMuted: false,
      isVideoMuted: false,
    },
  };
};

const mapDispatchToProps = {
  setAudioDeviceInput,
  setVideoDeviceInput,
  setAudioNoiseRemoval,
  setVirtualBackgroundMode,
  setVirtualBackgroundImage,
  setVirtualBackgroundVideo,
  setSelfView,
  updateSelfView,
};

export default connect(mapStateToProps, mapDispatchToProps)(MeetingProvider);
