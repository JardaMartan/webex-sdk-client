import React from "react";
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
} from "@mui/joy";
import { useMeetingAction, useMeeting } from "../meetingcontext/MeetingContext";

const ModalLeaveMeeting = () => {
  const contextState = useMeeting();
  const { leaveMeeting, setAlertLeaveMeeting } = useMeetingAction();
  return (
    <Modal
      open={contextState.alertLeaveMeeting}
      onClose={() => setAlertLeaveMeeting(false)}
    >
      <ModalDialog>
        <ModalClose onClick={() => setAlertLeaveMeeting(false)} />
        <DialogTitle>Opustit konferenci</DialogTitle>
        <Divider inset="none" />
        <DialogContent>Chcete opustit konferenci?</DialogContent>
        <DialogActions
          buttonFlex="none"
          sx={{ pt: 1.5, justifyContent: "flex-start" }}
        >
          <ButtonGroup variant="outlined" color="primary" spacing="0.5rem">
            <Button onClick={() => setAlertLeaveMeeting(false)}>Ne</Button>
            <Button
              onClick={() => {
                leaveMeeting();
                setAlertLeaveMeeting(false);
              }}
            >
              Ano
            </Button>
          </ButtonGroup>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
};

export default ModalLeaveMeeting;
