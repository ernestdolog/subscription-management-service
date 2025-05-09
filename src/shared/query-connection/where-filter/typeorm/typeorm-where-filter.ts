/**
 * This module implements query translation from GraphQL input to TypeORM query builder.
 * Purpose of the module is to provide conventionalized but still scalable way to filter data dynamically
 * using a wide variety operators.
 */
import {
    Brackets,
    ObjectLiteral,
    EntityMetadata,
    SelectQueryBuilder,
    WhereExpressionBuilder,
} from 'typeorm';
import {
    IDateFilterOperator,
    IStringFilterOperator,
    INumericFilterOperator,
    IPGArrayFilterOperator,
    IEqualityFilterOperator,
    IDateFilterOperatorISO,
    IBooleanFilterOperator,
} from '../filter/tool/index.js';

export type CustomFiltering = {
    [key: string]: (ctx: {
        web: WhereExpressionBuilder;
        filterObject: unknown;
        columnWithAlias: string;
        paramKey?: string;
        value?: unknown;
    }) => void;
};

/**
 * Adds where expression to QueryBuilder (mutates it) from the filters.
 * Under each filter, attributes/columns are added as AND statement.
 * Each filter element is added as OR statement.
 *
 * for eg:
 *  `[ { column1: { gt: 0, lt: 10 } }, { column2: { startsWith: "xyz" } }]`
 *
 * will be resolved as
 *
 * `WHERE (column1 > 0 AND column1 < 10) OR (column2 ILIKE "xyz")`
 *
 * @param {SelectQueryBuilder<Entity extends ObjectLiteral>} qb
 * @param {FilterInputType} filters
 * @param {'AND' | 'OR'} qbOperator Operator to use when whole filters gets added to query builder. Default 'OR'
 * @param {CustomFiltering | undefined} customFiltering Hacky way to allow to use custom filter functions.
 */
export function addQueryBuilderWhereItems<Entity extends ObjectLiteral>(
    qb: SelectQueryBuilder<Entity>,
    filters: FilterInputType,
    qbOperator: 'AND' | 'OR' = 'OR',
    customFiltering?: CustomFiltering,
): SelectQueryBuilder<Entity> {
    replaceFilterDBField(filters);

    joinTables(qb, filters);

    normalizeJoinColumns(filters);

    const brackets = new Brackets(queryBuilderWhereExpression => {
        filters.forEach((filter, index) => {
            const bracket = new Brackets(whereExpression => {
                Object.keys(filter).forEach((column, columnIndex) => {
                    const filterObject = filter[column]!;
                    /**
                     * SQL doesn't work with undefined
                     */
                    if (filterObject === undefined) return;
                    const columnWithAlias =
                        column.indexOf('.') > -1 ? column : `${qb.alias}.${column}`;

                    if (customFiltering?.[column]) {
                        const func = customFiltering[column];
                        func({
                            web: whereExpression,
                            columnWithAlias,
                            filterObject,
                        });
                        return;
                    }

                    Object.entries(filterObject).forEach(([operator, value], rowIndex) => {
                        /**
                         * SQL doesn't work with undefined
                         */
                        if (value === undefined) return;
                        /**
                         * index are added to the key as if the filter array contains same column name with different
                         * values, it gets replaced with the latest one.
                         * for example: [{status: {eq: 'abc'}}, {status: {eq: 'xyz'}}], turned out to be just status = 'xyz'
                         * in sql as the param key remained same.
                         */
                        const paramKey =
                            `${column}__${operator}__${index}${columnIndex}${rowIndex}`.replace(
                                /\W/g,
                                '_',
                            );

                        if (customFiltering?.[`operator__${operator}`]) {
                            const func = customFiltering?.[`operator__${operator}`];
                            func({
                                web: whereExpression,
                                columnWithAlias,
                                filterObject,
                                paramKey,
                                value,
                            });
                            return;
                        }

                        addWhereExpressionItem(
                            whereExpression,
                            paramKey,
                            columnWithAlias,
                            operator as WhereOperator,
                            value as never,
                        );
                    });
                });
            });

            queryBuilderWhereExpression.orWhere(bracket);
        });
    });

    if (qbOperator === 'AND') {
        qb.andWhere(brackets);
    } else {
        qb.orWhere(brackets);
    }

    return qb;
}

