const initialState = {
  user: {
    loggedIn: false,
    email: "",
    formErrors: { email: "" },
    name: "",
    emailValid: false,
    formValid: false,
    formTouched: false,
  },
  webex: {
    accessToken: "",
  },
  log: [
    {
      timeStamp: new Date().toISOString(),
      source: "app",
      level: "info",
      message: "Application started",
    },
  ],
};

export default initialState;
