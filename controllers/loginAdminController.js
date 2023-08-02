const AdminService = require('../services/adminService');
const employeeService = require('../services/employeeService');

class LoginAdmin {
    constructor() { }

    loginAdmin = async (req, res, next) => {
        try {
            console.log('Login Admin, Data By: ' + JSON.stringify(req.body))
            let existingUser = {}
            let isEmployee = false;
            existingUser = await AdminService.findUserById({ username: req.body.username }, req)
            
            if(!existingUser) {
                const match={userId: { $eq: req.body.username }}
                const employees = await employeeService.findEmployeeDetails(match, req, res);
                existingUser = employees.length > 0 ? employees[0] : null;
                isEmployee = true;
            }
            if(existingUser) {
                const responseData={
                    user:existingUser,
                    companyDetails : res.locals.companyDetails,
                    accessToken : res.locals.userToken,
                    modules : res.locals?.modules,
                    countries : res.locals?.countries,
                    view : isEmployee ? 'Employee' : 'Admin',
                }
                if (responseData.accessToken) {
                    const authorizationHeader = `Bearer ${responseData.accessToken}`
                    res.set({
                      Authorization: authorizationHeader
                    })
                    responseData.accessToken = authorizationHeader
                }
                return res.status(200).send(responseData)
            } else {
                return res.status(404).send('User Not found')
            }
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }
}

module.exports = new LoginAdmin()