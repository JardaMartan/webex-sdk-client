import React, { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { connect } from "react-redux";
import { loginUser } from "../../redux/actions/userActions";
import { Button, Input, Box } from "@mui/joy";

const LoginPage = ({ loginUser, ...props }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ ...props.user });

  const handleInput = (e) => {
    setUser({ ...user, [e.target.id]: e.target.value });
  };

  const handleEmailInput = (e) => {
    const tempRes = validateEmail("email", e.target.value);
    setUser({ ...user, ...tempRes });
  };

  const validateEmail = (fieldName, value) => {
    let fieldValidationErrors = user.formErrors;
    let emailValid = user.emailValid;

    emailValid = value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i) != null;
    fieldValidationErrors.email = emailValid
      ? ""
      : `${value} is not a valid email address.`;

    return {
      email: value,
      formErrors: fieldValidationErrors,
      emailValid: emailValid,
      formValid: emailValid,
    };
  };

  const handleSubmit = (e) => {
    e && e.preventDefault();
    loginUser(user);
    navigate("/");
  };

  const isFormError = () => user.formTouched && !user.formValid && user.email;

  // const webexLogo = <i className="icon icon-cisco-logo" />; // require("@momentum-ui/core/images/cisco-webex/wordmark/cisco-webex-wordmark-black.svg");

  return (
    <Box
      my={4}
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        flexGrow: 1,
        display: "grid",
        gridTemplateColumns: "repeat(1, minmax(80px, 1fr))",
        gap: 1,
      }}
    >
      <Box
        width={500}
        my={4}
        display="flex"
        alignItems="center"
        gap={4}
        p={2}
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(1, minmax(80px, 1fr))",
          gap: 1,
          mx: "auto",
        }}
      >
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Jméno a příjmení"
          onChange={handleInput}
        />
        <Input
          id="email"
          name="email"
          type="text"
          placeholder="Email adresa"
          onChange={handleEmailInput}
          className={`${isFormError() ? ` error` : ""}`}
        />
        <Button
          type="submit"
          variant="soft"
          md={4}
          disabled={!user.formValid}
          onClick={handleSubmit}
          sx={{ width: 1 / 2, mx: "auto", mt: 4 }}
        >
          Přihlásit
        </Button>
      </Box>
    </Box>

    // <div className="md-panel md-panel--form md-panel--full">
    //   <div className="md-panel__main">
    //     {/* <img className="md-panel__image" src={webexLogo} alt="Cisco Webex" /> */}
    //     <div className="md-panel__title">Enter your email address</div>
    //     <form className="md-panel__form">
    //       {/* {touched && (error && <span className="text-danger">{error}</span>)} */}
    //       <div
    //         className="md-input__messages error"
    //         style={{
    //           display: isFormError() ? "block" : "none",
    //         }}
    //       >
    //         <div className="message">{user.formErrors.email}</div>
    //       </div>
    //       <Input
    //         id="email"
    //         name="email"
    //         type="text"
    //         placeholder="Email Address"
    //         onChange={handleEmailInput}
    //         className={`${isFormError() ? ` error` : ""}`}
    //       />
    //       <div className="md-panel__cta">
    //         <Button
    //           type="submit"
    //           variant="soft"
    //           disabled={!user.formValid}
    //           onClick={handleSubmit}
    //         >
    //           Next
    //         </Button>
    //       </div>
    //     </form>
    //     {/* <div className="md-panel__secondary-action">
    //       Need help signing in? <a href="#">Contact Support</a>
    //     </div> */}
    //   </div>
    //   <div className="md-panel__footer">
    //     <div className="footer__logo">
    //       <i className="icon icon-cisco-logo" />
    //     </div>
    //     {/* <div className="footer__copyright">
    //       By using Webex Teams you accept the
    //       <a href="#">Terms of Service</a>,{" "}
    //       <a href="#">Privacy Statement, Notices & Disclaimers</a>.
    //     </div> */}
    //   </div>
    // </div>
  );
};

LoginPage.propTypes = {
  loginUser: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
  return {
    user: state.user,
  };
}

const mapDispatchToProps = {
  loginUser,
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
