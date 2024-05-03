import React from "react";
import { Box, ButtonGroup, IconButton } from "@mui/joy";
import {
  Mic,
  MicOff,
  MicRounded, //eslint-disable-line no-unused-vars
  MicOffRounded, //eslint-disable-line no-unused-vars
  Videocam,
  VideocamOff,
  BackHand,
  Close,
  Dialpad,
} from "@mui/icons-material";
import {
  useMeeting,
  useMeetingAction,
  useMeetingDispatch,
} from "../meetingcontext/MeetingContext";
import { MEETING_STATUSES } from "../../constants/meeting";
import * as actionTypes from "../meetingcontext/MeetingContextActionTypes";

const MeetingControls = () => {
  const buttonSides = 48;
  const contextState = useMeeting();
  const dispatch = useMeetingDispatch();
  const { setHandRaised, setAudioMuted, setVideoMuted } = useMeetingAction();

  return (
    <Box
      visibility={
        contextState.meetingStatus !== MEETING_STATUSES.IN_MEETING
          ? "hidden"
          : "visible"
      }
      // my={2}
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
      <ButtonGroup spacing="0.5rem" variant="soft" sx={{ border: "4px" }}>
        <IconButton
          disabled={!contextState.isUnmuteAllowed && contextState.isAudioMuted}
          color={contextState.isAudioMuted ? "danger" : "primary"}
          onClick={() => {
            setAudioMuted(!contextState.isAudioMuted);
          }}
          sx={{ width: buttonSides, height: buttonSides }}
        >
          {/* Audio {isAudioMuted ? "Zap." : "Vyp."} */}
          {contextState.isAudioMuted ? (
            <MicOff fontSize="large" />
          ) : (
            <Mic fontSize="large" />
          )}
        </IconButton>
        <IconButton
          color={contextState.isVideoMuted ? "danger" : "primary"}
          onClick={() => {
            setVideoMuted(!contextState.isVideoMuted);
          }}
          sx={{ width: buttonSides, height: buttonSides }}
        >
          {/* Video {isVideoMuted ? "Zap." : "Vyp."} */}
          {contextState.isVideoMuted ? (
            <VideocamOff fontSize="large" />
          ) : (
            <Videocam fontSize="large" />
          )}
        </IconButton>
        <IconButton
          color={contextState.isHandRaised ? "danger" : "primary"}
          onClick={() => {
            setHandRaised(!contextState.isHandRaised);
          }}
          sx={{ width: buttonSides, height: buttonSides }}
        >
          <BackHand fontSize="large" />
        </IconButton>
        <IconButton
          color="primary"
          onClick={() => {
            dispatch({
              type: actionTypes.SET_DTMF_PANEL,
              dtmfPanel: { hidden: !contextState.dtmfPanel.hidden },
            });
          }}
          sx={{ width: buttonSides, height: buttonSides }}
        >
          <Dialpad fontSize="large" />
        </IconButton>
        <IconButton
          color="danger"
          onClick={() =>
            dispatch({
              type: actionTypes.SET_ALERT_LEAVE_MEETING,
              alertLeaveMeeting: true,
            })
          }
          sx={{ width: buttonSides, height: buttonSides }}
        >
          <Close fontSize="large" />
        </IconButton>
      </ButtonGroup>
    </Box>
  );
};

MeetingControls.propTypes = {};

export default MeetingControls;
