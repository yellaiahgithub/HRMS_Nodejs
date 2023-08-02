const conf = require('../conf/conf')

function checkCompanyName(req, res) {
    if(req.body.userType != 'Admin' && !req.session?.userDetails) throw Error("Session Expired")
    let companyName = ""
    if (req.body.userType || req.session?.userDetails?.isAdmin) {
        companyName = conf.DB_NAME
    } else {
        companyName  = req?.session?.userDetails?.companyName

    }
    return companyName;
}

module.exports = checkCompanyName 