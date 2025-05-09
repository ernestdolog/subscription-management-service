import { User } from '#app/shared/authorization/tool/authorization.user.entity.js';
import { CustomFiltering, FilterInputType } from '../../where-filter/index.js';
import { IConnection } from './connection.interface.js';
import { OrderByDirection } from './order-by.enum.js';

export type QueryConnection<ResponseObject> = new (
    filters: FilterInputType,
    orderBy?: { field: string; direction: OrderByDirection },
    page?: { first: number; after?: string },
    search?: string,
    customFiltering?: CustomFiltering,
    user?: User,
) => IQueryConnection<ResponseObject>;

export interface IQueryConnection<ResponseObject> {
    data(): Promise<IConnection<ResponseObject>>;
}