/**
 * Internal function
 * @todo: remove export
 *
 * @param {WhereExpressionBuilder} qb
 * @param {string} parameterKey Parameter key used in query builder
 * @param {string} columnWithAlias ex. "user"."name"
 * @param {WhereOperator} operator
 * @param {never} value
 * @returns WhereExpressionBuilder
 */
export function addWhereExpressionItem(
    qb: WhereExpressionBuilder,
    parameterKey: string,
    columnWithAlias: string,
    operator: WhereOperator,
    value: never,
): WhereExpressionBuilder {
    switch (operator) {
        case 'eq':
            if (value === null) {
                return qb.andWhere(`${columnWithAlias} IS NULL`);
            }
            return qb.andWhere(`${columnWithAlias} = :${parameterKey}`, {
                [parameterKey]: value,
            });
        case 'not':
            if (value === null) {
                return qb.andWhere(`${columnWithAlias} IS NOT NULL`);
            }
            return qb.andWhere(`${columnWithAlias} != :${parameterKey}`, {
                [parameterKey]: value,
            });
        case 'lt':
            return qb.andWhere(`${columnWithAlias} < :${parameterKey}`, {
                [parameterKey]: value,
            });
        case 'lte':
            return qb.andWhere(`${columnWithAlias} <= :${parameterKey}`, {
                [parameterKey]: value,
            });
        case 'gt':
            return qb.andWhere(`${columnWithAlias} > :${parameterKey}`, {
                [parameterKey]: value,
            });
        case 'gte':
            return qb.andWhere(`${columnWithAlias} >= :${parameterKey}`, {
                [parameterKey]: value,
            });
        case 'in':
            /**
             * IN (:... is the syntax for exploding array params into (?, ?, ?) in QueryBuilder
             */
            return qb.andWhere(`${columnWithAlias} IN (:...${parameterKey})`, {
                [parameterKey]: value,
            });
        case 'notIn':
            return qb.andWhere(`${columnWithAlias} NOT IN (:...${parameterKey})`, {
                [parameterKey]: value,
            });
        case 'contains':
            return qb.andWhere(`${columnWithAlias} ILIKE :${parameterKey}`, {
                [parameterKey]: `%${value}%`,
            });
        case 'containsJsonb':
            return qb.andWhere(`${columnWithAlias} @> '${JSON.stringify(value)}'::jsonb`);
        case 'startsWith':
            return qb.andWhere(`${columnWithAlias} ILIKE :${parameterKey}`, {
                [parameterKey]: `${value}%`,
            });
        case 'endsWith':
            return qb.andWhere(`${columnWithAlias} ILIKE :${parameterKey}`, {
                [parameterKey]: `%${value}`,
            });
        case 'containsAll':
            return qb.andWhere(`${columnWithAlias} @> ARRAY[:...${parameterKey}]`, {
                [parameterKey]: value,
            });
        case 'containsAny':
            return qb.andWhere(`${columnWithAlias} && ARRAY[:...${parameterKey}]`, {
                [parameterKey]: value,
            });
        default:
            throw new Error(`Can't find operator ${operator}`);
    }
}

const JOIN_COLUMN_SEPARATOR = '__';
const JOIN_REGEX = new RegExp(`^\\w+${JOIN_COLUMN_SEPARATOR}`);

/**
 * Looks for a filter key if it contains a column separator.
 * If the column separator found, it inner joins the tables.
 *
 * The filters are going to be used in where condition so outer join doesn't make sense to me.
 *
 * @param {SelectQueryBuilder<Literal extends ObjectLiteral>} qb
 * @param {FilterInputType} filters
 * @returns void
 */
