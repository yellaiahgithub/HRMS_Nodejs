const JobGradeService = require("../services/jobGradeService.js");
const apiResponse = require("../helper/apiResponse");

class JobGrade {
  constructor() {}

  findJobGradeBy = async (req, res, next) => {
    try {
        console.log("Find JobGrade, Data By: " + JSON.stringify(req.query));

        let match = {};
        if (req.query?.gradeId) {
            match.gradeId =  req.query.gradeId;
        }
        if (req.query?.gradeName) {
            match.gradeName = req.query.gradeName;
        }
        if (req.query?.status) {
            match.status = req.query.status?.toLowerCase()
        }
        if (req.query?.nextGrade) {
            match.gradeName = req.query.nextGrade;
        }

        let pipeline  = [
          {
            $match: {
                ...match
            }
          },
          {
            $lookup: {
              from: "jobGrade",
              localField: "nextGrade",
              foreignField: "uuid",
              as: "nextJobGrade"
            }
          },
          {
            $unwind: {
              path: "$nextJobGrade",
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $project: {
              uuid: 1,
              gradeId: 1,
              gradeName: 1,
              effectiveDate: 1,
              status: 1,
              description: 1,
              gradeSalaryRangeMinimum: 1,
              gradeSalaryRangeMidPoint: 1,
              gradeSalaryRangeMaximum : 1,
              progressionByService: 1,
              minimumService : 1,
              maximumService : 1,
              minimumNumberOfReviews : 1,
              progressionByReviewsRatings : 1,
              minimumRating : 1,
              averageRating : 1,
              finalRating : 1,
              progressionByAge : 1,
              minimumAge : 1,
              nextGrade: "$nextJobGrade.gradeName",
              createdAt: 1,
              updatedAt: 1,
            }
          }
        ]
        // call method to service
        let result = await JobGradeService.aggregate(pipeline, req);

        if (result?.length==0) {
            return res.status(404).send("JobGrade not found in the database");
        }
        return apiResponse.successResponseWithData(res, "Successfully Get result.", result)
       // return res.status(200).send(result);
    } catch (error) {
        console.error(error);
        res.status(400).send(error.message);
    }
  };

  findAll = async (req, res, next) => {
    try {
      console.log("Find JobGrade, Data By: " + JSON.stringify(req.params));
      let pipeline  = [
        
        {
          $lookup: {
            from: "jobGrade",
            localField: "nextGrade",
            foreignField: "uuid",
            as: "nextJobGrade"
          }
        },
        {
          $unwind: {
            path: "$nextJobGrade",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            uuid: 1,
            gradeId: 1,
            gradeName: 1,
            effectiveDate: 1,
            status: 1,
            description: 1,
            gradeSalaryRangeMinimum: 1,
            gradeSalaryRangeMidPoint: 1,
            gradeSalaryRangeMaximum : 1,
            progressionByService: 1,
            minimumService : 1,
            maximumService : 1,
            minimumNumberOfReviews : 1,
            progressionByReviewsRatings : 1,
            minimumRating : 1,
            averageRating : 1,
            finalRating : 1,
            progressionByAge : 1,
            minimumAge : 1,
            nextGrade: "$nextJobGrade.gradeName",
            createdAt: 1,
            updatedAt: 1,
          }
        }
      ]
      // call method to service
      let result = await JobGradeService.aggregate(pipeline, req);

      return apiResponse.successResponseWithData(res, "Successfully Get result.", result)
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  findAllLite = async (req, res, next) => {
    try {
      console.log("Find All JobGrade lite, Data By: " + JSON.stringify(req.params));
      
      // call method to service
      let result = await JobGradeService.findWithProjection({}, req);

      return apiResponse.successResponseWithData(res, "Successfully Get result.", result)
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  createJobGrade = async (req, res, next) => {
    try {
      console.log("Create JobGrade, Data By: " + JSON.stringify(req.body));
      let data = req.body;

      // call method to service
      let resp = await JobGradeService.createJobGrade(data, req, res);

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  updateJobGrade = async (req, res, next) => {
    try {
      console.log("Update JobGrade, Data By: " + JSON.stringify(req.body));
      if (!req.body.uuid) throw new Error("UUID is required for update.");
      let data = req.body;

      // call method to service
      let resp = await JobGradeService.updateJobGrade(data, req, res);

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  createAllJobGrades = async (req, res, next) => {
    try {
      let data = req.body;
      if (data?.forValidationOnly == undefined) throw new Error("forValidationOnly is required.");
      // call method to service
      let resp = await JobGradeService.createAllJobGrades(
        data,
        req,
        res
      );

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  generateCSVHeader = async (req, res, next) => {
    try {
      let CSVHeader = [];
      
      CSVHeader.push(
        { label: "JobGrade_Id", key: "gradeId" },
        { label: "JobGrade_Name", key: "gradeName" },
        { label: "Effective_Date(DD/MM/YYYY)", key: "effectiveDate(DD/MM/YYYY)" },
        { label: "Effective_Status", key: "status" },
        { label: "Description", key: "description" },
        { label: "Grade_Salary_Range_Minimum", key :  "gradeSalaryRangeMinimum"},
        { label: "Grade_Salary_Range_MidPoint", key :  "gradeSalaryRangeMidPoint"},
        { label: "Grade_Salary_Range_Maximum", key :  "gradeSalaryRangeMaximum"},
        
        { label: "Progression_By_Service", key: "progressionByService" },
        { label: "Minimum_Service", key: "minimumService" },
        { label: "Maximum_Service", key: "maximumService" },
        
        { label: "Progression_By_Reviews_and_Ratings", key: "progressionByReviewsRatings" },
        { label: "Minimum_Number_Of_Reviews", key: "minimumNumberOfReviews" },
       
        { label: "Minimum_Rating", key: "minimumRating" },
        { label: "Average_Rating", key: "averageRating" },
        { label: "Final_Rating", key: "finalRating" },
        
        { label: "Progression_By_Age", key: "progressionByAge" },
        { label: "MinimumAge", key: "minimumAge" },
        { label: "NextGrade", key: "nextGrade" },
       
      );
      const data = {
        CSVHeader: CSVHeader
      };
      return res.status(200).send(data);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

}

module.exports = new JobGrade();
