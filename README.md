# Simple React frontend for Webex SDK

This is a React frontend for [Webex Browser SDK](https://developer.webex.com/docs/sdks/browser). It's using React v17 and [MaterialUI](https://mui.com). The app provides video calling to a Webex meeting or a SIP URI. For user identity it's using [Webex Guest Issuer](https://developer.webex.com/docs/guest-issuer). Since the Guest Issuer doesn't require the user to have a Webex account, the app can be used as an example for B2C communication.

## Running locally

Before running the application, copy the **`src/api/webexConfig.sample.js`** to **`src/api/webexConfig.localhost.js`**, create a Webex Guest Issuer and fill in the values of **guestId** and **guestSecret** in the file.

In the project directory, you can run:

### `yarn install`

Installs the dependencies needed for the application to run. As of version 3.1.0 of the SDK, `npm install` fails on @webex/plugin-presence. Use `yarn install` instead.

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
Check and modify [webpack.config.prod.js](./webpack.config.prod.js) for the production build. **publicPath** and **ROOT_URL** should be set to the production URL. Do not forget to set the hosting web server CORS settings to allow the Webex API calls. Check for example [here](https://stackoverflow.com/questions/32273606/how-to-enable-cors-for-apache-httpd-server-step-by-step-process) for Apache and [here](https://enable-cors.org/server.html) for other servers.
