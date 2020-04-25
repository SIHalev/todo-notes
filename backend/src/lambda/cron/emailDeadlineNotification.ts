import {createLogger} from "../../utils/logger";
import {sendDeadlineNotifications} from "../../logicLayer/todos";

const logger = createLogger('emailDeadlineNotification');

export const handler = async (event) => {
    logger.info("Trying to send emails");
    logger.info(JSON.stringify(event));

    await sendDeadlineNotifications();

    return {
        statusCode: 204,
        body: null,
    };

};
