import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Box, Container, Paper } from "@mui/material";
import RemoteVideoOverlay from "./RemoteVideoOverlay";
import { MEETING_STATUSES } from "../../constants/meeting";
import { useMeeting } from "../meetingcontext/MeetingContext";
// import Draggable from "react-draggable";
import { setSelfViewPosition } from "../../redux/actions/viewActions";
import SelfView from "./SelfView";

const MeetingVideoViewNormal = ({ selfView, setSelfViewPosition }) => {
  const remoteVideoRef = useRef("remoteVideo");
  const localVideoRef = useRef("localVideo");
  const remoteShareRef = useRef("remoteShare");
  const [videoViewHeight, setVideoViewHeight] = useState(720);
  const contextState = useMeeting();

  /**
   * Set local video stream to the local video (selfview) element
   */
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

  /**
   * Set remote video stream to the remote video element
   */
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

  /**
   * Set remote share stream to the remote share element
   */
  useEffect(() => {
    try {
      if (MEETING_STATUSES.IN_MEETING === contextState.meetingStatus) {
        if (contextState.isRemoteShareActive) {
          //(remoteShareRef.current.srcObject == null) {
          if (contextState.remoteMedia.share) {
            console.log("Setting remote share");
            remoteShareRef.current.srcObject =
              contextState.remoteMedia.share.stream;
            setVideoViewHeight(180);
          } else {
            console.warn(
              "Remote share identified as active, however stream is not available"
            );
          }
        } else {
          // if (remoteShareRef.current.srcObject != null) {
          setVideoViewHeight(720);
          console.log("Unsetting remote share");
          try {
            remoteShareRef.current.srcObject = null;
          } catch (error) {
            console.log(`Error unsetting remote share: ${error}`);
          }
        }
      }
    } catch (error) {
      console.log(`Error setting remote share: ${error}`);
    }
  }, [
    contextState.remoteMedia.share,
    contextState.isRemoteShareActive,
    contextState.meetingStatus,
  ]);

  useEffect(() => {
    remoteVideoRef.current.addEventListener("resize", (e) => {
      console.log("Remote video resized: ", e);
      const newWidth = remoteVideoRef.videoWidth;
      const newHeight = remoteVideoRef.videoHeight;
      // const newAspectRatio = newWidth / newHeight;
      console.log(`Video dimensions changed to: ${newWidth}x${newHeight}`);
    });
  }, []);

  return (
    <Box
      my={2}
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        // flexGrow: 1,
        flexFlow: "column",
        height: 1,
        // display: "grid",
        // gridTemplateColumns: "repeat(1, minmax(80px, 1fr))",
        // gap: 1,
      }}
    >
      <Box
        visibility={
          contextState.meetingStatus !== MEETING_STATUSES.INACTIVE &&
          contextState.meetingStatus !== MEETING_STATUSES.JOINING
            ? "visible"
            : "hidden"
        }
        id="meetingStreams"
        // my={2}
        display="flex"
        alignItems="center"
        // gap={4}
        sx={{
          width: 1280,
          height: videoViewHeight,
          // display: "grid",
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
              // width="auto"
              // height="auto"
              id="remoteVideo"
              ref={remoteVideoRef}
              autoPlay
              playsInline
            />
          </Container>
        </Paper>
        <RemoteVideoOverlay />
      </Box>
      {/* Selfview */}
      {contextState.meetingStatus === MEETING_STATUSES.IN_MEETING &&
        contextState.selfVideoPane && (
          <SelfView selfVideoPane={contextState.selfVideoPane} />
        )}
      {contextState.meetingStatus !== MEETING_STATUSES.INACTIVE &&
        contextState.meetingStatus !== MEETING_STATUSES.JOINING &&
        contextState.isRemoteShareActive && (
          <Box
            id="shareBox"
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
                  id="remoteShare"
                  ref={remoteShareRef}
                  autoPlay
                  playsInline
                />
              </Container>
            </Paper>
          </Box>
        )}
    </Box>
  );
};

MeetingVideoViewNormal.propTypes = {
  selfView: PropTypes.object.isRequired,
  setSelfViewPosition: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    selfView: state?.view?.selfView || { position: { x: 0, y: 0 } },
  };
}

const mapDispatchToProps = {
  setSelfViewPosition,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MeetingVideoViewNormal);
