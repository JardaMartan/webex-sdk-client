import { handleResponse, handleError } from "./apiUtils";
import { KJUR } from "jsrsasign";
// import { Buffer } from "buffer";
const baseUrl = "https://webexapis.com/v1";
const apiConfig = require("./webexConfig.json");

function createHeaders(webex) {
  return {
    Authorization: "Bearer " + webex.accessToken,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export async function callWebex(
  webex,
  path,
  method = "GET",
  params = {},
  body = null
) {
  const url = new URL(baseUrl + path);
  // console.log(`params: ${JSON.stringify(params)}`);
  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key])
  );
  console.log(`callWebex: ${url}, body: ${JSON.stringify(body, null, 2)}`);
  return fetch(url, {
    method,
    headers: createHeaders(webex),
    body: body ? JSON.stringify(body, null, 2) : null,
  })
    .then(handleResponse)
    .catch(handleError);
}

export async function getMe(webex) {
  return callWebex(webex, "/people/me");
}

export async function getWorkspaces(webex) {
  return callWebex(
    webex,
    "/workspaces",
    "GET"
    //  { calling: "none"}
  );
}

export async function createActivationCode(webex, workspaceId) {
  return callWebex(
    webex,
    "/devices/activationCode",
    "POST",
    {},
    {
      workspaceId,
    }
  );
}

export async function getDevices(webex, params = {}) {
  return callWebex(webex, "/devices", "GET", params);
}

export async function runXapiCommand(webex, deviceId, command, args) {
  const body = { deviceId, arguments: args };
  return callWebex(webex, `/xapi/command/${command}`, "POST", {}, body);
}

export async function getLocations(webex, params = {}) {
  return callWebex(webex, "/workspaceLocations", "GET", params);
}

export async function getLocationFloors(webex, locationId) {
  return callWebex(webex, `/workspaceLocations/${locationId}/floors`, "GET");
}

export async function createWorkspace(webex, displayName, locationId, floorId) {
  const body = { displayName };
  if (locationId) {
    body.workspaceLocationId = locationId;
  }
  if (floorId) {
    body.floorId = floorId;
  }
  return callWebex(webex, "/workspaces", "POST", {}, body);
}

export async function getMeetings(webex, params = {}) {
  return callWebex(webex, "/meetings", "GET", params);
}

export async function createMeeting(webex, meeting) {
  const body = { ...meeting };
  return callWebex(webex, "/meetings", "POST", {}, body);
}

export async function deleteMeeting(webex, meetingId) {
  return callWebex(webex, `/meetings/${meetingId}`, "DELETE");
}

export async function updateMeeting(webex, meetingId, meeting) {
  const body = { ...meeting };
  return callWebex(webex, `/meetings/${meetingId}`, "PATCH", {}, body);
}

export async function createGuestToken(email, displayName) {
  // const secret = Buffer.from(JSON.stringify(apiConfig.guestSecret), "utf-8")
  //   .toString("base64")
  //   .replace(/=+$/, "");
  if (displayName === "") {
    displayName = email;
  }
  const secret = apiConfig.guestSecret;
  const jwToken = generateJWTToken(
    {
      sub: email.replace(/[@_.]/g, "-"),
      name: displayName,
      iss: apiConfig.guestId,
      exp: Math.floor(Date.now() / 1000) + 3600,
    },
    secret,
    (err, token) => {
      if (err) {
        console.error(err);
      } else {
        return token;
      }
    }
  );
  console.log(`secret:\n${secret}\njwToken:\n${jwToken}`);

  return callWebex({ accessToken: jwToken }, "/jwt/login", "POST");
}

function generateJWTToken(payload, secretKey) {
  // Create header
  const header = { alg: "HS256", typ: "JWT" };
  // Generate signature
  const signature = KJUR.jws.JWS.sign(null, header, payload, {
    b64: secretKey,
  });
  return signature;
}
