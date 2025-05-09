import { OrderByDirection } from './order-by.enum.js';

export interface OrderByInput {
    field: string;
    direction: OrderByDirection;
}
