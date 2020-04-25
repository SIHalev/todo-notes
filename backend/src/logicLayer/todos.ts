import {TodoItem} from "../models/TodoItem";
import {CreateTodoRequest} from "../requests/CreateTodoRequest";

import * as uuid from 'uuid'
import {TodoUpdate} from "../models/TodoUpdate";
import {UpdateTodoRequest} from "../requests/UpdateTodoRequest";
import {TodosImageAccess} from "../dataLayer/s3/todosImageAccess";
import {TodosAccess} from "../dataLayer/dynamodb/todosAccess";
import {isImageSafe} from "../utils/recognition";
import {createLogger} from "../utils/logger";
import {sendEmail} from "./emailSender";
import {EmailMessage} from "../models/EmailMessage";

const todosAccess = new TodosAccess();
const todosImageAccess = new TodosImageAccess();

const logger = createLogger('logic');

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
    return todosAccess.getAllTodos(userId);
}

export async function makeUploadUrl(userId: string, todoId: string): Promise<string> {
    const imageId = todoId; // Lets bind s3 image names with todoId's for easy management
    const uploadUrl = todosImageAccess.getImageUploadUrl(imageId);
    // Validated image will appear there when validated
    const attachmentUrl = todosImageAccess.getValidatedAttachmentUrl(imageId);

    await todosAccess.updateTodoAttachUrl(userId, todoId, attachmentUrl);
    return uploadUrl;
}

export async function createTodo(userId: string, email: string, createTodoRequest: CreateTodoRequest): Promise<TodoItem> {
    const todoId = uuid.v4();
    const createdAt: string = new Date().toISOString();

    const newTodo: TodoItem = {
        userId,
        todoId,
        createdAt,
        email,
        done: false,
        attachmentUrl: null,
        ...createTodoRequest
    };

    return todosAccess.createTodo(newTodo);
}

export async function updateTodo(userId: string, todoId: string, updateTodoRequest: UpdateTodoRequest): Promise<TodoUpdate> {

    const todoUpdate: TodoUpdate = {
        ...updateTodoRequest
    };

    return todosAccess.updateTodo(userId, todoId, todoUpdate);
}

export async function deleteTodo(userId: string, todoId: string): Promise<string> {
    // TODO: remove stored attachments
    return todosAccess.deleteTodo(userId, todoId);
}

export async function validateImage(imageId: string) {
    const body = await todosImageAccess.getImageAttachmentBody(imageId);

    const isSafe: boolean = await isImageSafe(body);
    if (isSafe) {
        await todosImageAccess.putValidatedAttachment(imageId, body);
    }

    await todosImageAccess.deleteImageAttachmentUrl(imageId);
}

export async function sendDeadlineNotifications() {
    const from: string = "sihalev@gmail.com";
    const subject: string = "TODO Deadline is today";

    const deadline = new Date().toISOString().slice(0,10);
    logger.info(`Current date is ${deadline}`);

    const deadlineTodos: TodoItem[] = await todosAccess.getAllDeadlineTodos(deadline);
    logger.info(`Returning total todos ${deadlineTodos.length}`);

    // We can also apply filter only to send one email per client
    for (let todo of deadlineTodos) {
        if (todo.email) {
            const emailMessage: EmailMessage = {
                from: from,
                to: todo.email,
                subject: subject,
                text: `You need to do ${todo.name} till today!`
            };

            await sendEmail(emailMessage);
        }
    }
}
