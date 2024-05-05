import React from "react";
import { Modal, ModalDialog, ModalClose, Box } from "@mui/joy";
import DtmfPanel from "./DtmfPanel";
import {
  useMeetingDispatch,
  useMeeting,
} from "../meetingcontext/MeetingContext";
import * as actionTypes from "../meetingcontext/MeetingContextActionTypes";

const ModalDtmf = () => {
  const contextState = useMeeting();
  const dispatch = useMeetingDispatch();
  return (
    <Modal open={!contextState.dtmfPanel.hidden}>
      <ModalDialog>
        <ModalClose
          onClick={() =>
            dispatch({
              type: actionTypes.SET_DTMF_PANEL,
              dtmfPanel: { hidden: true },
            })
          }
        />
        <Box pt={3}>
          <DtmfPanel />
        </Box>
      </ModalDialog>
    </Modal>
  );
};

export default ModalDtmf;
