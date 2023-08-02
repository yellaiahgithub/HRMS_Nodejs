const AWS = require('aws-sdk');
const config = require('../config/default.json')
const SES_CONFIG = {
    accessKeyId: 'AKIATOBVMLON5UEOT5HN',
    secretAccessKey: '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',
    region: 'ap-south-1',
};

const AWS_SES = new AWS.SES(SES_CONFIG);

const sendMail = (mailbody) => {
  try{
    mailbody.cc=mailbody.cc?.length>0?mailbody.cc:[]
    mailbody.bcc=mailbody.bcc?.length>0?mailbody.bcc:[]
    let params = {
      Source: config.settings.server.email,
      Destination: {
        ToAddresses: [
          ...mailbody.to
        ],
        CcAddresses:[
          ...mailbody.cc
        ],
        BccAddresses:[
          ...mailbody.bcc
        ]
      },
      ReplyToAddresses: [],
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: mailbody.template,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: mailbody.subject,
        }
      },
    };
    return AWS_SES.sendEmail(params).promise();

    // return AWS_SES.sendEmail(params, (err, data) => {
    //   if (err) 
    //   throw new Error(err);
    //   else 
    //     return (data)
    // }).promise()
    
  } catch(err) {
    throw new Error(err);
  }
};

let sendTemplateEmail = (mailbody) => {
  try {
    mailbody.cc=mailbody.cc?.length>0?mailbody.cc:[]
    mailbody.bcc=mailbody.bcc?.length>0?mailbody.bcc:[]
    let params = {
      Source: config.settings.server.email,
      Template: mailbody.template,
      Destination: {
        ToAddresse: [ 
          ...mailbody.to
        ],
        CcAddresses:[
          ...mailbody.cc
        ],
        BccAddresses:[
          ...mailbody.bcc
        ]
      },
      TemplateData: '{ \"name\':\'John Doe\'}'
    };
    return AWS_SES.sendTemplatedEmail(params).promise();
  } catch(err) {
    return next(err)
  }
};

module.exports = {
  sendMail,
  sendTemplateEmail,
};