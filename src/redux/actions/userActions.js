import * as types from "./actionTypes";
import { createGuestToken, getMe } from "../../api/webexApi";

export function loginUser(user) {
  // eslint-disable-next-line no-unused-vars
  return async function (dispatch, getState) {
    dispatch({ type: types.WEBEX_BEGIN_API_CALL });
    const webexToken = await createGuestToken(user.email, user.name);
    dispatch({
      type: types.WEBEX_LOGIN_SUCCESS,
      webex: { accessToken: webexToken.token },
    });
    console.log(`webexToken: ${JSON.stringify(webexToken)}`);
    const me = await getMe({ accessToken: webexToken.token });
    console.log(`guest user created: ${JSON.stringify(me)}`);
    dispatch({
      type: types.LOGIN_USER,
      user: { email: user.email, webexUser: me, loggedIn: true },
    });
  };
}

export function logoutUser() {
  // eslint-disable-next-line no-unused-vars
  return async function (dispatch, getState) {
    dispatch({
      type: types.LOGOUT_USER,
      user: { email: "", webexUser: {}, loggedIn: false },
    });
  };
}
