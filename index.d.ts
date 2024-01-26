export type Operator =
    | "eq"
    | "and"
    | "or"
    | "gt"
    | "ge"
    | "lt"
    | "le"
    | "like"
    | "is null"
    | "ne";

export namespace Operators {
    const EQUALS = "eq";
    const AND = "and";
    const OR = "or";
    const GREATER_THAN = "gt";
    const GREATER_THAN_EQUAL = "ge";
    const LESS_THAN = "lt";
    const LESS_THAN_EQUAL = "le";
    const LIKE = "like";
    const IS_NULL = "is null";
    const NOT_EQUAL = "ne";

    /**
     * Whether a defined operation is unary or binary.  Will return true
     * if the operation only supports a subject with no value.
     *
     * @param op the operation to check.
     * @return whether the operation is an unary operation.
     */
    export function isUnary(op: Operator): boolean;

    /**
     * Whether a defined operation is a logical operators or not.
     *
     * @param op the operation to check.
     * @return whether the operation is a logical operation.
     */
    export function isLogical(op: Operator): boolean;
}

export interface PredicateConfig {
    subject: string | Predicate;
    value?: string | number | Predicate;
    operator: Operator;
}

/**
 * Predicate is the basic model construct of the odata expression
 */
export class Predicate {
    subject: string | Predicate;
    value?: string | number | Predicate;
    operator: Operator;

    static concat(operator: Operator, p: Predicate): Predicate;

    constructor(config?: PredicateConfig);

    flatten(result?: Predicate[]): Predicate[];

    /**
     * Will serialie the predicate to an ODATA compliant serialized string.
     *
     * @return The compliant ODATA query string
     */
    serialize(): string;
}

export namespace Parser {
    export function parse(filterStr?: string): null | Predicate;
}
