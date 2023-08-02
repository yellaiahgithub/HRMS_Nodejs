const BulkUploadService = require("../services/bulkUploadService.js");

class BulkUpload {
    constructor() { }

    findBulkUploadDisplay = async (req, res, next) => {
        try {
            console.log("Get BulkUploads  ");
            const data = req.body
            let projection = {}
            let value = []
            if(data.displayDepartmentCodes){
                projection["departmentList"] =  1

                value = value.concat(
                    {
                        $lookup: {
                            from: "department",
                            let: {},
                            pipeline: [
                                {
                                    $match: {
                                        status: true,
                                    }
                                },
                                {
                                    $project: {
                                        _id: 0,
                                        uuid: 1,
                                        id: 1,
                                        name: 1
    
                                    }
                                }
                            ],
                            as: "departmentList"
                        }
                    }
                )
            }
            if(data.displayEmployeeCodes){
                projection["employeesList"] =  1
                value = value.concat(
                {
                    $lookup: 
                     {
                        from: "employee",
                        let: { empUUID: "$uuid" },
                        pipeline: [
                            {
                                $match: {
                                    isActive: true,
                                }
                            },
                            {
                                $project: {
                                    _id: 0,
                                    uuid: 1,
                                    employeeID: "$id",
                                    employeeName: {
                                        $concat: ["$firstName", " ", "$lastName"],
                                    },
                                    department: 1

                                }
                            }
                        ],
                        as: "employeesList"
                    }
                })
            }
            if(data.displayLocationCodes){
                projection["locationList"] =  1

                value = value.concat(
                    {
                        $lookup: {
                            from: "locations",
                            let: {},
                            pipeline: [
                                {
                                    $match: {
                                        status: true,
                                    }
                                },
                                {
                                    $project: {
                                        _id: 0,
                                        uuid: 1,
                                        locationId: 1,
                                        locationName: 1
    
                                    }
                                }
                            ],
                            as: "locationList"
                        }
                    },
                )
            }
            if(data.displayDesignationCodes){
                projection["designationList"] =  1

                value = value.concat(
                    {
                        $lookup: {
                            from: "designation",
                            let: {},
                            pipeline: [
                                {
                                    $match: {
                                        status: true,
                                    }
                                },
                                {
                                    $project: {
                                        _id: 0,
                                        uuid: 1,
                                        id: 1,
                                        name: 1
    
                                    }
                                }
                            ],
                            as: "designationList"
                        }
                    }
                )
            }

            if(data.displayLicenseCodes){
                projection["licenseList"] =  1

                value = value.concat(
                    {
                        $lookup: {
                            from: "itemCatalogue",
                            let: {},
                            pipeline: [
                                {
                                    $match: {
                                        type: "License",
                                        status: true
                                    }
                                },
                                {
                                    $project: {
                                        _id: 0,
                                        code: 1,
                                        description: 1
    
                                    }
                                }
                            ],
                            as: "licenseList"
                        }
                    }
                )
            }
            if(data.displayCertificateCodes){
                projection["certificateList"] =  1

                value = value.concat(
                    {
                        $lookup: {
                            from: "itemCatalogue",
                            let: {},
                            pipeline: [
                                {
                                    $match: {
                                        type: "Certificate",
                                        status: true
                                    }
                                },
                                {
                                    $project: {
                                        _id: 0,
                                        code: 1,
                                        description: 1
    
                                    }
                                }
                            ],
                            as: "certificateList"
                        }
                    }
                )
            }
            let matchQry = {};
            matchQry['isActive'] = true;
            if(data.displayHireActionCodes){
                matchQry['actionCode'] = "HIRE";
            }
            if(data.displayAllActions) {
                projection["actionId"] =  1;
                projection["actionCode"] =  1;
                projection["actionName"] =  1;
            }
            let pipeline = [
                {
                    $match: matchQry
                },
                {
                    $lookup: {
                        from: "reasons",
                        let: {
                            actCode: "$actionCode",
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$isActive', true]},
                                            { $eq: ['$actionCode', "$$actCode"] },
                                        ],
                                    },
                                },
                            },
                            {
                                $project: {
                                    _id: 0,
                                    reasonCode: 1,
                                    reasonName: 1,
                                    description: 1,
                                },
                            },
                        ],
                        as: "reasonsList",
                    }
                },
                {
                    $project: {
                        _id: 0,
                        ...projection,
                        reasonsList: 1
                    }
                }
            ]
            pipeline = [...pipeline, ...value]
            // call method to service
            let result = await BulkUploadService.aggregate(pipeline, req);

            if (!result && !result[0]) {
                return res.status(404).send("BulkUploads not found in the database");
            }
            return res.status(200).send(data.displayAllActions ? result : result[0]);
        } catch (error) {
            console.error(error);
            res.status(400).send(error.message);
        }
    };

}

module.exports = new BulkUpload();
