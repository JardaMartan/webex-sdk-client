import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Box, Grid, Input, Button, CircularProgress } from "@mui/joy";
import { MEETING_STATUSES } from "../../constants/meeting";

const MeetingIdForm = ({ meetingAction, buttonText, meetingStatus }) => {
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [meetingNumber, setMeetingNumber] = useState("");

  const handleMeetingNumberChange = (event) => {
    setMeetingNumber(event.target.value);
  };

  useEffect(() => {
    setButtonDisabled(meetingNumber.trim().length === 0);
  }, [meetingNumber]);

  return (
    <Box
      width={1024}
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
      <Grid container spacing={2}>
        <Grid xs={10}>
          <Input
            label="Meeting Number"
            type="text"
            id="meetingNunber"
            placeholder="Číslo konference nebo odkaz"
            name="meetingNumber"
            variant="outlined"
            onChange={handleMeetingNumberChange}
          />
        </Grid>
        <Grid xs={2}>
          <Button
            variant="soft"
            disabled={buttonDisabled}
            onClick={() => {
              meetingAction(meetingNumber);
            }}
            startDecorator={
              meetingStatus === MEETING_STATUSES.JOINING ? (
                <CircularProgress variant="solid" />
              ) : null
            }
            sx={{ width: 1, mx: "auto" }}
          >
            {buttonText}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

MeetingIdForm.propTypes = {
  meetingAction: PropTypes.func.isRequired,
  buttonText: PropTypes.string.isRequired,
  meetingStatus: PropTypes.string.isRequired,
};

export default MeetingIdForm;
