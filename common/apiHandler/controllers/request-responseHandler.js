const responseHandler = (req, res) => {
  res.status(200).json({
    message: req.response.message ? req.response.message : '',
    data: req.response.data ? req.response.data : {},
    status: 'success'
  })
}

module.exports = {
  responseHandler
}
