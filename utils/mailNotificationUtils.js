const { MAIL_RECEPIENTS, MAIL_NOTIFICATION_TYPE } = require("../constants/commonConstants");
const {
  switchDB,
  getDBModel,
  employeeEmailSchema,
  employeeSchema,
  letterTemplateVariablesSchema
} = require("../middlewares/switchDB");
const conf = require('../conf/conf');
const { sendMail } = require("../helper/SendMail");
const NotificationsService = require("../services/NotificationsService");
const config = require('../config/default.json');
const logger = require('../common/logging/services/logger').loggers.get('general')
const serverURL=config.settings.serverURL
class MailNotificationUtils {
  constructor() {}
  generateMail = async (notificationType, body, req,inputObj={}) => {
    
    const companyName = req.subdomain;
    const DB = await switchDB(companyName, employeeEmailSchema);
    const employeeEmailModel = await getDBModel(DB, "employeeEmail");
    const commonDb = conf.DB_NAME;
    const letterTemplateVariablesDB = await switchDB(commonDb, letterTemplateVariablesSchema);
    const letterTemplateVariablesModel = await getDBModel(
      letterTemplateVariablesDB,
      "letterTemplateVariables"
    );

    //fetch all mail notification variables
    const variables= await letterTemplateVariablesModel.find({templateType:"MailNotification"}).lean();
    
    //validate notification type
    let validType=false;
    for (let key in MAIL_NOTIFICATION_TYPE) {
        if(notificationType===MAIL_NOTIFICATION_TYPE[key]){
            validType=true;
            break;
        }
    }    
    if(!validType)logger.error("Invalid Template Type")

    //fetch notification template based on type
    const query={notificationType:notificationType}
    const notificationtemplate = await NotificationsService.fetchByQuery(query,req)
    //if template is defiened then send mails
    if(notificationtemplate){
      //To mail Ids
      const toEmailTemplate = notificationtemplate.notificationTo?.find(
        (notif) => notif.type.toLowerCase() === "TO".toLowerCase()
      );
      const ccEmailTemplate = notificationtemplate.notificationTo?.find(
        (notif) => notif.type.toLowerCase() === "CC".toLowerCase()
      );
      const bccEmailTemplate = notificationtemplate.notificationTo?.find(
        (notif) => notif.type.toLowerCase() === "BCC".toLowerCase()
      );
      //generate pipeline for to,cc,bcc
      const toPipeline = await this.getPipeline(toEmailTemplate, body, req);
      const ccPipeline = await this.getPipeline(ccEmailTemplate, body, req);
      const bccPipeline = await this.getPipeline(bccEmailTemplate, body, req);

      //if pipeline is not null them fetch corresponding email and employee data
      const toEmails = toPipeline?await employeeEmailModel.aggregate(toPipeline):[];
      const ccEmails = ccPipeline?await employeeEmailModel.aggregate(ccPipeline):[];
      const bccEmails = bccPipeline?await employeeEmailModel.aggregate(bccPipeline):[];

      //filter duplicate mails from cc
      const filteredCcEmails = await ccEmails.filter((ccMail) => {
        if (toEmails.find((toMail) => toMail.uuid === ccMail.uuid)) return false;
        else return true;
      });

      //filter duplicate mails from bcc
      const filteredBccEmails = await bccEmails.filter((bccMail) => {
        if (toEmails.find((toMail) => toMail.uuid === bccMail.uuid)) return false;
        else if (ccEmails.find((ccMail) => ccMail.uuid === bccMail.uuid))
          return false;
        else return true;
      });


      //acknowledgement mailIds
      const ackToEmailTemplate = notificationtemplate.acknowledgeTo?.find(
        (notif) => notif.type.toLowerCase() === "TO".toLowerCase()
      );
      const ackCcEmailTemplate = notificationtemplate.acknowledgeTo?.find(
        (notif) => notif.type.toLowerCase() === "CC".toLowerCase()
      );
      const ackBccEmailTemplate = notificationtemplate.acknowledgeTo?.find(
        (notif) => notif.type.toLowerCase() === "BCC".toLowerCase()
      );

      //generate pipeline for Acknowledgement to,cc,bcc
      const ackToPipeline = await this.getPipeline(ackToEmailTemplate, body, req);
      const ackCcPipeline = await this.getPipeline(ackCcEmailTemplate, body, req);
      const ackBccPipeline = await this.getPipeline(ackBccEmailTemplate, body, req);

      //if pipeline is not null them fetch corresponding email and employee data
      const ackToEmails = ackToPipeline?await employeeEmailModel.aggregate(ackToPipeline):[];
      const ackCcEmails = ackCcPipeline?await employeeEmailModel.aggregate(ackCcPipeline):[];
      const ackBccEmails = ackBccPipeline?await employeeEmailModel.aggregate(ackBccPipeline):[];

      //filter duplicate mails from cc
      const filteredAckCcEmails = await ackCcEmails.filter((ccMail) => {
        if (ackToEmails.find((toMail) => toMail.uuid === ccMail.uuid)) return false;
        else return true;
      });

      //filter duplicate mails from bcc
      const filteredAckBccEmails = await ackBccEmails.filter((bccMail) => {
        if (ackToEmails.find((toMail) => toMail.uuid === bccMail.uuid)) return false;
        else if (ackCcEmails.find((ccMail) => ccMail.uuid === bccMail.uuid))
          return false;
        else return true;
      });

      //find whether ackBody has benefactor related variables
      const hasBenefactor= await this.hasBenefactorVariables(variables,notificationtemplate.acknowledgementBody)
  
      //generateBody
      const toEmailsWithBody=await this.generateBody(toEmails,variables,notificationtemplate.body,false,[],inputObj)
      const ackToEmailsWithBody=await this.generateBody(ackToEmails,variables,notificationtemplate.acknowledgementBody,hasBenefactor,toEmails,inputObj)
      
      const toMailObj = {
        to: toEmailsWithBody,
        cc: filteredCcEmails,
        bcc: filteredBccEmails,
      };
      const ackMailObj={
        to: ackToEmailsWithBody,
        cc: filteredAckCcEmails,
        bcc: filteredAckBccEmails,
      }

      //send Mail
      await this.sendMails(toMailObj,notificationtemplate.subject)
      await this.sendMails(ackMailObj,notificationtemplate.subject)
      const emailObj={
        toMailObj:toMailObj,
        ackMailObj:ackMailObj
      }
      return emailObj;
    }
    else{
      logger.error(`Mail Templte "${notificationType}" not Available to send Mails`)
    }
  };

