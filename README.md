# Serverless Improved TODO

## What is the idea
I really liked the serverless Udacity assigment, so I figure out that I would have some fun improving it.

## Image recognition
#### When the user uploads an image, now we verify it via image recognition
We have two buckets one for user upload and one for filtered by recognition
When the user is uploading a new image this is published to a topic and a recognition lambda is triggered via SNS event
If there are labels that are inappropriate with certainty at least 50%, the image is deleted

The users receive a future link so he will get the image when it's done.

## Email notifications
The aoth0 now wants additional email access
Everyday at 08:00 a lambda is triggered that is getting not finished items with due date of today.
Email is send via ~~AWS SES~~ SendGrid. The API key is encrypted in the AWS Secrets Manager. I will provide a key for testing.

### There are also other minor improvements

# How to run the application

## Backend

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```

## Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```
cd client
npm install
npm run start
```

This should start a development server with the React application that will interact with the serverless TODO application.
