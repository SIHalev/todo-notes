import {decode} from 'jsonwebtoken'

import {JwtPayload} from './JwtPayload'
import {createLogger} from "../utils/logger";

const logger = createLogger('auth.utils');

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(jwtToken: string): string {
    const decodedJwt = decode(jwtToken) as JwtPayload;
    logger.info(`User information ${JSON.stringify(decodedJwt)}`);
    return decodedJwt.sub
}

export function parseUserEmail(jwtToken: string): string {
    const decodedJwt = decode(jwtToken) as JwtPayload;
    return decodedJwt.email;
}
