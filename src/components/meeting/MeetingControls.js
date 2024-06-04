import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Box, ButtonGroup, IconButton, Tooltip } from "@mui/joy";
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
  PresentToAll,
  CancelPresentation,
  Person,
  PersonOff,
} from "@mui/icons-material";
import {
  useMeeting,
  useMeetingAction,
  useMeetingDispatch,
} from "../meetingcontext/MeetingContext";
import { MEETING_STATUSES } from "../../constants/meeting";
import * as actionTypes from "../meetingcontext/MeetingContextActionTypes";
import {
  updateSelfView,
  setSelfViewPosition,
} from "../../redux/actions/viewActions";

const MeetingControls = ({ selfView, updateSelfView, setSelfViewPosition }) => {
  const buttonSides = 48;
  const contextState = useMeeting();
  const dispatch = useMeetingDispatch();
  const {
    setHandRaised,
    setAudioMuted,
    setVideoMuted,
    startScreenShare,
    stopScreenShare,
  } = useMeetingAction();

  const isScreenShare = contextState.localMedia.share.video;
  let selfViewVisible = true;
  if (selfView.visible !== undefined) {
    selfViewVisible = selfView.visible;
  }

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
        <Tooltip title="Ztlumení mikrofonu">
          <IconButton
            disabled={
              !contextState.isUnmuteAllowed && contextState.isAudioMuted
            }
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
        </Tooltip>
        <Tooltip title="Vypnutí kamery">
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
        </Tooltip>
        <Tooltip title="Přihlášení o slovo">
          <IconButton
            color={contextState.isHandRaised ? "danger" : "primary"}
            onClick={() => {
              setHandRaised(!contextState.isHandRaised);
            }}
            sx={{ width: buttonSides, height: buttonSides }}
          >
            <BackHand fontSize="large" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Sdílení obrazovky nebo aplikace">
          <IconButton
            color={isScreenShare ? "danger" : "primary"}
            onClick={() => {
              if (isScreenShare) {
                stopScreenShare();
              } else {
                startScreenShare();
              }
            }}
            sx={{ width: buttonSides, height: buttonSides }}
          >
            {isScreenShare ? (
              <CancelPresentation fontSize="large" />
            ) : (
              <PresentToAll fontSize="large" />
            )}
          </IconButton>
        </Tooltip>
        <Tooltip title="Klávesnice pro tónovou volbu">
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
        </Tooltip>
        <Tooltip title="Vlastní zobrazení">
          <IconButton
            color={selfViewVisible ? "primary" : "danger"}
            onClick={() => {
              updateSelfView({ visible: !selfViewVisible });
              if (selfViewVisible) {
                setSelfViewPosition({ x: 0, y: 0 });
              }
            }}
            sx={{ width: buttonSides, height: buttonSides }}
          >
            {selfView.visible ? (
              <Person fontSize="large" />
            ) : (
              <PersonOff fontSize="large" />
            )}
          </IconButton>
        </Tooltip>
        <Tooltip title="Opustit konferenci">
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
        </Tooltip>
      </ButtonGroup>
    </Box>
  );
};

MeetingControls.propTypes = {
  selfView: PropTypes.object,
  updateSelfView: PropTypes.func.isRequired,
  setSelfViewPosition: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    selfView: state?.view?.selfView || {
      visible: true,
      position: { x: 0, y: 0 },
    },
  };
}

const mapDispatchToProps = {
  updateSelfView,
  setSelfViewPosition,
};

export default connect(mapStateToProps, mapDispatchToProps)(MeetingControls);
