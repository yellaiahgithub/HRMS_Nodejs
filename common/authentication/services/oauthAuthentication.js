const request = require('request-promise')
const { CLIENT_ID, CLIENT_SECRET, AD_TOKEN_ENDPOINT } = require('config').get('settings')
// const logger = require('../../logging/services/logger').loggers.get('general')
/*eslint-disable */
// This redirects back to the redirect_uri provided with the code using the following request params
// we generally use this to hit the microsoft Ad endpoint with client secret, client id, token id, and the scope
function OauthAuthentication(redirectUri) {
  this.redirectUri = redirectUri;
}

OauthAuthentication.prototype.login = function login(code) {
  return request({
    method: 'POST',
    uri: AD_TOKEN_ENDPOINT,
    form: {
      client_id: CLIENT_ID,
      // offline_access needed for refresh token,
      // directory.read.all needed for access to Microsoft Graph
      scope: 'openid profile email offline_access directory.read.all',
      redirect_uri: this.redirectUri,
      grant_type: 'authorization_code',
      client_secret: CLIENT_SECRET,
      code
    }
  });
};

OauthAuthentication.prototype.refresh = function refresh(refreshToken) {
  return request({
    method: 'POST',
    uri: AD_TOKEN_ENDPOINT,
    form: {
      client_id: CLIENT_ID,
      // offline_access needed for refresh token,
      // directory.read.all needed for access to Microsoft Graph
      scope: 'openid profile email offline_access directory.read.all',
      redirect_uri: this.redirectUri,
      grant_type: 'refresh_token',
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken
    }
  });
};

module.exports = OauthAuthentication;
