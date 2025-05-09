import { Static, TObject, TProperties, Type } from '@sinclair/typebox';

export const PageInfo = Type.Object(
    {
        endCursor: Type.Union([Type.String(), Type.Null()], {
            description: 'Can be null for an empty page',
        }),
        hasNextPage: Type.Boolean(),
        totalCount: Type.Number(),
    },
    { additionalProperties: false, title: 'PageInfo' },
);
export type PageInfo = Static<typeof PageInfo>;

const createConnectionEdgeResponse = <NodeType extends TObject<TProperties>>(
    name: string,
    Node: NodeType,
) =>
    Type.Object(
        {
            node: Node,
            cursor: Type.String(),
        },
        { $id: `${name}Edge`, title: `${name}Edge` },
    );

export type TConnectionEdgeResponse<NodeType extends TObject<TProperties>> = Static<
    ReturnType<typeof createConnectionEdgeResponse<NodeType>>
>;

export const createConnectionResponse = <NodeType extends TObject<TProperties>>(
    name: string,
    Node: NodeType,
) =>
    Type.Object(
        {
            edges: Type.Array(createConnectionEdgeResponse(name, Node)),
            pageInfo: PageInfo,
        },
        { $id: `${name}Connection`, title: `${name}Connection` },
    );

export type TConnectionResponse<NodeType extends TObject<TProperties>> = Static<
    ReturnType<typeof createConnectionResponse<NodeType>>
>;
