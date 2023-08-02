const localStrategy = require('./local')
//const ldapStrategy = require('./ldap')

const strategies = {
  local: localStrategy
}

module.exports = strategies