  //generate pipeline based on template
  getPipeline = async (emailTemplate, body, req) => {
    //if template is null the return null
    if(emailTemplate==null) return null;

    const companyName = req.subdomain;
    const eDB = await switchDB(companyName, employeeSchema);
    const employeeModel = await getDBModel(eDB, "employee");

    //initialize with empty [] to avoid errors while lookup in employee collection
    if (emailTemplate.designationIDs == null) emailTemplate.designationIDs = [];
    if (emailTemplate.roleUUIDs == null) emailTemplate.roleUUIDs = [];
    let employeeUUIDs = [];
    let locations = [];
    let departments=[];

    //benefactor
    if (emailTemplate.recepients.find((rec) => rec.toLowerCase() == MAIL_RECEPIENTS.BENEFACTOR.toLowerCase())) {

      //if mail recepients contails benefactor and body deoes not send benefactor then throw error
      if (body.benefactorUUIDs == null || body.benefactorUUIDs?.length == 0) logger.error("Please send Benefactor uuids");
      
      employeeUUIDs.push(...body.benefactorUUIDs);
    }

    //Benefactors Locations
    if (emailTemplate.recepients.find((rec) => rec.toLowerCase() == MAIL_RECEPIENTS.BENEFACTORS_LOCATION.toLowerCase())) {

      //if mail recepients contails benefactor and body deoes not send benefactor then throw error
      if (body.benefactorUUIDs == null || body.benefactorUUIDs?.length == 0) logger.error("Please send Benefactor uuids");
      
      //fetch all employees with benefactors UUIDs
      const employees = await employeeModel
        .find({ uuid: { $in: body.benefactorUUIDs } }, { location: 1 })
        .lean();
      employees.forEach((emp) => locations.push(emp.location));
    }

    //Benefactor's Department
    if (emailTemplate.recepients.find((rec) => rec.toLowerCase() == MAIL_RECEPIENTS.BENEFACTORS_DEPARTMENT.toLowerCase())) {

      //if mail recepients contails benefactor and body deoes not send benefactor then throw error
      if (body.benefactorUUIDs == null || body.benefactorUUIDs?.length == 0) logger.error("Please send Benefactor uuids");

      //fetch all employees with benefactors UUIDs
      const employees = await employeeModel
        .find({ uuid: { $in: body.benefactorUUIDs } }, { department: 1 })
        .lean();
      employees.forEach((emp) => departments.push(emp.department));
    }

    //initiator
    if (emailTemplate.recepients.find((rec) => rec.toLowerCase() == MAIL_RECEPIENTS.INITIATOR.toLowerCase())) {

      //if mail recepients contails Initiator and body deoes not send initiator uuid then throw error
      if(!body.initiatorUUID)logger.error("send Initiator UUID in body")

      employeeUUIDs.push(body.initiatorUUID);
    }

    //initiators L1
    if (emailTemplate.recepients.find((rec) => rec.toLowerCase() == MAIL_RECEPIENTS.INITIATORS_L1.toLowerCase())) {

      //if mail recepients contails Initiator and body deoes not send initiator uuid then throw error
      if(!body.initiatorUUID)logger.error("send Initiator UUID in body")

      //fetch initiator
      const initiator = await employeeModel.findOne({ uuid: body.initiatorUUID }, { managerUUID: 1, uuid: 1 }).lean();

      if (initiator) employeeUUIDs.push(initiator?.managerUUID);
    }

    //initiators l2
    if (emailTemplate.recepients.find((rec) => rec.toLowerCase() == MAIL_RECEPIENTS.INITIATORS_L2.toLowerCase())) {

      //if mail recepients contails Initiator and body deoes not send initiator uuid then throw error
      if(!body.initiatorUUID)logger.error("send Initiator UUID in body")

      //fetch initiator
      const initiator = await employeeModel.findOne({ uuid: body.initiatorUUID }, { managerUUID: 1, uuid: 1 }).lean();

      if(initiator){
        //fetch initiator's L1 manager
        const l1reportingManager = await employeeModel.findOne({ uuid: initiator.managerUUID },{ managerUUID: 1, uuid: 1 }).lean();
        if (l1reportingManager) employeeUUIDs.push(l1reportingManager?.managerUUID);
      }
    }
    return [
      {
        $match: {
          type: "Official",
        },
      },
      {
        $lookup: {
          from: "employee",
          localField: "employeeUUID",
          foreignField: "uuid",
          pipeline: [
            {
              $match: {
                $or: [
                  { uuid: { $in: employeeUUIDs } },
                  { designation: { $in: emailTemplate.designationIDs } },
                  { roleUUIDs: { $in: emailTemplate.roleUUIDs } },
                  { department: { $in: departments } },
                  { location: { $in: locations } },

                ],
              },
            },
            {
              $lookup: {
                from: "department",
                localField: "department",
                foreignField: "id",
                as: "departmentData",
              },
            },
            {
              $unwind: {
                path: "$departmentData",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "designation",
                localField: "designation",
                foreignField: "id",
                pipeline: [
                  {
                    $lookup: {
                      from: "jobGrade",
                      localField: "jobGrade",
                      foreignField: "gradeId",
                      as:"jobGradeData"
                    }
                  },
                  {
                    $unwind: {
                      path: "$jobGradeData",
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                  {
                    $lookup: {
                      from: "jobBand",
                      localField: "jobLevel",
                      foreignField: "bandId",
                      as:"jobBandData"
                    }
                  },
                  {
                    $unwind: {
                      path: "$jobBandData",
                      preserveNullAndEmptyArrays: true,
                    },
                  }
                ],
                as: "designationData",
              },
            },
            {
              $unwind: {
                path: "$designationData",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "locations",
                localField: "location",
                foreignField: "locationId",
                as: "locationData",
              },
            },
            {
              $unwind: {
                path: "$locationData",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "employee",
                localField: "managerUUID",
                foreignField: "uuid",
                as: "manager",
              },
            },
            {
              $unwind: {
                path: "$manager",
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: "employee",
        },
      },
      {
        $unwind: {
          path: "$employee",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: 0,
          email: 1,
          uuid: 1,
          employeeID: "$employee.id",
          firstName:"$employee.firstName",
          lastName:"$employee.lastName",
          employeeName: {
            $concat: ["$employee.firstName", " ", "$employee.lastName"],
          },
          designation:"$employee.designationData.name",
          location:"$employee.locationData.locationName",
          department:"$employee.departmentData.name",
          employeeUUID: "$employee.uuid",
          jobType:"$employee.jobType",
          managerName: {
            $concat: ["$employee.manager.firstName", " ", "$employee.manager.lastName"],
          },
          userId:"$employee.userId",
          gender:"$employee.gender",
        },
      },
    ];
  };

  //check wether body has benefactor related varaibles or not
  hasBenefactorVariables = async (variables,body)=>{
    let tempBody = body
    //since variables in collection have '<' , '>' symbols instead of '&lt;', '&gt;' we have to replace from html content of body
    tempBody = tempBody?.replace(new RegExp('&lt;', 'g'), '<');
    tempBody = tempBody?.replace(new RegExp('&gt;', 'g'), '>');
    let hasBenefactor = false;
    for(let i = 0; i < variables.length; i++){
      const variable = variables[i];
      if(variable.type.toLowerCase() === "Benefactor".toLowerCase()){
        if(tempBody?.includes(variable.name)){
          hasBenefactor = true;
          break;
        }
      }
    }
    return hasBenefactor;
  }

  //generate Mail Body
  generateBody = async(employees,variables,body,hasBenefactor=false,benefactors=[],inputObj={})=>{
    //if not Acknowledgement body
    if(!hasBenefactor){
      employees.forEach(async(employee)=>{
        let tempBody=body;
        //since variables in collection have '<' , '>' symbols instead of '&lt;', '&gt;' we have to replace from html content of body
        tempBody = tempBody?.replace(new RegExp('&lt;', 'g'), '<');
        tempBody = tempBody?.replace(new RegExp('&gt;', 'g'), '>');
        //replace template variables with corresponding value
        tempBody = await this.replaceVariables(tempBody,variables,employee,{},inputObj)
        employee.body=tempBody         
      })
      return employees;
    }
    //for acknowledgement body generation
    else{
      const ackEmployees=[]
      //In order to replace benefactor's details in acknowledgement body we have to iterate through all benefactors
      //if there are 2 benefactors and 1 acknowledge 'to' then after this loop there will be two acknowledge mails instead of one
      benefactors.forEach(async (benefactor)=>{
        await employees.forEach(async(employee)=>{
          let tempBody=body

          //for each benefactor seperate mail has to create so we have to deep clone 
          let ackEmployee=JSON.parse(JSON.stringify(employee));

          //since variables in collection have '<' , '>' symbols instead of '&lt;', '&gt;' we have to replace from html content of body
          tempBody = tempBody?.replace(new RegExp('&lt;', 'g'), '<');
          tempBody = tempBody?.replace(new RegExp('&gt;', 'g'), '>');
          //replace template variables with corresponding value
          tempBody=await this.replaceVariables(tempBody,variables,ackEmployee,benefactor,inputObj)
          ackEmployee.body=tempBody  
          ackEmployees.push(ackEmployee)   
        })
      }) 
      return ackEmployees 
    }
  }

  //replace variables with corresponding values in body
  replaceVariables = async (tempBody,variables,employee,benefactor,inputObj)=>{
    variables.forEach(variable => {
      //if variable type is Employee
      if(variable.type.toLowerCase()==="Employee".toLowerCase()){
        tempBody=employee[variable.mappingName]?tempBody?.replace(new RegExp(variable.name, 'g'), employee[variable.mappingName]) : tempBody;
      }
      //if variable type is Employee
      if(variable.type.toLowerCase()==="ResetPassword".toLowerCase()){

      }
      //if variable type is LoginURL
      if(variable.type.toLowerCase()==="LoginURL".toLowerCase()){
        tempBody = serverURL ? tempBody?.replace(RegExp(variable.name, 'g'), serverURL) : tempBody;
      }
      //if variable type is Benefactor
      if(variable.type.toLowerCase()==="Benefactor".toLowerCase()){
        tempBody = benefactor[variable.mappingName] ? tempBody?.replace(new RegExp(variable.name, 'g'), benefactor[variable.mappingName]) : tempBody;
      }
      //if variable type is input
      if(variable.type.toLowerCase()==="input".toLowerCase()){
        tempBody = inputObj[variable.mappingName] ? tempBody?.replace(new RegExp(variable.name, 'g'), inputObj[variable.mappingName]) : tempBody;
      }
    });
    return tempBody;
  }

  //send Mails
  sendMails= async(mailObj,subject)=>{
    //send mails to all mail ids inside to array
    mailObj.to.forEach(mail=>{
      const obj={
        to:[mail.email],
        cc:mailObj.cc,
        bcc:mailObj.bcc,
        template:mail.body,
        subject:subject
      }
      sendMail(obj)
    })
  }
}

module.exports = new MailNotificationUtils();
