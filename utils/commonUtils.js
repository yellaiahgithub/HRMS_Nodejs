class CommonUtils {
  constructor() {}
  convertDateToUTC = (date) => {
    date.setTime(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
  };
  removeTimeFromDate = (date) => {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
  };
  addISTDiffTime = (date)=>{
    date.setTime(date.getTime() + ((date.getTimezoneOffset() + 330) * 60 * 1000));
  }
  removeISTDiffTime = (date)=>{
    date.setTime(date.getTime() - ((date.getTimezoneOffset() + 330) * 60 * 1000));
  }

  getListFromConstant=(commonConstant)=>{
    const list=[]
    for (let key in commonConstant) {
      list.push(commonConstant[key])
    }
    return list;
  }
}
module.exports = new CommonUtils();
