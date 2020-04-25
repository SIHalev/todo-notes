import {DetectModerationLabelsResponse, ModerationLabels} from "aws-sdk/clients/rekognition";
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import {Body} from "aws-sdk/clients/s3";

const XAWS = AWSXRay.captureAWS(AWS);

const rekognition = new XAWS.Rekognition();

export async function isImageSafe(body: Body) {
    const detectModerationResponse: DetectModerationLabelsResponse = await rekognition.detectModerationLabels({
        Image: {
            // Bytes: response.Body,
            Bytes: body,
        },
        MinConfidence: 50
    }).promise();

    const moderationLabels: ModerationLabels = detectModerationResponse.ModerationLabels;
    console.log(`ModerationLabels: ${JSON.stringify(moderationLabels)}`);
    const isSafe:boolean = moderationLabels.length === 0;
    console.log(`is image safe: ${isSafe}`);
    return isSafe;
}
