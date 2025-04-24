import { DEFAULT_PAGE_SIZE } from '../typeorm/typeorm-connection.js';

export abstract class ListArgs {
    first: number = DEFAULT_PAGE_SIZE;
    after?: string;
}
