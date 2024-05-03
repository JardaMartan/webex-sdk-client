import React, { Fragment } from "react";
import { connect } from "react-redux";
import { useNavigate, NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import { logoutUser } from "../../redux/actions/userActions";
import {
  Stack, // eslint-disable-line no-unused-vars
  Avatar,
  AppBar,
  Container, //eslint-disable-line no-unused-vars
  Toolbar, //eslint-disable-line no-unused-vars
  Typography,
} from "@mui/material"; //eslint-disable-line no-unused-vars
import {
  Box,
  Button,
  ListItem,
  Dropdown,
  Menu,
  MenuItem,
  MenuButton,
  Divider,
  // Input,
  Sheet, //eslint-disable-line no-unused-vars
} from "@mui/joy";

// import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
// import BookRoundedIcon from "@mui/icons-material/BookRounded";
// import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
// import HelpRoundedIcon from "@mui/icons-material/HelpRounded";
// import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
// import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { useMeeting } from "../meetingcontext/MeetingContext";
import OpenSettings from "../settings/OpenSettings";

// eslint-disable-next-line no-unused-vars
const AppHeader = ({ logoutUser, user, ...props }) => {
  // const logoIcon = <i className="icon icon-cisco-logo" />;
  const navigate = useNavigate();
  const contextState = useMeeting();
  //eslint-disable-next-line no-unused-vars
  // const [controlPanel, setControlPanel] = useState(
  //   <div>
  //     <Input />
  //     <Button variant="contained">Hledat</Button>
  //   </div>
  // );

  const getAvatar = () => {
    if (user.webexUser && user.webexUser.avatar) {
      return user.webexUser.avatar;
    } else {
      const number = Math.floor(Math.random() * 101);
      const gender = Math.random() >= 0.5 ? "women" : "men";
      return `https://randomuser.me/api/portraits/${gender}/${number}.jpg`;
    }
  };

  const openLogin = () => {
    console.log("open login"); // eslint-disable-line no-console
    navigate("/login");
  };

  const doLogoutUser = () => {
    console.log("log out user"); // eslint-disable-line no-console
    logoutUser();
  };

  //eslint-disable-next-line no-unused-vars
  const navItems = (
    <Fragment>
      <ListItem
        // customRefProp="innerRef"
        customAnchorNode={
          <NavLink
            exact="true"
            to="/"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Home
          </NavLink>
        }
      />
      <ListItem
        // customRefProp="innerRef"
        customAnchorNode={
          <NavLink
            to="/about"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            About
          </NavLink>
        }
      />
    </Fragment>
  );

  const topbarRight = user.loggedIn ? (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        gap: 1.5,
        alignItems: "center",
      }}
    >
      <OpenSettings />
      <Dropdown>
        <MenuButton
          variant="plain"
          size="sm"
          sx={{
            maxWidth: "32px",
            maxHeight: "32px",
            borderRadius: "9999999px",
          }}
        >
          <Avatar
            src={getAvatar()}
            sx={{ maxWidth: "64px", maxHeight: "64px" }}
          />
        </MenuButton>
        <Menu
          placement="bottom-end"
          size="sm"
          sx={{
            zIndex: "99999",
            p: 1,
            gap: 1,
            "--ListItem-radius": "var(--joy-radius-sm)",
          }}
        >
          <MenuItem sx={{ pointerEvents: "none" }}>
            {user.webexUser.displayName} ({user.email})
          </MenuItem>
          <Divider />
          <MenuItem onClick={doLogoutUser}>
            <LogoutRoundedIcon />
            Odhlásit
          </MenuItem>
        </Menu>
      </Dropdown>
    </Box>
  ) : (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        gap: 1.5,
        alignItems: "center",
      }}
    >
      <Button onClick={openLogin} variant="soft">
        Přihlášení
      </Button>
    </Box>
  );

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h5"
          noWrap
          component="div"
          align="left"
          sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
        >
          Konferenční klient
        </Typography>
        {contextState.controlPanel.component}
        <Box sx={{ flexGrow: 1 }} />
        {topbarRight}
      </Toolbar>
    </AppBar>
  );
};

AppHeader.propTypes = {
  user: PropTypes.object.isRequired,
  logoutUser: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

const mapDispatchToProps = {
  logoutUser,
};

export default connect(mapStateToProps, mapDispatchToProps)(AppHeader);
