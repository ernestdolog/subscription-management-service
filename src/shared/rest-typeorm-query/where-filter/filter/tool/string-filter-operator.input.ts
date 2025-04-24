export interface IStringFilterOperator {
    eq?: string;
    contains?: string;
    startsWith?: string;
    endsWith?: string;
    in?: string[];
    notIn?: string[];
    not?: string;
}
