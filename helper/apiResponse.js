const { StatusCodes } = require("http-status-codes");
const { BAD_REQUEST, OK, NOT_FOUND, UNAUTHORIZED, INTERNAL_SERVER_ERROR } = StatusCodes;


 function successResponse(res, msg) {
  const data = {
    status: 'success',
    message: msg
  }
  console.log(`${res.req.method} ${OK}  ${msg} - ${res.req.originalUrl}`);
  return res.status(OK).json(data)
}

 function successResponseWithData(res, msg, data) {
  const resData = {
    status: 'success',
    message: msg,
    data
  }
  console.log(`${OK} ${res.req.method} ${msg} - ${res.req.originalUrl}`);
  return res.status(OK).json(resData)
}

 function successResponseWithDataSecureInfo(res, msg, data) {
  const resData = {
    status: 'success',
    message: msg,
    data
  }
  console.log(`${OK} ${res.req.method} ${msg} - ${res.req.originalUrl}`);
  return res.status(OK).json(resData)
}

 function errorResponse(res, msg) {
  const data = {
    status: 'failure',
    message: msg
  }
  console.log(`${INTERNAL_SERVER_ERROR} ${msg} - ${res.req.originalUrl} - ${res.req.method} - ${res.req.ip}`);
  return res.status(INTERNAL_SERVER_ERROR).json(data)
}

 function notFoundResponse(res, msg) {
  const data = {
    status: 'failure',
    message: msg
  }
  console.log(`${NOT_FOUND} ${res.req.method} ${msg} - ${res.req.originalUrl}`);
  return res.status(NOT_FOUND).json(data)
}

 function validationErrorWithData(res, msg, data) {
  const resData = {
    status: 'failure',
    message: msg,
    data
  }
  
  console.log(`${BAD_REQUEST} ${res.req.method} ${msg} - ${res.req.originalUrl} - ${res.req.method} - ${res.req.ip}`);
  return res.status(BAD_REQUEST).json(resData)
}

 function unauthorizedResponse(res, msg) {
  const data = {
    status: 'failure',
    message: msg
  }
  console.log(`${UNAUTHORIZED} ${res.req.method} ${msg} - ${res.req.originalUrl}`);
  return res.status(UNAUTHORIZED).json(data)
}

module.exports = {
  successResponse,
  successResponseWithData,
  successResponseWithDataSecureInfo,
  errorResponse,
  notFoundResponse,
  validationErrorWithData,
  unauthorizedResponse
}