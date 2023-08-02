const HolidayCalendarRestrictionsService = require("../services/holidayCalendarRestrictionsService");
const {
    switchDB,
    getDBModel,
    holidayCalendarConfigurationSchema
  } = require("../middlewares/switchDB");
class Holiday {
    constructor() { }

    create = async (req, res, next) => {
        try {
            console.log("Create HolidayCalendatRestrictions, Data By: " + JSON.stringify(req.body));
            let data = req.body;

            // call method to service
            let resp = await HolidayCalendarRestrictionsService.createHolidayCalendatRestrictions(data, req, res);
            return res.status(200).send(resp);
        } catch (error) {
            console.error(error);
            res.status(400).send(error.message);
        }
    };

    find = async (req, res, next) => {
        try {
            console.log("Find HolidayCalendatRestrictions, Data By: " + JSON.stringify(req.params));
            // call method to service
            let result = await HolidayCalendarRestrictionsService.findHolidayCalendatRestrictions({}, req);

            return res.status(200).send(result);
        } catch (error) {
            console.error(error);
            res.status(400).send(error.message);
        }
    };

    update = async (req, res, next) => {
        try {
            console.log("Update HolidayCalendatRestrictions, Data By: " + JSON.stringify(req.body));
            let data = req.body;
            if (!data?.uuid) {
                res.status(400).send("uuid required for update");
            }
            const companyName = req.subdomain;
            const DB = await switchDB(companyName, holidayCalendarConfigurationSchema);
            const holidayModel = await getDBModel(DB, "holidayCalendarConfiguration");

            const CurrentYearHolidayCalendars = await holidayModel.find({year: new Date().getFullYear(), isActive: true }).lean()

            const holidayCalendarsExceedingMaxLimit = CurrentYearHolidayCalendars.filter(holidayCalendar => {
                const holidays = holidayCalendar.holidays.filter(holiday => holiday.isSelected == true)
                if(holidays.length > data.maxNoOfHolidays)
                    return holidayCalendar
            });

            if (holidayCalendarsExceedingMaxLimit.length > 0) {
                const error = `There are ${holidayCalendarsExceedingMaxLimit.length} Holiday Calendar with No of Holidays greater than ${data.maxNoOfHolidays}. Please update them.`;
                throw new Error(error);
            } else {
                // call method to service
                let resp = await HolidayCalendarRestrictionsService.updateHolidayCalendatRestrictions(data, req);
                return res.status(200).send(resp);
            }
        } catch (error) {
            console.error(error);
            res.status(400).send(error.message);
        }
    };
}

module.exports = new Holiday();
