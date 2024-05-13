import React, { useRef, useEffect } from "react";
import { Box, Paper, Container } from "@mui/material";

const ShareElement = ({ stream, width, height }) => {
  const remoteShareRef = useRef("remoteShare");

  useEffect(() => {
    if (stream && remoteShareRef.current) {
      remoteShareRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <Box
      id="shareBox"
      width={width}
      height={height}
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
  );
};

export default ShareElement;
