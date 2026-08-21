export interface PredicateConfig {
    subject?: any;
    value?: any;
    operator?: string;
}

export class Predicate {
    subject?: any;
    value?: any;
    operator: string;

    constructor(config?: PredicateConfig);

    flatten(result?: Predicate[]): Predicate[];
    serialize(): string;

    static concat(operator: string, p: Predicate | Predicate[], ...rest: Predicate[]): Predicate;
}

export interface Operators {
    EQUALS: string;
    AND: string;
    OR: string;
    GREATER_THAN: string;
    GREATER_THAN_EQUAL: string;
    LESS_THAN: string;
    LESS_THAN_EQUAL: string;
    LIKE: string;
    IS_NULL: string;
    NOT_EQUAL: string;

    isUnary(op: string): boolean;
    isLogical(op: string): boolean;
}

export const Operators: Operators;

export interface Parser {
    parse(filterStr?: string | null): Predicate | null;
}

export const Parser: Parser;
