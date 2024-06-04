import { IconButton, Tooltip } from "@mui/joy";
import { Settings } from "@mui/icons-material";
import React from "react";
import SettingsDialog from "./SettingsDialog";

const OpenSettings = () => {
  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Tooltip title="Nastavení">
        <IconButton
          onClick={() => {
            setOpen(true);
          }}
          sx={{ width: 48, height: 48, color: "white" }}
        >
          <Settings />
        </IconButton>
      </Tooltip>
      <SettingsDialog open={open} onClose={handleClose} />
    </div>
  );
};

export default OpenSettings;
