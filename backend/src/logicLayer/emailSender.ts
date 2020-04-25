import {SendEmailResponse} from "aws-sdk/clients/ses";

const sgMail = require('@sendgrid/mail');
import {ClientResponse} from "@sendgrid/client/src/response";
import * as AWS from "aws-sdk";
import * as AWSXRay from 'aws-xray-sdk'
import {EmailMessage} from "../models/EmailMessage";
import {createLogger} from "../utils/logger";

const XAWS = AWSXRay.captureAWS(AWS);

const SES = new XAWS.SES({region: 'us-east-1'});

const logger = createLogger('emailSender');

const SEND_GRID_API_KEY = process.env.SEND_GRID_API_KEY;

export async function sendEmail(email: EmailMessage) {
    logger.info(`Sending email ${email}`);
    // The education sandbox account didn't have enough permissions for aws ses, so I am using external service
    // return await sendEmailSendGrid(email);
    return await sendEmailSendGrid(email);
}

export async function sendEmailFake(email: EmailMessage) {
    logger.info(email);
}

export async function sendEmailSendGrid(email: EmailMessage) {
    logger.info(SEND_GRID_API_KEY);
    logger.info(email);
    sgMail.setApiKey(SEND_GRID_API_KEY);
    const response: ClientResponse = await sgMail.send(email);
    logger.info(response);
}

export async function sendEmailSES(email: EmailMessage) {
    const sesParams = {
        Destination: {
            ToAddresses: [email.to],
        },
        Message: {
            Body: {
                Text: {
                    Charset: 'UTF-8',
                    Data: email.text,
                },
                // Supports HTML also
            },
            Subject: {
                Charset: 'UTF-8',
                Data: email.subject,
            },
        },
        Source: email.from,
    };

    const response: SendEmailResponse = await SES.sendEmail(sesParams).promise();
    logger.info(response);
}
