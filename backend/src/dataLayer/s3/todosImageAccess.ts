import {createLogger} from "../../utils/logger";
import * as AWS from "aws-sdk";
import * as AWSXRay from 'aws-xray-sdk'
import {Body, GetObjectOutput} from "aws-sdk/clients/s3";

const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger('dataLayer');

export class TodosImageAccess {

    constructor(
        private readonly s3 = new XAWS.S3({signatureVersion: 'v4'}),
        private readonly imagesBucketName = process.env.TODOS_IMAGES_S3_BUCKET,
        private readonly filteredImagesBucketName = process.env.FILTERED_TODOS_IMAGES_S3_BUCKET,
        private readonly signedUrlExpiration = process.env.SIGNED_URL_EXPIRATION
    ) {
        // NO-OP
    }

    getImageAttachmentUrl(imageId: string): string {
        const attachmentUrl = `https://${this.imagesBucketName}.s3.amazonaws.com/${imageId}`;
        logger.info(`S3 Image link ${attachmentUrl}`);
        return attachmentUrl;
    }

    async getImageAttachmentBody(imageId: string) {
        const response: GetObjectOutput = await this.s3
        .getObject({
            Bucket: this.imagesBucketName,
            Key: imageId
        }).promise();

        return response.Body;
    }


    getValidatedAttachmentUrl(imageId: string): string {
        const attachmentUrl = `https://${this.filteredImagesBucketName}.s3.amazonaws.com/${imageId}`;
        logger.info(`S3 Image link ${attachmentUrl}`);
        return attachmentUrl;
    }

    async deleteImageAttachmentUrl(imageId: string) {
        logger.info(`Deleting processed image ${imageId} from bucket ${this.imagesBucketName}`);
        await this.s3
        .deleteObject({
            Bucket: this.imagesBucketName,
            Key: imageId
        }).promise();
    }

    async putValidatedAttachment(imageId: string, body: Body) {
        logger.info(`Writing image back to S3 bucket: ${this.filteredImagesBucketName}`);
        await this.s3
        .putObject({
            Bucket: this.filteredImagesBucketName,
            Key: imageId,
            Body: body
        }).promise();
    }

    async deleteValidatedImageAttachment(imageId: string) {
        await this.s3
        .deleteObject({
            Bucket: this.filteredImagesBucketName,
            Key: imageId
        }).promise();
    }

    getImageUploadUrl(imageId: string): string {
        const signedUrl = this.s3.getSignedUrl('putObject', {
            Bucket: this.imagesBucketName,
            Key: imageId,
            Expires: this.signedUrlExpiration
        });

        logger.info(`S3 Image link ${signedUrl}`);
        return signedUrl;
    }

}
