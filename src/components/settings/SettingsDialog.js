import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Drawer,
  Toolbar,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import {
  SettingsOutlined,
  VideocamOutlined,
  MicOutlined,
} from "@mui/icons-material";
import { Grid, Stack } from "@mui/joy"; //eslint-disable-line no-unused-vars
import AudioSettings from "./AudioSettings";
import VideoSettings from "./VideoSettings";
import { useMeetingAction } from "../meetingcontext/MeetingContext";
import GeneralSettings from "./GeneralSettings";

const SettingsDialog = ({ onClose, open }) => {
  const [content, setContent] = useState("audio");
  const { getMediaDevices, clearMediaDevices } = useMeetingAction();

  useEffect(() => {
    if (open) {
      console.log("Settings dialog open");
      setContent("audio");
      getMediaDevices();
    } else {
      console.log("Settings dialog closed");
      setContent("none");
      clearMediaDevices();
    }
  }, [open]); //eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog
      onClose={onClose}
      open={open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle align="center">Nastavení</DialogTitle>
      <DialogContent sx={{ height: "500px" }}>
        {/* <Stack direction="row" spacing={2}> */}
        <Grid container xs={12}>
          <Grid xs={2}>
            <Drawer
              PaperProps={{
                style: {
                  position: "absolute",
                },
              }}
              variant="permanent"
              anchor="left"
            >
              <Toolbar />
              {/* <Divider /> */}
              <List>
                <ListItem key="audio" disablePadding>
                  <ListItemButton
                    onClick={() => {
                      setContent("audio");
                    }}
                  >
                    <ListItemIcon>
                      <MicOutlined />
                    </ListItemIcon>
                    <ListItemText primary="Audio" />
                  </ListItemButton>
                </ListItem>
                <ListItem key="video" disablePadding>
                  <ListItemButton
                    onClick={() => {
                      setContent("video");
                    }}
                  >
                    <ListItemIcon>
                      <VideocamOutlined />
                    </ListItemIcon>
                    <ListItemText primary="Video" />
                  </ListItemButton>
                </ListItem>
                <ListItem key="general" disablePadding>
                  <ListItemButton
                    onClick={() => {
                      setContent("general");
                    }}
                  >
                    <ListItemIcon>
                      <SettingsOutlined />
                    </ListItemIcon>
                    <ListItemText primary="Obecné" />
                  </ListItemButton>
                </ListItem>
              </List>
              {/* <Divider />
              <List>
                {["All mail", "Trash", "Spam"].map((text, index) => (
                  <ListItem key={text} disablePadding>
                    <ListItemButton>
                      <ListItemIcon>
                        {index % 2 === 0 ? <Inbox /> : <Mail />}
                      </ListItemIcon>
                      <ListItemText primary={text} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List> */}
            </Drawer>
          </Grid>
          <Grid xs={10}>
            <AudioSettings visible={content === "audio"} />
            <VideoSettings visible={content === "video"} />
            <GeneralSettings visible={content === "general"} />
          </Grid>
        </Grid>
        {/* {content}
        </Stack> */}
      </DialogContent>
      <DialogActions>
        {/* <Button onClick={() => onClose(false)} variant="soft">
          Disagree
        </Button> */}
        <Button onClick={() => onClose(true)} variant="soft" autoFocus>
          Zavřít
        </Button>
      </DialogActions>
    </Dialog>
  );
};

SettingsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SettingsDialog;
