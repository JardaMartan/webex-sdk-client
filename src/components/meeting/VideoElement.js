import React, { useEffect, useRef, useState } from "react";
import { Box, Container, Paper } from "@mui/material";
import { useMeeting } from "../meetingcontext/MeetingContext";
import {
  MicOffOutlined,
  MicOutlined,
  PresentToAllOutlined,
} from "@mui/icons-material";
import { red, green } from "@mui/material/colors";

const VideoElement = ({
  videoPane,
  maxHeight = 720,
  width = 1920,
  onAspectRatioChange,
}) => {
  // view settings
  const marginSize = 0;
  const borderSize = 2;
  const borderRadius = 1.6;
  const nameBorderRadius = 1;
  const shadowSize = 10;
  const speakingColor = green["A200"];
  const mutedColor = red["A200"];
  const titleBackground = `rgba(0, 0, 0, 0.6)`;
  const fontSize = 12;
  const iconSize = 16;
  const padding = 6;

  const videoElement = useRef(videoPane.paneId);
  const [videoAspectRatio, setVideoAspectRatio] = useState(1);
  const [shouldArrange, setShouldArrange] = useState(false);
  const videoBoxMaxSize = maxHeight;
  const contextState = useMeeting();
  const [activeSpeaker, setActiveSpeaker] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isContentSharing, setIsContentSharing] = useState(false);

  useEffect(
    () => {
      if (
        videoPane?.stream &&
        videoElement &&
        videoPane.isLive &&
        videoPane.isActive
      ) {
        console.log(
          `Video pane dimensions: ${videoPane.width} x ${
            videoPane.height
          }, box dimensions: ${
            videoBoxMaxSize * videoAspectRatio
          } x ${videoBoxMaxSize}`
        );
        videoElement.current.srcObject = videoPane.stream;
        videoElement.current.addEventListener("resize", () => {
          if (!videoElement.current) return; // avoid conflict at unmount

          const width = videoElement.current.videoWidth;
          const height = videoElement.current.videoHeight;
          const aspectRatio = width / height;
          setVideoAspectRatio(aspectRatio);
          // if (aspectRatio > 0 && onAspectRatioChange) {
          //   onAspectRatioChange(aspectRatio);
          // }
          console.log(
            `Video dimensions updated:  ${width} x ${height}, ratio: ${aspectRatio}`
          );
          if (videoPane.width !== width || videoPane.height !== height) {
            console.log(
              `Updating video pane ${videoPane.paneId} dimensions from ${videoPane.width}x${videoPane.height} to ${width}x${height} (aspect ratio: ${aspectRatio})`
            );
            videoPane.width = width;
            videoPane.height = height;
            setShouldArrange(true);
          }
        });
      }
    },
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [
      videoPane.media,
      videoPane?.stream,
      videoPane.isLive,
      videoPane.isActive,
      videoElement,
    ]
  );

  useEffect(() => {
    console.log(`Video aspect ratio changed: ${videoAspectRatio}`);
    if (videoAspectRatio > 0 && onAspectRatioChange) {
      onAspectRatioChange(videoAspectRatio);
    }
  }, [videoAspectRatio]); //eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    console.log(`Should arrange video panes: ${shouldArrange}`);
    if (shouldArrange && onAspectRatioChange) {
      onAspectRatioChange(videoAspectRatio);
      setShouldArrange(false);
    }
  }, [shouldArrange]); //eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    console.log(
      `Video element dimensions: ${videoElement.current.videoWidth} x ${videoElement.current.videoHeight}`
    );
  }, [videoElement]); //eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!contextState.activeSpeakers) {
      setActiveSpeaker(false);
      return;
    }

    if (contextState.activeSpeakers.includes(videoPane.memberId)) {
      setActiveSpeaker(true);
    } else {
      setActiveSpeaker(false);
    }
  }, [contextState.activeSpeakers]); //eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    try {
      const member = contextState.members[videoPane.memberId];
      setIsAudioMuted(member.isAudioMuted);
      setIsContentSharing(member.isContentSharing);
    } catch (error) {
      console.log(`Error getting member for video pane ${videoPane.memberId}`);
    }
  }, [contextState.members]); //eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box
      // className="grid-item"
      className={`grid-item ${
        videoPane.height > 0 && videoPane.width / videoPane.height > 1
          ? " grid-item--width2"
          : ""
      }`}
      visibility={videoPane.height > 0 ? "visible" : "hidden"}
      id={`videobox-${videoPane.paneId}`}
      //   width={width}
      width={videoBoxMaxSize * videoAspectRatio - 10 * marginSize}
      height={videoBoxMaxSize - 10 * marginSize}
      //   objecFit="contain"
      // my={2}
      display="flex"
      alignItems="center"
      // gap={4}
      sx={{
        // display: "grid",
        // gridTemplateColumns: "repeat(1, minmax(80px, 1fr))",
        // gap: 1,
        // mx: "auto",
        // position: "relative",
        margin: marginSize,
      }}
    >
      <Paper
        display="flex"
        sx={{
          // width: 1,
          // height: 1,
          left: padding * videoAspectRatio,
          right: padding * videoAspectRatio,
          top: padding,
          bottom: padding,
          position: "absolute",
          overflow: "hidden",
          borderRadius: borderRadius,
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
            id={videoPane.paneId}
            ref={videoElement}
            width="100%"
            height="100%"
            // objecFit="contain"
            // maxWidth="100%"
            // maxHeight="100%"
            autoPlay
            playsInline
            title={videoPane.name}
          />
          <Box
            color="white"
            variant="soft"
            className="video-name"
            sx={{
              // width: 1,
              bottom: 4,
              left: 4,
              zindex: 5,
              borderRadius: nameBorderRadius,
              fontSize: fontSize,
              position: "absolute",
              justifyContent: "flex-start",
              backgroundColor: titleBackground,
            }}
          >
            {activeSpeaker ? (
              <MicOutlined sx={{ fontSize: iconSize, color: speakingColor }} />
            ) : (
              ""
            )}
            {isAudioMuted ? (
              <MicOffOutlined sx={{ fontSize: iconSize, color: mutedColor }} />
            ) : (
              ""
            )}
            &nbsp;
            {videoPane.name}
            &nbsp;
            {isContentSharing ? (
              <PresentToAllOutlined
                sx={{ fontSize: iconSize, color: "white" }}
              />
            ) : (
              ""
            )}
          </Box>
        </Container>
      </Paper>
      <Box
        sx={{
          color: speakingColor, //"secondary.main",
          left: padding * videoAspectRatio,
          right: padding * videoAspectRatio,
          top: padding,
          bottom: padding,
          position: "absolute",
          justifyContent: "flex-start",
          borderRadius: borderRadius,
          border: activeSpeaker && borderSize,
          boxShadow: activeSpeaker && `0 0 ${shadowSize}px ${speakingColor}`,
          zindex: 10, //activeSpeaker ? 10 : 0,
        }}
      ></Box>
    </Box>
  );
};

export default VideoElement;
