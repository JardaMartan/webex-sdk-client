import React from "react";
import PropTypes from "prop-types";
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

const MeetingControls = ({
  hidden = false,
  isAudioMuted,
  isUnmuteAllowed,
  isVideoMuted,
  isHandRaised,
  toggleAudio,
  toggleVideo,
  toggleRaiseHand,
  leaveMeeting,
}) => {
  const buttonSides = 64;

  return (
    <Box
      visibility={hidden ? "hidden" : "visible"}
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
      <ButtonGroup spacing="0.5rem" variant="soft" sx={{ border: "4px" }}>
        <IconButton
          disabled={!isUnmuteAllowed && isAudioMuted}
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
        <IconButton
          color="danger"
          onClick={leaveMeeting}
          sx={{ width: buttonSides, height: buttonSides }}
        >
          <Close fontSize="large" />
        </IconButton>
      </ButtonGroup>
    </Box>
  );
};

MeetingControls.propTypes = {
  hidden: PropTypes.bool,
  isAudioMuted: PropTypes.bool.isRequired,
  isUnmuteAllowed: PropTypes.bool.isRequired,
  isVideoMuted: PropTypes.bool.isRequired,
  isHandRaised: PropTypes.bool.isRequired,
  toggleAudio: PropTypes.func.isRequired,
  toggleVideo: PropTypes.func.isRequired,
  toggleRaiseHand: PropTypes.func.isRequired,
  leaveMeeting: PropTypes.func.isRequired,
};

export default MeetingControls;
