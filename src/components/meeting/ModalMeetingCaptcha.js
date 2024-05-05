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

const ModalMeetingCaptcha = () => {
  const contextState = useMeeting();
  const { setAlertEnterCaptcha, setMeetingJoin } = useMeetingAction();
  const [meetingCaptcha, setMeetingCaptcha] = useState("");
  return (
    <Modal
      open={contextState.alertEnterCaptcha}
      onClose={() => setAlertEnterCaptcha(false)}
    >
      <ModalDialog>
        <ModalClose onClick={() => setAlertEnterCaptcha(false)} />
        <DialogTitle>Kód z obrázku</DialogTitle>
        <Divider inset="none" />
        <DialogContent>
          Zadejte kód z obrázku
          <img
            src={contextState.meetingCaptcha.verificationImageURL}
            alt="Captcha"
            style={{ display: "block" }}
          />
          <Input
            value={meetingCaptcha}
            onChange={(e) => setMeetingCaptcha(e.target.value)}
          />
        </DialogContent>
        <DialogActions
          buttonFlex="none"
          sx={{ pt: 1.5, justifyContent: "flex-start" }}
        >
          <ButtonGroup variant="outlined" color="primary" spacing="0.5rem">
            <Button onClick={() => setAlertEnterCaptcha(false)}>Zrušit</Button>
            <Button
              onClick={() => {
                setMeetingJoin({ captcha: meetingCaptcha });
                setMeetingCaptcha("");
                setAlertEnterCaptcha(false);
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

export default ModalMeetingCaptcha;
