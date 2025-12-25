import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { IConnection, IConnectionEdge } from '../tool/connection.interface.js';
import { OrderByDirection } from '../tool/order-by.enum.js';
import {
    addQueryBuilderWhereItems,
    CustomFiltering,
    FilterInputType,
} from '../../where-filter/typeorm/index.js';
import { DEFAULT_PAGE_SIZE } from '../tool/index.js';

/**
 * Implements an Api pagination practice using "Relay style pagination"
 * having edge, node and page info objects.
 *
 * Current implementation is directly tied to TypeOrm, regardable as an infrastructural package.
 * This is a TOOL - it knows nothing about domains. All domain-specific logic
 * (permissions, custom joins, etc.) belongs in the subclass's _query() method.
 *
 * Subclass must implement:
 * - _query(): Returns a SelectQueryBuilder with all domain-specific setup
 * - toResponseObject(): Transforms a database row to API response (optional, has default)
 *
 * Example:
 * ```typescript
 * class AccountTypeOrmConnection extends TypeOrmConnection<AccountDao, AccountNode> {
 *     protected _query(): SelectQueryBuilder<AccountDao> {
 *         const queryBuilder = getTypeOrmAccountRepository(
 *             new TypeOrmTransactionManager(),
 *         ).createQueryBuilder('account');
 *
 *         if (this.user) addUserViewPermissionFiltertoAccount(this.user, queryBuilder);
 *
 *         return queryBuilder;
 *     }
 *
 *     protected toResponseObject(literal: AccountDao): AccountNode {
 *         return toAccountNode(literal.toEntity);
 *     }
 * }
 * ```
 */
export abstract class TypeOrmConnection<Literal extends ObjectLiteral, ResponseObject> {
    defaultPageSize = DEFAULT_PAGE_SIZE;

    constructor(
        protected filters?: FilterInputType,
        protected orderBy?: { field: string; direction: OrderByDirection },
        protected page?: { first: number; after?: string },
        protected search?: string,
        protected customFiltering?: CustomFiltering,
    ) {}

    /**
     * SUBCLASS IMPLEMENTS: Build your query however you want.
     * Full access to QueryBuilder - select, join, permissions, whatever.
     * All domain-specific logic belongs here, not in this base class.
     */
    protected abstract _query(): SelectQueryBuilder<Literal>;

    /**
     * Returns data transformed to connection object (of ResponseObject)
     */
    async data(): Promise<IConnection<ResponseObject>> {
        const queryBuilder = this._query();

        this.filterQueryBuilder(queryBuilder);
        this.sortQueryBuilder(queryBuilder);
        this.paginateQueryBuilder(queryBuilder);

        const { literals, count: totalCount } = await this.fetchDataAndCount(queryBuilder);

        return this.transform(literals, totalCount);
    }

    /**
     * Define as a property
     * Doesn't reflect the subclass override in the constructor.
     * @protected
     */
    protected get searchColumns(): null | string[] {
        return null;
    }

    /**
     * Transforms <Literal> to IConnection<ResponseObject>
     *
     * @param {Literal[]} literals To be transformed
     * @param {number} totalCount Total count before pagination filter
     * @returns IConnection<ResponseObject>
     * @protected
     */
    protected transform(literals: Literal[], totalCount: number): IConnection<ResponseObject> {
        const edges = literals.map((literal: Literal, index: number) =>
            this.buildEdge(literal, index),
        );
        const endCursor = this.getEndCursor(edges);
        const hasNextPage = this.hasNextPage(totalCount);

        return {
            edges,
            pageInfo: {
                totalCount,
                endCursor,
                hasNextPage,
            },
        };
    }

    /**
     * Checks if the result has next page.
     *
     * @param {number} totalCount Total count before pagination filter
     * @returns boolean
     * @protected
     */
    protected hasNextPage(totalCount: number): boolean {
        return totalCount - this.after > this.pageSize;
    }

    /**
     * The last cursor of the page. Equals to by last object's cursor.
     *
     * @param {IConnectionEdge<ResponseObject>[]} edges
     * @return string When found.
     * @return null When the page is empty.
     * @protected
     */
    protected getEndCursor(edges: IConnectionEdge<ResponseObject>[]): string | null {
        let endCursor: string | null;
        try {
            endCursor = edges[edges.length - 1].cursor;
        } catch {
            endCursor = null;
        }

        return endCursor;
    }

    /**
     * Evaluates query builder with result counts
     * (together with all filters including pagination).
     *
     * @param {SelectQueryBuilder<Literal>} queryBuilder
     * @returns literals: <Literal[]>, count: number
     * @protected
     */
    protected async fetchDataAndCount(
        queryBuilder: SelectQueryBuilder<Literal>,
    ): Promise<{ literals: Literal[]; count: number }> {
        const [literals, count] = await queryBuilder.getManyAndCount();

        return { literals, count };
    }

