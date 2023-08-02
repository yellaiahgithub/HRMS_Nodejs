// eslint-disable-next-line
const useragent = require("express-useragent");

// eslint-disable-next-line
module.exports = (req) => {
  // eslint-disable-next-line
  let source = "";
  if (req && req.headers && req.headers['user-agent']) {
    source = req.headers['user-agent']
  } else {
    source = 'unknown'
  }
  // eslint-disable-next-line
  const ua = useragent.parse(source);
  return ua
}
