import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  Stack,
  InputLabel,
  FormControl,
  FormControlLabel,
  Switch,
} from "@mui/material";

import { setSettings } from "../../redux/actions/settingsActions";

const GeneralSettings = ({ visible, settings, setSettings }) => {
  const selectWidth = "300px";
  const selectHeight = "300px";

  if (!visible) {
    return null;
  }

  return (
    <div>
      <Stack
        direction="row"
        spacing={2}
        // justifyContent="space-between"
        alignItems="top"
      >
        <Stack
          direction="column"
          spacing={2}
          justifyContent="top"
          alignItems="left"
        >
          <InputLabel htmlFor="meeting">Konference</InputLabel>
          <FormControl
            sx={{ m: 1, minWidth: selectWidth, maxHeight: selectHeight }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={settings.multistream}
                  onChange={() => {
                    setSettings({ multistream: !settings.multistream });
                  }}
                />
              }
              label="Technologie Multistream"
            />
          </FormControl>
        </Stack>
      </Stack>
    </div>
  );
};

GeneralSettings.propTypes = {
  visible: PropTypes.bool.isRequired,
  settings: PropTypes.object.isRequired,
  setSettings: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    settings: state.settings,
  };
}

const mapDispatchToProps = {
  setSettings,
};

export default connect(mapStateToProps, mapDispatchToProps)(GeneralSettings);
