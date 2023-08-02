class leaveControlsUtils{
    approvalPathLevelList=["Level 1", "Level 2", "Level 3", "Level 4", "Level 5"]
    approvalPathApproverList=["Reporting Manager", "L2", "Role"]
    adjustLeavesLimitUnitList=["Days", "Weeks", "Months"]
    escalationLevelList=["Level 1", "Level 2", "Level 3", "Level 4", "Level 5"]
    escalationCriteria1List=[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    escalationCriteria2List=["Reminder", "Escalation"]
    escalationToList=["L2", "Role"]
    constructor(){}
    validateSavingData(data){
        const errors=[]
        if(data.approvalRequiredForCancellation){
            if(data.cancellationApprovalPath==null||data.cancellationApprovalPath.length==0) errors.push("\nCancellation Approval Path can not be empty.")
            else{
                data.cancellationApprovalPath.forEach((cancellationPath, index)=>{
                    if(cancellationPath.level==null)errors.push("\nError at Cancellation Approval Path No."+(index+1)+". Level is Mandatory.")
                    else if(!this.approvalPathLevelList.find(level=>level===cancellationPath.level))errors.push("\nError at Cancellation Approval Path No."+(index+1)+". Invalid Level.")
                    else if(data.cancellationApprovalPath.find((tempCancellationPath,tempIndex)=>tempCancellationPath.level===cancellationPath.level && index!=tempIndex))errors.push("\nError at Cancellation Approval Path No."+(index+1)+". Duplicate Level '"+cancellationPath.level+"' in Cancellation Approval Path is not allowed.")
                    if(cancellationPath.approver==null)errors.push("\nError at Cancellation Approval Path No."+(index+1)+". Approver is Mandatory.")
                    else if(!this.approvalPathApproverList.find(approver=>approver===cancellationPath.approver))errors.push("\nError at Cancellation Approval Path No."+(index+1)+". Invalid Approver.")
                    else if(data.cancellationApprovalPath.find((tempCancellationPath,tempIndex)=>tempCancellationPath.approver===cancellationPath.approver && index!=tempIndex))errors.push("\nError at Cancellation Approval Path No."+(index+1)+". Duplicate Approver '"+cancellationPath.approver+"' in Cancellation Approval Path is not allowed.")
                    if(cancellationPath.approver==="Role" && !cancellationPath.approverRoleUUID)errors.push("\nError at Cancellation Approval Path No."+(index+1)+". Role is Required.")
                })
            }
        }
        if(data.isLimitationOnAdjustLeaves){
            if(data.adjustLeavesLimit==null) errors.push("\nAdjust Leave Limit can not be empty.")
            else{
                if(data.adjustLeavesLimit.value==null) errors.push("\nAdjust Leave Limit can not be empty.")
                if(data.adjustLeavesLimit.unit==null) errors.push("\nAdjust Leave Limit can not be empty.")
                else if(!this.adjustLeavesLimitUnitList.find(unit=>unit===data.adjustLeavesLimit.unit)) errors.push("\nInvalid Adjust Leave Limit Unit.")
            }
        }
        if(data.allowLeaveDuringNoticePeriod){
            if(data.leaveDuringNoticePeriod==null) errors.push("\nLeave during Notice Period can not be empty.")
            else{
                if(data.leaveDuringNoticePeriod.maxDays==null) errors.push("\nMax Days to apply Leave During Notice Period can not be empty.")
                if(data.leaveDuringNoticePeriod.leaveTypes==null || data.leaveDuringNoticePeriod.leaveTypes.length==0) errors.push("\nLeave Type During Notice Period can not be empty.")
            }
        }
        if(data.approvalPath==null||data.approvalPath.length==0) errors.push("\n Approval Path can not be empty.")
        else{
            data.approvalPath.forEach((approvalPath, index)=>{
                if(approvalPath.level==null)errors.push("\nError at Approval Path No."+(index+1)+". Level is Mandatory.")
                else if(!this.approvalPathLevelList.find(level=>level===approvalPath.level))errors.push("\nError at  Approval Path No."+(index+1)+". Invalid Level.")
                else if(data.approvalPath.find((tempApprovalPath,tempIndex)=>tempApprovalPath.level===approvalPath.level && index!=tempIndex))errors.push("\nError at  Approval Path No."+(index+1)+". Duplicate Level '"+approvalPath.level+"' in  Approval Path is not allowed.")
                if(approvalPath.approver==null)errors.push("\nError at Approval Path No."+(index+1)+". Approver is Mandatory.")
                else if(!this.approvalPathApproverList.find(approver=>approver===approvalPath.approver))errors.push("\nError at  Approval Path No."+(index+1)+". Invalid Approver.")
                else if(data.approvalPath.find((tempApprovalPath,tempIndex)=>tempApprovalPath.approver===approvalPath.approver && index!=tempIndex))errors.push("\nError at  Approval Path No."+(index+1)+". Duplicate Approver '"+approvalPath.approver+"' in  Approval Path is not allowed.")
                if(approvalPath.approver==="Role" && !approvalPath.approverRoleUUID)errors.push("\nError at  Approval Path No."+(index+1)+". Role is Required.")
            })
        }
        if(data.remindUnapprovedLeaves){
            if(data.remindUnapprovedLeavesBefore==null)errors.push("\n Remind Unapproved Leaves Before Days can not be empty.")
            if(data.keepReminding){
                if(data.keepRemindingFrequency==null)errors.push("\n Keep Remainding Frequency can not be empty.")
            }
            if(data.escalationRequired){
                if(data.escalation==null || data.escalation.length==0)errors.push("\n Keep Remainding Frequency can not be empty.")
                else{
                    data.escalation.forEach((escalation,index)=>{
                        if(data.escalation.find((tempescalation,tempIndex)=>JSON.stringify(escalation)===JSON.stringify(tempescalation) && index!=tempIndex))errors.push("\nError at Escalation No."+(index+1)+" is Duplicated which is not allowed.")
                        //escalation level validation
                        if(escalation.level==null)errors.push("\nError at Escalation No."+(index+1)+". Level is Mandatory.")
                        else if(!this.escalationLevelList.find(level=>level===escalation.level))errors.push("\nError at  Escalation No."+(index+1)+". Invalid Level.")
                        //escalation criteria 1 validation
                        if(escalation.criteria1==null)errors.push("\nError at Escalation No."+(index+1)+". Criteria 1 is Mandatory.")
                        else if(!this.escalationCriteria1List.find(criteria1=>criteria1===escalation.criteria1))errors.push("\nError at  Escalation No."+(index+1)+". Invalid Criteria 1.")
                        //escalation criteria 2 validation
                        if(escalation.criteria2==null)errors.push("\nError at Escalation No."+(index+1)+". Criteria 2 is Mandatory.")
                        else if(!this.escalationCriteria2List.find(criteria2=>criteria2===escalation.criteria2))errors.push("\nError at  Escalation No."+(index+1)+". Invalid Criteria 2.")
                        //escalation To validation
                        if(escalation.to==null)errors.push("\nError at Escalation No."+(index+1)+". To is Mandatory.")
                        else if(!this.escalationToList.find(to=>to===escalation.to))errors.push("\nError at  Escalation No."+(index+1)+". Invalid To.")
                        if(escalation.to==="Role" && !escalation.toRoleUUID)errors.push("\nError at  Escalation No."+(index+1)+". Role is Required.")
                    })
                }
            }
        }
        if(errors.length>0)throw new Error(errors.toString())
    }
}

module.exports = new leaveControlsUtils();
