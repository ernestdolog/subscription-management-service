export interface IPageInfo {
    endCursor: string | null;
    hasNextPage: boolean;
    totalCount: number;
}

export interface IConnectionEdge<Entity> {
    node: Entity;
    cursor: string;
}

export interface IConnection<Entity> {
    edges: IConnectionEdge<Entity>[];
    pageInfo: IPageInfo;
}
