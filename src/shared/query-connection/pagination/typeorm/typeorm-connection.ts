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
 * Current implementation is directly tied to TypeOrm, regardable as an infrastructural package
 *
 * The class transforms Typeorm QueryBuilder literal to a Response Connection object out of the box.
 * The implementation should be sufficient for most of the cases. If it doesn't fit in your
 * use case please extend the class and override relevant methods.
 *
 * f ex:
 *
 * ```typescript
 * class MyPaginatedConnection extends IConnection<MyLiteral, MyPaginatedGQLObject> {
 *     makeCursor(literal) {
 *         return literal.createdAt + literal.id
 *     }
 * }
 *
 * ```
 */
export class TypeOrmConnection<Literal extends ObjectLiteral, ResponseObject> {
    defaultPageSize = DEFAULT_PAGE_SIZE;

    readonly queryBuilder: SelectQueryBuilder<Literal>;

    constructor(
        qb: SelectQueryBuilder<Literal>,
        protected filters?: FilterInputType,
        protected orderBy?: { field: string; direction: OrderByDirection },
        protected page?: { first: number; after?: string },
        protected search?: string,
        protected customFiltering?: CustomFiltering,
    ) {
        this.queryBuilder = qb.clone();
        this.filterQueryBuilder(this.queryBuilder);
    }

    /**
     * Returns data transformed to connection object (of ResponseObject)
     */
    async data(): Promise<IConnection<ResponseObject>> {
        this.sortQueryBuilder(this.queryBuilder);
        this.paginateQueryBuilder(this.queryBuilder);

        const { literals, count: totalCount } = await this.fetchDataAndCount(this.queryBuilder);

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
     * @param {SelectQueryBuilder<Literal>} qb
     * @returns literals: <Literal[]>, count: number
     * @protected
     */
    protected async fetchDataAndCount(
        qb: SelectQueryBuilder<Literal>,
    ): Promise<{ literals: Literal[]; count: number }> {
        const [literals, count] = await qb.getManyAndCount();

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
     *
     * @param {Entity} literal
     * @param {number} index
     * @returns string
     * @protected
     */
    protected makeCursor(literal: Literal, index: number): string {
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
     * @param {SelectQueryBuilder<Literal extends ObjectLiteral>} qb
     * @protected
     */
    protected filterQueryBuilder<Literal extends ObjectLiteral>(
        qb: SelectQueryBuilder<Literal>,
    ): void {
        if (this.filters) addQueryBuilderWhereItems(qb, this.filters, 'AND', this.customFiltering);
        if (this.search) this.addSearchFiltersToQueryBuilder(qb);
    }

    /**
     * Filter query builder using search term.
     *
     * @param {SelectQueryBuilder<Literal extends ObjectLiteral>} qb
     * @protected
     */
    protected addSearchFiltersToQueryBuilder<Literal extends ObjectLiteral>(
        qb: SelectQueryBuilder<Literal>,
    ): void {
        addQueryBuilderWhereItems(qb, this.buildSearchFilters(), 'AND');
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
     * @param qb
     * @protected
     */
    protected sortQueryBuilder<Literal extends ObjectLiteral>(
        qb: SelectQueryBuilder<Literal>,
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
        qb.orderBy(
            `"${qb.alias}"."${this.orderBy.field}"`,
            this.orderBy.direction as unknown as 'ASC' | 'DESC',
            'NULLS LAST',
        );
    }

    /**
     * Applies this.page to the query builder (modifies it).
     *
     * @param {SelectQueryBuilder<Literal>} qb
     * @protected
     */
    protected paginateQueryBuilder<Literal extends ObjectLiteral>(
        qb: SelectQueryBuilder<Literal>,
    ): void {
        /**
         * take/skip produces subquery with distinct in the statement and that causes an issue
         * with ordering columns
         *
         * if smaller case column-s are not strictly used they need to be double quoted and there is
         * a bug in typeorm which messes up the query
         */
        qb.limit(this.pageSize);
        qb.offset(this.after);
    }

    get pageSize(): number {
        return this.page?.first ?? this.defaultPageSize;
    }

    private get after() {
        return this.page?.after ? parseInt(this.decodeCursor(this.page.after), 10) : 0;
    }
}
