import { DEFAULT_PAGE_SIZE } from './abstract-list.args.js';

export abstract class ListArgs {
    first: number = DEFAULT_PAGE_SIZE;
    after?: string;
}
