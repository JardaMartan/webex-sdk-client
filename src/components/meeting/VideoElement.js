import React, { useEffect, useRef, useState } from "react";
import { Box, Container, Paper } from "@mui/material";
import { styled } from "@mui/system";
import { useMeeting } from "../meetingcontext/MeetingContext";
import { MicOffOutlined, MicOutlined } from "@mui/icons-material";
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
  const borderRadius = 1;
  const speakingColor = green["A200"];
  const mutedColor = red["A200"];
  const titleBackground = `rgba(0, 0, 0, 0.6)`;
  const fontSize = 12;

  const videoElement = useRef(videoPane.paneId);
  const [videoAspectRatio, setVideoAspectRatio] = useState(1);
  const videoBoxMaxSize = maxHeight;
  const contextState = useMeeting();
  const Div = styled("div")(({ theme }) => ({
    // backgroundColor: `rgba(${theme.vars.palette.primary.mainChannel} / 0.2)`,
    // backgroundColor: `rgba(0, 0, 0, 0.6)`,
    backgroundColor: "transparent",
  }));
  const [activeSpeaker, setActiveSpeaker] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  useEffect(() => {
    if (videoPane?.stream && videoElement) {
      console.log(
        `Video pane dimensions: ${videoPane.width} x ${
          videoPane.height
        }, box dimensions: ${
          videoBoxMaxSize * videoAspectRatio
        } x ${videoBoxMaxSize}`
      );
      videoElement.current.srcObject = videoPane.stream;
      videoElement.current.addEventListener("resize", () => {
        const width = videoElement.current.videoWidth;
        const height = videoElement.current.videoHeight;
        const aspectRatio = width / height;
        setVideoAspectRatio(aspectRatio);
        // if (aspectRatio > 0 && onDimensionsChange) {
        //   onDimensionsChange(aspectRatio);
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
        }
      });
    }
  }, [videoPane.media, videoPane.stream, videoElement]); //eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    console.log(`Video aspect ratio changed: ${videoAspectRatio}`);
    if (videoAspectRatio > 0 && onAspectRatioChange) {
      onAspectRatioChange(videoAspectRatio);
    }
  }, [videoAspectRatio]); //eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    console.log(
      `Video element dimensions: ${videoElement.videoWidth} x ${videoElement.videoHeight}`
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
    } catch (error) {
      console.log(`Error getting member for video pane ${videoPane.memberId}`);
    }
  }, [contextState.members]); //eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box
      className={
        "grid-item" + (videoPane.height > 0) &&
        videoPane.width / videoPane.height > 1
          ? " grid-item--width2"
          : ""
      }
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
          width: 1,
          height: 1,
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
          <Div sx={{ width: 1 }}>
            <Box
              color="white"
              variant="soft"
              className="video-name"
              sx={{
                // width: 1,
                bottom: 3,
                left: 3,
                zindex: 5,
                borderRadius: borderRadius,
                fontSize: fontSize,
                position: "absolute",
                justifyContent: "flex-start",
                backgroundColor: titleBackground,
              }}
            >
              {activeSpeaker ? (
                <MicOutlined
                  sx={{ fontSize: fontSize, color: speakingColor }}
                />
              ) : (
                ""
              )}
              {isAudioMuted ? (
                <MicOffOutlined
                  sx={{ fontSize: fontSize, color: mutedColor }}
                />
              ) : (
                ""
              )}
              &nbsp;
              {videoPane.name}
            </Box>
            <Box
              sx={{
                color: speakingColor, //"secondary.main",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                position: "absolute",
                justifyContent: "flex-start",
                borderRadius: borderRadius,
                border: activeSpeaker ? borderSize : "none",
                zindex: activeSpeaker ? 10 : 0,
              }}
            ></Box>
          </Div>
        </Container>
      </Paper>
    </Box>
  );
};

export default VideoElement;
