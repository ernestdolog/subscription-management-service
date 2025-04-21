import { ErrorMessage } from '#app/shared/error/index.js';

export class KafkaMessageError extends ErrorMessage {
    static MESSAGE_VALIDATION = {
        httpCode: 422,
        name: 'EVENT_CONTENT_INVALID',
        message: 'Event content did not match schema. Topic :topic content :content',
    };
}
