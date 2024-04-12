# Simple React frontend for Webex SDK

This is a React frontend for [Webex Browser SDK](https://developer.webex.com/docs/sdks/browser). It's using React v17 and [MaterialUI](https://mui.com). The app provides video calling to a Webex meeting or a SIP URI. For user identity it's using [Webex Guest Issuer](https://developer.webex.com/docs/guest-issuer). Since the Guest Issuer doesn't require the user to have a Webex account, the app can be used as an example for B2C communication.

## Running locally

Before running the application, copy the src/api/webexConfig.sample.js to src/api/webexConfig.localhost.js, create a Webex Guest Issuer account and fill in the values of **guestId** and **guestSecret** in the file.

In the project directory, you can run:

### `npm install`

Installs the dependencies needed for the application to run.

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.
