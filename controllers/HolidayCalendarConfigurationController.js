const HolidayCalendarConfigurationService = require("../services/HolidayCalendarConfigurationService.js");

class HolidayCalendarConfiguration {
  constructor() {}

  createHolidayCalendarConfiguration = async (req, res, next) => {
    try {
      console.log("Create HolidayCalendarConfiguration, Data By: " + JSON.stringify(req.body));
      let data = req.body;

      // call method to service
      let resp = await HolidayCalendarConfigurationService.createHolidayCalendarConfiguration(data, req, res);
           
      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  findById = async (req, res, next) => {
    try {
      console.log("Find HolidayCalendarConfiguration, Data By: " + JSON.stringify(req.query.uuid));
      // call method to service
      let result = await HolidayCalendarConfigurationService.findHolidayCalendarConfiguration({ uuid: req.query.uuid }, req);
      const calender=result?.[0];
      if(!calender) return res.status(400).send("Calender not found");
      calender.holidays.sort((a,b)=>b.isSelected-a.isSelected)
      return res.status(200).send(result[0]);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  findAll = async (req, res, next) => {
    try {
      console.log("Find HolidayCalendarConfiguration, Data By: " + JSON.stringify(req.params));
      // call method to service
      
      let query={}
      if (req.body.year != undefined) {
        query.year = {$in : req.body.year}
      }
      if (req.body.locationId != undefined) {
        query.locationId = {$in : req.body.locationId}
      }
      let pipeline = [
        {
          $match: {...query } 
        },
        {
          $lookup: {
              from: "locations",
              let: { locUUID :"$locationId"},
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $in: ['$locationId', '$$locUUID']}
                          ]
                        }
                      }
                    },
                    {
                      $project:{
                        _id:0,
                        locationName:1,
                        locationId:1
                      }
                    }
                  ],
              as: "locations"
            }
        }
      ]

      let result = await HolidayCalendarConfigurationService.aggregate(pipeline, req);

      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  update = async (req, res, next) => {
    try {
      console.log("Update HolidayCalendarConfiguration, Data By: " + JSON.stringify(req.body));
      let data = req.body;
      if(!data?.uuid) {
        res.status(400).send("uuid required for update");
      }
      // call method to service
      let resp = await HolidayCalendarConfigurationService.updateHolidayCalendarConfiguration(data, req);

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  getEmployeeByLocation = async(req, res) => {
      try{
        if(!req.query.locationId) throw new Error("locationId is required");
        let query={};

        let todayYear = new Date().getFullYear(); 
        query.year = todayYear;
        const locationId = req.query.locationId
        query.locationId = locationId

        let pipeline = [
          {
            $match: {
              ...query
            }
          },
          {
            $unwind: "$holidays",
          },
          {
            $match: {
              "holidays.isSelected": true,
            }
          },
          {
            $group: {
              _id: {
                uuid: "$uuid",
                name: "$name",
                year: "$year",
                locationId: "$locationId",
              },
              holidays: {
                $push: "$holidays",
              },
            }
          },
          {
            $project: {
              _id: 0,
              uuid: "$_id.uuid",
              name: "$_id.name",
              year: "$_id.year",
              locationId: "$_id.locationId",
              holidays: 1,
            },
          }
        ]
        // call method to service
        let result = await HolidayCalendarConfigurationService.aggregate(pipeline, req);

        if(result?.length==0) res.status(400).send("Calender Not Available for this location");
        let individualHolidays=[]
        await result[0].holidays.forEach(holiday=>{
          const startDate=new Date(holiday.startDate)
          const endDate=new Date(holiday.endDate)
          let daysBetween=(endDate.getTime()-startDate.getTime())/(1000*60*60*24)
          let tempDay=0
          do{
            const tempHoliday=JSON.parse(JSON.stringify(holiday))
            const date=new Date(startDate)
            date.setDate(startDate.getDate()+(tempDay++))
            tempHoliday.date=date.toISOString();
            individualHolidays.push(tempHoliday)
          }while(daysBetween>=tempDay)
        })
        console.log(individualHolidays)
        result[0].holidays=individualHolidays

        return res.status(200).send(result);
      } catch (error) {
        console.error(error);
        res.status(400).send(error.message);
      }
  }
  
}

module.exports = new HolidayCalendarConfiguration();
