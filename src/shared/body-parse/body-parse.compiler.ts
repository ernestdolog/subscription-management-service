import { type TSchema } from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import { Value } from '@sinclair/typebox/value';
import { BodyParseError } from './body-parse.error.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/index.js';
import { FastifyRouteSchemaDef, FastifySchemaCompiler } from 'fastify/types/schema.js';

export const RequestBodyCompiler: FastifySchemaCompiler<TSchema> = (
    routeSchema: FastifyRouteSchemaDef<TSchema>,
) => {
    const typeCompiler = TypeCompiler.Compile(routeSchema.schema);
    return value => {
        const ensured = Value.Default(routeSchema.schema, value);
        const converted =
            routeSchema.httpPart === 'body' ? ensured : Value.Convert(routeSchema.schema, ensured);
        const isCompilationSuccess = typeCompiler.Check(converted);
        if (!isCompilationSuccess) {
            const errors = [...typeCompiler.Errors(converted)];
            throw new InternalServerError(BodyParseError.REQUEST_BODY_PARSE_ERROR, {
                ...errors,
            });
        }
        return {
            value: Value.Cast({ ...routeSchema.schema, additionalProperties: false }, converted),
        };
    };
};
