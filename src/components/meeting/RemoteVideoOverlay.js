import React from "react";
import Sheet from "@mui/joy/Sheet";
import ModalClose from "@mui/joy/ModalClose";
import { styled } from "@mui/system";
import { extendTheme } from "@mui/joy/styles";
import {
  useMeeting,
  useMeetingDispatch,
} from "../meetingcontext/MeetingContext";
import * as actionTypes from "../meetingcontext/MeetingContextActionTypes";

const RemoteVideoOverlay = () => {
  const Div = styled("div")(({ theme }) => ({
    backgroundColor: `rgba(${theme.vars.palette.primary.mainChannel} / 0.2)`,
  }));
  const contextState = useMeeting();
  const dispatch = useMeetingDispatch();

  const theme = extendTheme();

  if (!contextState.overlay.hidden) {
    return (
      <Div theme={theme}>
        <Sheet color="neutral" variant="soft" sx={{ p: 4, zIndex: 10 }}>
          {contextState.overlay.canClose && (
            <ModalClose
              onClick={() => {
                dispatch({
                  type: actionTypes.SET_OVERLAY,
                  overlay: { hidden: true, message: "" },
                });
              }}
            />
          )}
          {contextState.overlay.message && (
            <div>{contextState.overlay.message}</div>
          )}
        </Sheet>
      </Div>
    );
  }
  return null;
};

export default RemoteVideoOverlay;
