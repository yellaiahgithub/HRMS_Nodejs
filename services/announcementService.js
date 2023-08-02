const { switchDB, getDBModel, announcementSchema } = require("../middlewares/switchDB");

class AnnouncementService {
    constructor() { }

    create = async (data, req, res) => {
        try {
            console.log('Data for announcement create', data);
            const companyName = req.subdomain
            const DB = await switchDB(companyName, announcementSchema)
            const announcementModel = await getDBModel(DB, 'announcement')
            return await announcementModel.insertMany([data], { runValidators: true })
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    findAll = async (todayDate, req) => {
        try {
            console.log('Get all announcements')
            const companyName = req.subdomain
            const DB = await switchDB(companyName, announcementSchema)
            const announcementModel = await getDBModel(DB, 'announcement')
            return await announcementModel.find({$and:[ {startDate: {$lte: todayDate}, endDate:  {$gte: todayDate}}]})
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }
}

module.exports = new AnnouncementService()