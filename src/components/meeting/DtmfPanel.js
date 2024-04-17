import React from "react";
import { Button, ButtonGroup, Input, Stack, Box } from "@mui/joy";

import { useMeeting, useMeetingAction } from "./MeetingContext";

const DtmfPanel = () => {
  const contextState = useMeeting();
  const { sendDTMF } = useMeetingAction();

  const updateInput = (event) => {
    const input = event.target.value;
    sendDTMF(input);
  };

  return (
    !contextState.dtmfPanel.hidden && (
      <Stack
        direction="column"
        spacing={2}
        sx={{ fontSize: "128px" }}
        onChange={updateInput}
      >
        <Input
          variant="outlined"
          placeholder=""
          value={contextState.dtmfPanel.input}
          onChange={updateInput}
          disabled={true}
        />
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <ButtonGroup spacing={2}>
            {["1", "2", "3"].map((key) => (
              <Button key={key} onClick={() => sendDTMF(key)}>
                {key}
              </Button>
            ))}
          </ButtonGroup>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <ButtonGroup spacing={2}>
            {["4", "5", "6"].map((key) => (
              <Button key={key} onClick={() => sendDTMF(key)}>
                {key}
              </Button>
            ))}
          </ButtonGroup>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <ButtonGroup spacing={2}>
            {["7", "8", "9"].map((key) => (
              <Button key={key} onClick={() => sendDTMF(key)}>
                {key}
              </Button>
            ))}
          </ButtonGroup>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <ButtonGroup spacing={2}>
            {["*", "0", "#"].map((key) => (
              <Button key={key} onClick={() => sendDTMF(key)}>
                {key}
              </Button>
            ))}
          </ButtonGroup>
        </Box>
      </Stack>
    )
  );
};

export default DtmfPanel;