    /**
     * Transforms literal to ResponseObject with encoded cursor.
     *
     * @param {Literal} literal
     * @param {number} index
     * @returns IConnectionEdge<ResponseObject>
     * @protected
     */
    protected buildEdge(literal: Literal, index: number): IConnectionEdge<ResponseObject> {
        const cursor = this.encodeCursor(this.makeCursor(literal, index));

        return { node: this.toResponseObject(literal), cursor };
    }

    /**
     * By default no conversion is made (So if we more or less return whats in the database, no need to cast... however better to be explicit)
     * Recommended to implement
     * @param {Literal} literal
     * @returns ResponseObject
     *  @protected
     */
    protected toResponseObject(literal: Literal): ResponseObject {
        return literal as unknown as ResponseObject;
    }

    /**
     * Makes cursor string from the literal.
     * Override in subclass to customize cursor generation.
     *
     * @param {Literal} _literal - The database row (unused by default, available for subclass override)
     * @param {number} index - The index of the item in the result set
     * @returns string
     * @protected
     */
    protected makeCursor(_literal: Literal, index: number): string {
        const val = this.after ? this.after + index + 1 : index + 1;
        return val.toString();
    }

    /**
     * Decodes cursor using base64.
     *
     * @param {string} cursor
     * @returns string Decoded cursor
     * @protected
     */
    protected decodeCursor(cursor: string): string {
        try {
            return Buffer.from(cursor, 'base64').toString('ascii');
        } catch {
            throw new Error('Invalid cursor value.');
        }
    }

    /**
     * Encodes arbitrary "cursor" string using base64.
     * @param {string} cursor
     * @returns string Encoded cursor
     * @protected
     */
    protected encodeCursor(cursor: string): string {
        return Buffer.from(cursor).toString('base64');
    }

    /**
     * Applies this.filters to the query builder (modifies it).
     *
     * @param {SelectQueryBuilder<Literal extends ObjectLiteral>} queryBuilder
     * @protected
     */
    protected filterQueryBuilder<Literal extends ObjectLiteral>(
        queryBuilder: SelectQueryBuilder<Literal>,
    ): void {
        if (this.filters)
            addQueryBuilderWhereItems(queryBuilder, this.filters, 'AND', this.customFiltering);
        if (this.search) this.addSearchFiltersToQueryBuilder(queryBuilder);
    }

    /**
     * Filter query builder using search term.
     *
     * @param {SelectQueryBuilder<Literal extends ObjectLiteral>} queryBuilder
     * @protected
     */
    protected addSearchFiltersToQueryBuilder<Literal extends ObjectLiteral>(
        queryBuilder: SelectQueryBuilder<Literal>,
    ): void {
        addQueryBuilderWhereItems(queryBuilder, this.buildSearchFilters(), 'AND');
    }

    /**
     * Builds filter array using search columns and search text
     * @protected
     */
    protected buildSearchFilters(): FilterInputType {
        if (!this.searchColumns) return [];

        return this.searchColumns.map(col => ({ [col]: { contains: this.search } }));
    }

    /**
     * Applies this.orderBy to the query builder (modifies it).
     *
     * @param queryBuilder
     * @protected
     */
    protected sortQueryBuilder<Literal extends ObjectLiteral>(
        queryBuilder: SelectQueryBuilder<Literal>,
    ): void {
        if (!this.orderBy) return;

        /**
         * Postgres recommends snake case naming strategy, but at all lower case column names
         * If at least later is not followed Postgres will covert column name to smaller case
         * Unless "-s are used.
         *
         * 'TableAlias_column' messes up the query
         * @see https://github.com/typeorm/typeorm/issues/4270
         * @see https://github.com/typeorm/typeorm/issues/2817
         * @see https://github.com/typeorm/typeorm/issues/3501
         */
        queryBuilder.orderBy(
            `"${queryBuilder.alias}"."${this.orderBy.field}"`,
            this.orderBy.direction as unknown as 'ASC' | 'DESC',
            'NULLS LAST',
        );
    }

    /**
     * Applies this.page to the query builder (modifies it).
     *
     * @param {SelectQueryBuilder<Literal>} queryBuilder
     * @protected
     */
    protected paginateQueryBuilder<Literal extends ObjectLiteral>(
        queryBuilder: SelectQueryBuilder<Literal>,
    ): void {
        /**
         * take/skip produces subquery with distinct in the statement and that causes an issue
         * with ordering columns
         *
         * if smaller case column-s are not strictly used they need to be double quoted and there is
         * a bug in typeorm which messes up the query
         */
        queryBuilder.limit(this.pageSize);
        queryBuilder.offset(this.after);
    }

    get pageSize(): number {
        return this.page?.first ?? this.defaultPageSize;
    }

    private get after() {
        return this.page?.after ? parseInt(this.decodeCursor(this.page.after), 10) : 0;
    }
}
