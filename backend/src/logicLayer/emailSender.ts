import {SendEmailResponse} from "aws-sdk/clients/ses";

const sgMail = require('@sendgrid/mail');
import {ClientResponse} from "@sendgrid/client/src/response";
import * as AWS from "aws-sdk";
import * as AWSXRay from 'aws-xray-sdk'
import {EmailMessage} from "../models/EmailMessage";
import {createLogger} from "../utils/logger";

const XAWS = AWSXRay.captureAWS(AWS);

const secretManager = new AWS.SecretsManager();
let cachedSecret: string; // Only for testing reuse. For PRD it will not be stored, because we invoke once a day

const SES = new XAWS.SES({region: 'us-east-1'});

const logger = createLogger('emailSender');

const secretId = process.env.SEND_GRID_SECRET_ID;
const secretField = process.env.SEND_GRID_SECRET_FIELD;

export async function sendEmail(email: EmailMessage) {
    logger.info(`Sending email ${email}`);
    // The education sandbox account didn't have enough permissions for aws ses, so I am using external service
    return await sendEmailSendGrid(email);
}

// For testing purposes
export async function sendEmailFake(email: EmailMessage) {
    logger.info(email);
}

export async function sendEmailSendGrid(email: EmailMessage) {
    logger.info(email);
    const secretObject: any = await getSecret();
    const secretKey = secretObject[secretField];
    sgMail.setApiKey(secretKey);
    const response: ClientResponse = await sgMail.send(email);
    logger.info(response);
}

async function getSecret() {
    if (!cachedSecret) {
        logger.info("Fetching send grid secret key");
        const data = await secretManager.getSecretValue({
            SecretId: secretId
        }).promise();

        cachedSecret = JSON.parse(data.SecretString);
    }

    return cachedSecret;
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
