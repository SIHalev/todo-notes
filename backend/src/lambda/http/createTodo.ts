import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'
import 'source-map-support/register'

import {CreateTodoRequest} from '../../requests/CreateTodoRequest'
import {getUserEmail, getUserId} from "../utils";
import {createLogger} from "../../utils/logger";
import {createTodo} from "../../logicLayer/todos";
import {TodoItem} from "../../models/TodoItem";

const logger = createLogger('createTodo');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Processing event: ${event}`);

    const userId: string = getUserId(event);
    const email: string = getUserEmail(event); // We can also use the email as a userId if we want it mandatory
    const parsedTodoBody: CreateTodoRequest = JSON.parse(event.body);



    const newTodo: TodoItem = await createTodo(userId, email, parsedTodoBody);
    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            item: newTodo
        })
    }
};
