import { Static, TSchema, Type } from '@sinclair/typebox';

export const EqualityFilterOperator = Type.Object(
    {
        eq: Type.Optional(Type.String()),
        not: Type.Optional(Type.String()),
    },
    { additionalProperties: false, title: 'EqualityFilterOperator' },
);
export type EqualityFilterOperator = Static<typeof EqualityFilterOperator>;

/**
 * Creates an equality filter input schema for a given base TypeBox schema.
 *
 * Example usage:
 * ```
 * const StatusFilter = createEqualityOperatorSchema('Status', Type.String());
 * type StatusFilter = Static<typeof StatusFilter>;
 * ```
 *
 * Produces:
 * {
 *   eq?: string;
 *   not?: string;
 * }
 *
 * @param {string} name - A base name for the schema's `$id` and `title`.
 * @param {TSchema} baseType - The TypeBox schema to apply the equality operator to.
 */
export const createEqualityOperatorSchema = <EqualityType extends TSchema>(
    baseType: EqualityType,
    name: string,
) => {
    return Type.Object(
        {
            eq: Type.Optional(baseType),
            not: Type.Optional(baseType),
        },
        {
            $id: `${name}EqualityOperator`,
            title: `${name}EqualityOperator`,
            additionalProperties: false,
        },
    );
};

export type TEqualityOperator<EqualityType extends TSchema> = Static<
    ReturnType<typeof createEqualityOperatorSchema<EqualityType>>
>;
