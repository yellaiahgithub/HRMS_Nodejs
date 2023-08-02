const { LEAVEACCUMULATIONPOLICY_RULES_ACCUMULATIONLIMIT_UNIT_LIST, LEAVEACCUMULATIONPOLICY_RULES_CARRYFORWARDLIMIT_UNIT_LIST } = require("../constants/commonConstants")

class leaveAccumulationPolicyUtils {
    carryForwardLimitUnitList=LEAVEACCUMULATIONPOLICY_RULES_CARRYFORWARDLIMIT_UNIT_LIST
    accumulationLimitUnitList=LEAVEACCUMULATIONPOLICY_RULES_ACCUMULATIONLIMIT_UNIT_LIST

    constructor(){}
    validateSavingData(data){
        const errors=[]
        if(data.id==null)errors.push("\nId is Mandatory.")
        if(data.leaveTypeUUID==null)errors.push("\nLeave Type UUID is Mandatory.")
        if(data.description==null)errors.push("\nDescription is Mandatory.")
        data.rules.forEach((rule,index)=>{
            if(rule.fromService==null) errors.push("\nError at Rule No."+(index+1)+". 'From Service' is Mandatory")
            else if(rule.fromService>70||rule.fromService<1) errors.push("\nError at Rule No."+(index+1)+". 'From Service' Should be within 1-70")
            if(rule.toService==null) errors.push("\nError at Rule No."+(index+1)+". 'To Service' is Mandatory")
            else if(rule.toService>70||rule.toService<1) errors.push("\nError at Rule No."+(index+1)+". 'To Service' Should be within 1-70")
            if(rule.carryForwardLimit==null) errors.push("\nError at Rule No."+(index+1)+". Carry Forward Limit is Mandatory")
            if(rule.carryForwardLimit?.unit==null) errors.push("\nError at Rule No."+(index+1)+". Carry Forward Limit unit is Mandatory")
            if(rule.carryForwardLimit?.value==null) errors.push("\nError at Rule No."+(index+1)+". Carry Forward Limit value is Mandatory")
            if(!this.carryForwardLimitUnitList.find(unit=>unit===rule.carryForwardLimit?.unit)) errors.push("\nError at Rule No."+(index+1)+". Invalid Carry Forward Limit Unit.")
            if(rule.allowAccumulation){
                if(rule.accumulationLimit==null) errors.push("\nError at Rule No."+(index+1)+". Accumulation Limit is Mandatory")
                if(rule.accumulationLimit?.value==null) errors.push("\nError at Rule No."+(index+1)+". Accumulation Limit Value is Mandatory")
                if(rule.accumulationLimit?.unit==null) errors.push("\nError at Rule No."+(index+1)+". Accumulation Limit unit is Mandatory")    
                if(!this.accumulationLimitUnitList.find(unit=>unit===rule.accumulationLimit?.unit)) errors.push("\nError at Rule No."+(index+1)+". Invalid Accumulation Limit Unit.")
            }
            if(rule.fromService>rule.toService) errors.push("\nError at Rule No."+(index+1)+". 'From Service' can not be greater than 'To Service'")
        })
        if(errors.length>0)throw new Error(errors.toString())
    }
}

module.exports = new leaveAccumulationPolicyUtils();
