import React, { useEffect, useState } from "react";
import { Box, Grid, Input, Button, CircularProgress } from "@mui/joy";
import {
  useMeeting,
  useMeetingDispatch,
  useMeetingAction,
} from "../meetingcontext/MeetingContext";
import { MEETING_STATUSES } from "../../constants/meeting";
import * as actionTypes from "../meetingcontext/MeetingContextActionTypes";

const MeetingIdForm = () => {
  const contextState = useMeeting();
  const dispatch = useMeetingDispatch();
  const { joinMeeting, leaveMeeting } = useMeetingAction();
  const [meetingNumber, setMeetingNumber] = useState("");
  const [buttonText, setButtonText] = useState("Připojit");

  const meetingAction = (meetingNumber) => {
    switch (contextState.meetingStatus) {
      case MEETING_STATUSES.INACTIVE:
        joinMeeting(meetingNumber).then(() => {
          console.log("Meeting joined");
        });
        break;
      case MEETING_STATUSES.ACTIVE:
      case MEETING_STATUSES.IN_LOBBY:
      case MEETING_STATUSES.JOINED:
      case MEETING_STATUSES.IN_MEETING:
        dispatch({
          type: actionTypes.SET_ALERT_LEAVE_MEETING,
          alertLeaveMeeting: true,
        });
        break;
      case MEETING_STATUSES.JOINING:
        leaveMeeting();
        break;
      default:
        console.log(
          "Unhandled click action for meeting status ",
          contextState.meetingStatus
        );
        break;
    }
  };

  const handleMeetingNumberChange = (event) => {
    setMeetingNumber(event.target.value);
  };

  useEffect(() => {
    switch (contextState.meetingStatus) {
      case MEETING_STATUSES.INACTIVE:
        setButtonText("Připojit");
        break;
      case MEETING_STATUSES.ACTIVE:
      case MEETING_STATUSES.IN_LOBBY:
      case MEETING_STATUSES.IN_MEETING:
        setButtonText("Opustit");
        break;
      case MEETING_STATUSES.JOINING:
        setButtonText("Připojuji se...");
        break;
      default:
        break;
    }
  }, [contextState.meetingStatus, setButtonText]);

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
            disabled={
              contextState.meetingStatus === MEETING_STATUSES.INACTIVE &&
              meetingNumber.trim().length === 0
            }
            onClick={() => {
              meetingAction(meetingNumber);
            }}
            startDecorator={
              contextState.meetingStatus === MEETING_STATUSES.JOINING ? (
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

export default MeetingIdForm;
