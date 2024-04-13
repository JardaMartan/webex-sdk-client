import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
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
} from "@mui/icons-material";

const MeetingControlsRedux = ({
  hidden = false,
  isAudioMuted,
  isVideoMuted,
  isUnmuteAllowed,
  isHandRaised,
  controlPanelCallback,
}) => {
  const buttonSides = 48;
  const fontSize = "";

  const toggleAudio = () => {
    controlPanelCallback("toggleAudio");
  };

  const toggleVideo = () => {
    controlPanelCallback("toggleVideo");
  };

  const toggleRaiseHand = () => {
    controlPanelCallback("toggleRaiseHand");
  };

  const leaveMeeting = () => {
    controlPanelCallback("leaveMeeting");
  };

  return (
    <Box
      visibility={hidden ? "hidden" : "visible"}
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
          disabled={!isUnmuteAllowed && isAudioMuted}
          color={isAudioMuted ? "danger" : "primary"}
          onClick={toggleAudio}
          sx={{ width: buttonSides, height: buttonSides }}
        >
          {/* Audio {isAudioMuted ? "Zap." : "Vyp."} */}
          {isAudioMuted ? (
            <MicOff fontSize={fontSize} />
          ) : (
            <Mic fontSize={fontSize} />
          )}
        </IconButton>
        <IconButton
          color={isVideoMuted ? "danger" : "primary"}
          onClick={toggleVideo}
          sx={{ width: buttonSides, height: buttonSides }}
        >
          {/* Video {isVideoMuted ? "Zap." : "Vyp."} */}
          {isVideoMuted ? (
            <VideocamOff fontSize={fontSize} />
          ) : (
            <Videocam fontSize={fontSize} />
          )}
        </IconButton>
        <IconButton
          color={isHandRaised ? "danger" : "primary"}
          onClick={toggleRaiseHand}
          sx={{ width: buttonSides, height: buttonSides }}
        >
          <BackHand fontSize={fontSize} />
        </IconButton>
        <IconButton
          color="danger"
          onClick={leaveMeeting}
          sx={{ width: buttonSides, height: buttonSides }}
        >
          <Close fontSize={fontSize} />
        </IconButton>
      </ButtonGroup>
    </Box>
  );
};

MeetingControlsRedux.propTypes = {
  hidden: PropTypes.bool,
  isAudioMuted: PropTypes.bool.isRequired,
  isUnmuteAllowed: PropTypes.bool.isRequired,
  isVideoMuted: PropTypes.bool.isRequired,
  isHandRaised: PropTypes.bool.isRequired,
  controlPanelCallback: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  isAudioMuted: state.app.controlPanel.data.isAudioMuted || false,
  isUnmuteAllowed: state.app.controlPanel.data.isUnmuteAllowed || false,
  isVideoMuted: state.app.controlPanel.data.isVideoMuted || false,
  isHandRaised: state.app.controlPanel.data.isHandRaised || false,
  controlPanelCallback:
    state.app.controlPanel.callback ||
    (() => {
      console.log("MeetingControls default callback clicked");
    }),
});

export default connect(mapStateToProps)(MeetingControlsRedux);
