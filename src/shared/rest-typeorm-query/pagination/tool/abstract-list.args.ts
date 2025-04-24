import { Max } from 'class-validator';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../typeorm/typeorm-connection.js';

export abstract class ListArgs {
    @Max(MAX_PAGE_SIZE)
    first: number = DEFAULT_PAGE_SIZE;
    after?: string;
}
