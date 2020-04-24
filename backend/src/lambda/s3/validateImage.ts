import {SNSEvent, SNSHandler} from 'aws-lambda'
import 'source-map-support/register'
import {validateImage} from "../../logicLayer/todos";
import {createLogger} from "../../utils/logger";


const logger = createLogger('validateImage');

export const handler: SNSHandler = async (event: SNSEvent) => {
    logger.info(`Processing SNS event ${JSON.stringify(event)}`);
    for (const snsRecord of event.Records) {
        const s3EventStr = snsRecord.Sns.Message;
        logger.info(`Processing S3 event ${s3EventStr}`);
        const s3Event = JSON.parse(s3EventStr);

        for (const record of s3Event.Records) {
            await validateImage(record.s3.object.key);
        }
    }
};
