import {APIGatewayProxyEvent} from "aws-lambda";
import {parseUserEmail, parseUserId} from "../auth/utils";

/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUserId(event: APIGatewayProxyEvent): string {
    return parseUserId(getJwtToken(event));
}

export function getUserEmail(event: APIGatewayProxyEvent): string {
    return parseUserEmail(getJwtToken(event));
}

export function getJwtToken(event: APIGatewayProxyEvent): string {
    const authorization = event.headers.Authorization;
    const split = authorization.split(' ');
    const jwtToken = split[1];

    return jwtToken;
}
