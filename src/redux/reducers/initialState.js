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
  app: {
    controlPanel: {
      id: "none",
      component: <></>,
      callback: (data) => {
        console.log(`callback clicked for ${data}`);
      },
      data: {},
    },
  },
};

export default initialState;
