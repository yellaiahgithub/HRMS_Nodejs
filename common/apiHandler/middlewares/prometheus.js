const Prometheus = require('prom-client')
// const ua = require('./os')

const httpRequestDurationMicroseconds = new Prometheus.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500]
  // buckets for response time from 0.1ms to 500ms
})

// function calculateByte(str) {
//   // returns the byte length of an utf8 string
//   let s = str.length
//   // eslint-disable-next-line no-plusplus
//   for (let i = str.length - 1; i >= 0; i--) {
//     const code = str.charCodeAt(i)
//     // eslint-disable-next-line no-plusplus
//     if (code > 0x7f && code <= 0x7ff) s++
//     else if (code > 0x7ff && code <= 0xffff) s += 2
//     // eslint-disable-next-line no-plusplus
//     if (code >= 0xdc00 && code <= 0xdfff) i-- // trail surrogate
//   }
//   return s
// }

// Middleware to prometheusMetrix
function prometheusMetrix(req, res) {
  const responseTimeInMs = Date.now() - res.locals.startEpoch
  // const request = JSON.stringify(req.body) + JSON.stringify(req.params) + JSON.stringify(req.query)
  // const reqPayload = calculateByte(request)
  // const resPayload = res._contentLength
  // const userAgent = ua(req)

  // const { locals: { createLogContext } = { createLogContext: () => ({}) } } = res;
  // if (logger && typeof logger.info === 'function') {
  //   logger.info(`http response duration in ms ${responseTimeInMs}`, createLogContext({ duration: responseTimeInMs, reqPayload, resPayload, platform : userAgent.platform, os: userAgent.os }));
  // }
  httpRequestDurationMicroseconds
    .labels(req.method, req.route && req.route.path, res.statusCode)
    .observe(responseTimeInMs)
}
module.exports = {
  prometheusMetrix
}
