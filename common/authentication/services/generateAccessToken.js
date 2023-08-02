const SHA256 = require('crypto-js/sha256')
const { Base64 } = require('js-base64')

function GenerateAccessToken(req, res) {
  this.req = req
  this.res = res
}

GenerateAccessToken.prototype.getAccessToken = function getAccessToken({ cnonce, session }) {
  if (session !== null && session !== undefined) {
    const { sessionUUID, userId, serverSecret } = session
    const sha = SHA256(cnonce + userId + serverSecret)
    const base = Base64.encode(sha)
    const accessToken = `2~${sessionUUID}~${cnonce}~${base}`

    return accessToken
  }
  throw new Error('session not defined')
}

module.exports = {
  GenerateAccessToken
}
