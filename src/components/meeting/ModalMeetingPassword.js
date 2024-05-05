import React, { useState } from "react";
import {
  Modal,
  ModalDialog,
  ModalClose,
  DialogTitle,
  Divider,
  DialogContent,
  DialogActions,
  Button,
  ButtonGroup,
  Input,
} from "@mui/joy";
import { useMeetingAction, useMeeting } from "../meetingcontext/MeetingContext";

const ModalMeetingPassword = () => {
  const contextState = useMeeting();
  const { setAlertEnterPassword, setMeetingJoin } = useMeetingAction();
  const [meetingPassword, setMeetingPassword] = useState("");
  return (
    <Modal
      open={contextState.alertEnterPassword}
      onClose={() => setAlertEnterPassword(false)}
    >
      <ModalDialog>
        <ModalClose onClick={() => setAlertEnterPassword(false)} />
        <DialogTitle>Heslo konference</DialogTitle>
        <Divider inset="none" />
        <DialogContent>
          Zadejte heslo konference
          <Input
            value={meetingPassword}
            onChange={(e) => setMeetingPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions
          buttonFlex="none"
          sx={{ pt: 1.5, justifyContent: "flex-start" }}
        >
          <ButtonGroup variant="outlined" color="primary" spacing="0.5rem">
            <Button onClick={() => setAlertEnterPassword(false)}>Zrušit</Button>
            <Button
              onClick={() => {
                setMeetingJoin({ password: meetingPassword });
                setMeetingPassword("");
                setAlertEnterPassword(false);
              }}
            >
              OK
            </Button>
          </ButtonGroup>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
};

export default ModalMeetingPassword;
