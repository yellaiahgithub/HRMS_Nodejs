class SeparationControlUtils {
  constructor() {}
  getNoticePeriod = async (employee, separationCriteria) => {
    let noticePeriods = [];
    const generalNoticePeriod =
      separationCriteria?.noticePeriodSetup.noticePeriodArray.find(
        (temp) =>
          temp.noticePeriodFor ===
          employee[separationCriteria.noticePeriodSetup.setupBy]
      );
    noticePeriods.push(generalNoticePeriod);
    separationCriteria.noticePeriodSetup.exceptionArray.forEach(
      (exceptionCase) => {
        if (exceptionCase.value === employee[exceptionCase.criteria])
          noticePeriods.push(exceptionCase);
      }
    );
    noticePeriods.sort((a, b) => a.priority - b.priority);
    console.log(noticePeriods);
    return noticePeriods[0];
  };
  getNoticePeriodValue = async (noticePeriodObject) => {
    return noticePeriodObject.noticePeriod + " " + noticePeriodObject.unit;
  };
  getLastWorkingDate = async (noticePeriodObject) => {
    let lastWorkingDay = new Date();
    if (noticePeriodObject?.unit?.toLowerCase() == "Days".toLowerCase()) {
      lastWorkingDay.setDate(
        lastWorkingDay.getDate() + Number(noticePeriodObject.noticePeriod)
      );
    }
    if (noticePeriodObject?.unit?.toLowerCase() == "Weeks".toLowerCase()) {
      lastWorkingDay.setDate(
        lastWorkingDay.getDate() + Number(noticePeriodObject.noticePeriod) * 7
      );
    }
    if (noticePeriodObject?.unit?.toLowerCase() == "Months".toLowerCase()) {
      lastWorkingDay.setMonth(
        lastWorkingDay.getMonth() + Number(noticePeriodObject.noticePeriod)
      );
    }
    return lastWorkingDay;
  };
}
module.exports = new SeparationControlUtils();
