import { randomUUID } from 'node:crypto';

/**
 * This class is responsible for generating a new request id.
 */
export class RequestId {
    private requestId = '';

    constructor(inputRequestId?: string | null) {
        this.setRequestId(inputRequestId);
    }
    /**
     * Generated id within the instance.
     */
    get value(): string {
        return this.requestId;
    }

    private setRequestId(inputRequestId?: string | null) {
        this.requestId = inputRequestId ?? randomUUID();
    }
}
