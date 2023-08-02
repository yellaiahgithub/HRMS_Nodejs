var moment = require("moment"); // require

class JobGradeUtils {
  constructor() {}

  validateJobGrade = async (jobGrade, allJobGrades) => {
    let errors = [];
    if (jobGrade.gradeId == null || jobGrade.gradeId.length == 0) {
      errors.push("Grade Id can not be empty. ");
    }
    if (jobGrade.gradeName == null || jobGrade.gradeName.length == 0) {
      errors.push("Grade Name can not be empty. ");
    }
    if (jobGrade.effectiveDate == null || jobGrade.effectiveDate.length == 0) {
      errors.push("EffectiveDate can not be empty. ");
    } else if (!moment(jobGrade.effectiveDate, "YYYY-MM-DDT00:00:00.000Z").isValid()) {
      errors.push("Invalid EffectiveDate. ");
    }
    if (jobGrade.status == null || jobGrade.status.length == 0 || typeof(jobGrade.status) != "boolean") {
      errors.push("Effective Status can not be empty or invalide. ");
    }
    if (jobGrade.progressionByService == null || jobGrade.progressionByService.length == 0 || typeof(jobGrade.progressionByService) != "boolean" ) {
      errors.push("Progression by Service can not be empty or invalide. ");
    } else if(jobGrade.progressionByService) {
      if(jobGrade.minimumService == null || jobGrade.minimumService.length == 0 || jobGrade.maximumService == null || jobGrade.maximumService.length == 0) {
        errors.push("Progression By Service is set as Yes. So, Minimum and Maximum Services can not be empty. ");
      }
    }

    if (jobGrade.progressionByReviewsRatings == null || jobGrade.progressionByReviewsRatings.length == 0 || typeof(jobGrade.progressionByReviewsRatings) != "boolean" ) {
      errors.push("Progression by reviews and ratings can not be empty or invalide. ");
    } else if(jobGrade.progressionByReviewsRatings) {
      if(!jobGrade.averageRating && !jobGrade.minimumRating && !jobGrade.finalRating) {
        errors.push("Progression By Reviews and Ratings is set as Yes. So, Minimum or Average or Final(Any one) Rating should be there. ");
      }
    }

    if (jobGrade.progressionByAge == null || jobGrade.progressionByAge.length == 0 || typeof(jobGrade.progressionByAge) != "boolean" ) {
      errors.push("Progression by age can not be empty or invalide. ");
    } else if(jobGrade.progressionByAge) {
      if(!jobGrade.minimumAge) {
        errors.push("Progression By Age is set as Yes. So, Minimum Age can not be empty. ");
      }
    }

    if(jobGrade.nextGrade == null || jobGrade.nextGrade.length == 0 ){
      //errors.push("Next Grade can not be empty. ");
      
    } else if(jobGrade.nextGrade){
      if (!allJobGrades?.find((l) => ((l.uuid == jobGrade.nextGrade || l.gradeId == jobGrade.nextGrade) && l.status))) {
        errors.push(
          "Next Grade does not exist - " +
          jobGrade.nextGrade +
            ". "
        );
      }
    }

    return errors;
  };
}
module.exports = new JobGradeUtils();
