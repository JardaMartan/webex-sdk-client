import React from "react";
import PropTypes from "prop-types";
import Sheet from "@mui/joy/Sheet";
import { styled } from "@mui/system";
import { extendTheme } from "@mui/joy/styles";

const RemoteVideoOverlay = ({ message = "", hidden = true }) => {
  const Div = styled("div")(({ theme }) => ({
    backgroundColor: `rgba(${theme.vars.palette.primary.mainChannel} / 0.2)`,
  }));

  const theme = extendTheme();

  if (!hidden) {
    return (
      <Div theme={theme}>
        <Sheet color="neutral" variant="soft" sx={{ p: 4, zIndex: 10 }}>
          {message && <div>{message}</div>}
        </Sheet>
      </Div>
    );
  }
  return null;
};

RemoteVideoOverlay.propTypes = {
  message: PropTypes.string,
  hidden: PropTypes.bool,
};

export default RemoteVideoOverlay;
