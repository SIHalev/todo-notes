import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'
import 'source-map-support/register'
import {createLogger} from "../../utils/logger";
import {getUserEmail, getUserId} from "../utils";
import {getAllTodos} from "../../logicLayer/todos";

const logger = createLogger('uploadTodoImage');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Processing event: ${event}`);
    const userId = getUserId(event);
    logger.info(`User id ${userId}`);
    logger.info(`User email ${getUserEmail(event)}`); // TODO: remove this from here

    const items = await getAllTodos(userId);
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            items
        })
    };
};
