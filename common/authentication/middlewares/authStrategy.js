//const { authStrategy } = require('config').get('settings')
const strategies = require('../strategies')

module.exports = async (req, res, next) => {
  const strategy = strategies['local']
  if (typeof strategy !== 'function') {
    return next(
      new Error('Missing or invalid authentication strategy. Contact your administrator.')
    )
  }
  return strategy(req, res, next)
}