export function joinTables<Literal extends ObjectLiteral>(
    qb: SelectQueryBuilder<Literal>,
    filters: FilterInputType,
): void {
    const joinTable: JoinTable = {};

    for (const filter of filters) {
        for (const field in filter) {
            /**
             * 'field' here is something like 'writer__cinema__name'
             */
            if (!field.match(JOIN_REGEX)) {
                continue;
            }

            /**
             * Following previous example, aliasesTree = ['writer', 'cinema']
             */
            const aliasesTree = field.split(JOIN_COLUMN_SEPARATOR).slice(0, -1);

            /**
             * Preparing tables to be joined
             */
            let parentAlias = qb.alias;
            let parentEntityColumns = getEntityMetadata(qb)?.columns;
            for (const alias of aliasesTree) {
                const columnMetadata = parentEntityColumns?.find(c => c.propertyName === alias);

                joinTable[alias] = {
                    alias,
                    property: `${parentAlias}.${alias}`,
                    isNullable: columnMetadata?.isNullable ?? false,
                };

                parentAlias = alias;
                parentEntityColumns = columnMetadata?.referencedColumn?.entityMetadata.columns;
            }
        }
    }

    Object.values(joinTable).forEach(jTable => {
        const found = qb.expressionMap.joinAttributes.some(
            j => j.alias.name === jTable.alias && j.entityOrProperty === jTable.property,
        );
        /**
         * prevent same join table to be added again as it raises an exception
         */
        if (found) return;

        if (jTable.isNullable) {
            qb.leftJoin(jTable.property, jTable.alias);
        } else {
            qb.innerJoin(jTable.property, jTable.alias);
        }
    });
}

/**
 * Replaces join columns with valid alias and column name.
 * For eg. "person__organizationId" will be converted to "person.organizationId"
 *
 * @param {FilterInputType} filters
 */
function normalizeJoinColumns(filters: FilterInputType): void {
    filters.forEach(filter => {
        Object.keys(filter).forEach(field => {
            if (field.match(JOIN_REGEX)) {
                const tablesAndCol = field.split(JOIN_COLUMN_SEPARATOR);

                const col = tablesAndCol.pop() || '';
                let table = tablesAndCol.pop();

                /**
                 * Typeorm wraps table and column with double quote in ideal case however
                 * when column contains JSON operator, it doesn't and leads to malformed query.
                 */
                if (col.match(/(->>?|#>>?)'?[{},\w]+'?$/)) table = `"${table}"`;

                filter[`${table}.${col}`] = filter[field];

                delete filter[field];
            }
        });
    });
}

const RESOLVE_FIELD_KEY = Symbol('resolveField');

/**
 * Decorator to provide actual field to be resolved.
 * > Property is an alias of this field
 * @param field
 */
export function FilterField(dbField: string) {
    return Reflect.metadata(RESOLVE_FIELD_KEY, dbField);
}

/**
 * Replaces filter-s key with actual field
 * @param filters
 */
function replaceFilterDBField(filters: FilterInputType): void {
    filters.forEach(filter => {
        Object.keys(filter).forEach(k => {
            const field = Reflect.getMetadata(RESOLVE_FIELD_KEY, filter, k);
            if (field) {
                filter[field] = filter[k];
                delete filter[k];
            }
        });
    });
}

/**
 * Gets entity metadata from the main entity in a QueryBuilder.
 */
function getEntityMetadata<Entity extends ObjectLiteral>(
    qb: SelectQueryBuilder<Entity>,
): EntityMetadata | null {
    const entityTarget = qb.expressionMap.mainAlias?.target;
    if (!entityTarget) {
        return null;
    }

    return qb.connection.getMetadata(entityTarget);
}

type WhereOperator =
    | 'eq'
    | 'not'
    | 'lt'
    | 'lte'
    | 'gt'
    | 'gte'
    | 'in'
    | 'notIn'
    | 'contains'
    | 'containsJsonb'
    | 'startsWith'
    | 'endsWith'
    | 'containsAll'
    | 'containsAny';

export abstract class IFilterInputTypeItem {
    [key: string]:
        | IDateFilterOperator
        | IDateFilterOperatorISO
        | IStringFilterOperator
        | INumericFilterOperator
        | IBooleanFilterOperator
        | IPGArrayFilterOperator
        | IEqualityFilterOperator
        | undefined;
}

export type FilterInputType = IFilterInputTypeItem[];

type JoinTable = {
    [table: string]: { alias: string; property: string; isNullable: boolean };
};
