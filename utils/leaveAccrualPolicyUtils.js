const { LEAVEACCRUALPOLICY_RULES_ELIGIBLELEAVE_UNIT_LIST, LEAVEACCRUALPOLICY_RULES_ACCRUALAFTER_UNIT_LIST, LEAVEACCRUALPOLICY_RULES_ACCRUALFREQUENCY_LIST, LEAVEACCRUALPOLICY_ACCRUALCRITERIA_LIST } = require("../constants/commonConstants")

class leaveAccrualPolicyUtils{
    eligibleLeaveUnitList=LEAVEACCRUALPOLICY_RULES_ELIGIBLELEAVE_UNIT_LIST
    accrualAfterUnitList=LEAVEACCRUALPOLICY_RULES_ACCRUALAFTER_UNIT_LIST
    accrualFrequencyList=LEAVEACCRUALPOLICY_RULES_ACCRUALFREQUENCY_LIST
    accrualCriteriaList=LEAVEACCRUALPOLICY_ACCRUALCRITERIA_LIST
    constructor(){}
    validateSavingData(data){
        const errors=[]
        if(data.id==null)errors.push("\nId is Mandatory.")
        if(data.leaveTypeUUID==null)errors.push("\nLeave Type is Mandatory.")
        if(data.accrualCriteria==null)errors.push("\nAccrual Criteria is Mandatory.")
        else if(!this.accrualCriteriaList.find(accuralCriteria=>accuralCriteria===data.accrualCriteria)) errors.push("\nInvalid Accrual Criteria.")
        if(data.description==null)errors.push("\nDescription is Mandatory.")
        data.rules.forEach((rule,index)=>{
            if(!this.accrualFrequencyList.find(accrualFrequency=>accrualFrequency===rule.accrualFrequency)) errors.push("\nError at Rule No."+(index+1)+". Invalid Accrual Frequency.")
            if(rule.fromService==null) errors.push("\nError at Rule No."+(index+1)+". 'From Service' is Mandatory")
            else if(rule.fromService>70||rule.fromService<1) errors.push("\nError at Rule No."+(index+1)+". 'From Service' Should be within 1-70")
            if(rule.toService==null) errors.push("\nError at Rule No."+(index+1)+". 'To Service' is Mandatory")
            else if(rule.toService>70||rule.toService<1) errors.push("\nError at Rule No."+(index+1)+". 'To Service' Should be within 1-70")
            if(rule.accrualAfter==null) errors.push("\nError at Rule No."+(index+1)+". Accrual After is Mandatory")
            if(rule.accrualAfter.unit==null) errors.push("\nError at Rule No."+(index+1)+". Accrual After unit is Mandatory")
            if(rule.accrualAfter.value==null) errors.push("\nError at Rule No."+(index+1)+". Accrual After value is Mandatory")
            if(!this.accrualAfterUnitList.find(unit=>unit===rule.accrualAfter.unit)) errors.push("\nError at Rule No."+(index+1)+". Invalid Accrual After Unit.")
            if(rule.eligibleLeave==null) errors.push("\nError at Rule No."+(index+1)+". Eligible Leave is Mandatory")
            if(rule.eligibleLeave.count==null) errors.push("\nError at Rule No."+(index+1)+". Eligible Leave count is Mandatory")
            if(rule.eligibleLeave.unit==null) errors.push("\nError at Rule No."+(index+1)+". Eligible Leave unit is Mandatory")    
            if(!this.eligibleLeaveUnitList.find(unit=>unit===rule.eligibleLeave.unit)) errors.push("\nError at Rule No."+(index+1)+". Invalid Eligible Leave Unit.")
            if(rule.fromService>rule.toService) errors.push("\nError at Rule No."+(index+1)+". 'From Service' can not be greater than 'To Service'")
        })
        if(errors.length>0)throw new Error(errors.toString())
    }
}
module.exports = new leaveAccrualPolicyUtils();
