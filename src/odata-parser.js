/**
 Copyright 2022 Jason Drake

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

const Operators = {
    EQUALS: 'eq',
    AND: 'and',
    OR: 'or',
    GREATER_THAN: 'gt',
    GREATER_THAN_EQUAL: 'ge',
    LESS_THAN: 'lt',
    LESS_THAN_EQUAL: 'le',
    LIKE: 'like',
    IS_NULL: 'is null',
    NOT_EQUAL: 'ne',

    /**
     * Whether a defined operation is unary or binary.  Will return true
     * if the operation only supports a subject with no value.
     *
     * @param {String} op the operation to check.
     * @return {Boolean} whether the operation is an unary operation.
     */
    isUnary: function (op) {
        let value = false;
        if (op === Operators.IS_NULL) {
            value = true;
        }
        return value;
    },
    /**
     * Whether a defined operation is a logical operators or not.
     *
     * @param {String} op the operation to check.
     * @return {Boolean} whether the operation is a logical operation.
     */
    isLogical: function (op) {
        return (op === Operators.AND || op === Operators.OR);
    }
};

const Functions = {
    CONTAINS: 'contains',
    STARTSWITH: 'startswith',
    ENDSWIDTH: 'endswith'
};

/**
 * Predicate is the basic model construct of the odata expression
 *
 * @param config
 * @returns {Predicate}
 * @constructor
 */
const Predicate = function (config) {
    if (!config) {
        config = {};
    }
    this.subject = config.subject;
    this.value = config.value;
    this.operator = (config.operator) ? config.operator : Operators.EQUALS;
    return this;
};

Predicate.concat = function (operator, p) {
    if (arguments.length < 3 && !(p instanceof Array && p.length >= 2)) {
        throw {
            key: 'INSUFFICIENT_PREDICATES',
            msg: 'At least two predicates are required'
        };
    } else if (!operator || !Operators.isLogical(operator)) {
        throw {
            key: 'INVALID_LOGICAL',
            msg: 'The operator is not representative of a logical operator.'
        };
    }
    let result;
    let arr = [];
    if (p instanceof Array) {
        arr = p;
    } else {
        for (let i = 1; i < arguments.length; i++) {
            arr.push(arguments[i]);
        }
    }
    const len = arr.length;
    result = new Predicate({
        subject: arr[0],
        operator: operator
    });
    if (len === 2) {
        result.value = arr[len - 1];
    } else {
        let a = [];
        for (let j = 1; j < len; j++) {
            a.push(arr[j]);
        }
        result.value = Predicate.concat(operator, a);
    }
    return result;
};

Predicate.prototype.flatten = function (result) {
    if (!result) {
        result = [];
    }
    if (Operators.isLogical(this.operator)) {
        result = result.concat(this.subject.flatten());
        result = result.concat(this.value.flatten());
    } else {
        result.push(this);
    }
    return result;
};

/**
 * Will serialie the predicate to an ODATA compliant serialized string.
 *
 * @return {String} The compliant ODATA query string
 */
Predicate.prototype.serialize = function () {
    let retValue = '';
    if (this.operator) {
        if (this.subject === undefined || this.subject === null) {
            throw {
                key: 'INVALID_SUBJECT',
                msg: 'The subject is required and is not specified.'
            };
        }
        if (Operators.isLogical(this.operator) && (!(this.subject instanceof Predicate ||
            this.value instanceof Predicate) || (this.subject instanceof Predicate && this.value === undefined))) {
            throw {
                key: 'INVALID_LOGICAL',
                msg: 'The predicate does not represent a valid logical expression.'
            };
        }
        retValue = '(';
        if (this.operator === Operators.LIKE) {
            let op = Functions.CONTAINS;
            const lastIndex = this.value.lastIndexOf('*');
            const index = this.value.indexOf('*');
            let v = this.value;
            if (index === 0 && lastIndex !== this.value.length - 1) {
                op = 'endswith';
                v = v.substring(1);
            } else if (lastIndex === this.value.length - 1 && index === lastIndex) {
                op = 'startswith';
                v = v.substring(0, lastIndex);
            } else if (index === 0 && lastIndex === this.value.length - 1) {
                v = v.substring(1, lastIndex);
            }
            retValue += op + '(' + this.subject + ',\'' + v + '\')';
        } else {
            retValue += ((this.subject instanceof Predicate) ? this.subject.serialize() : this.subject) + ' ' + this.operator;

            if (!Operators.isUnary(this.operator)) {
                if (this.value === undefined || this.value === null) {
                    throw {
                        key: 'INVALID_VALUE',
                        msg: 'The value was required but was not defined.'
                    };
                }
                retValue += ' ';
                const val = typeof this.value;
                if (val === 'string') {
                    retValue += '\'' + this.value + '\'';
                } else if (val === 'number' || val === 'boolean') {
                    retValue += this.value;
                } else if (this.value instanceof Predicate) {
                    retValue += this.value.serialize();
                } else if (this.value instanceof Date) {
                    retValue += 'datetimeoffset\'' + this.value.toISOString() + '\'';
                } else {
                    throw {
                        key: 'UNKNOWN_TYPE',
                        msg: 'Unsupported value type: ' + (typeof this.value),
                        source: this.value
                    };
                }
            }
        }

        retValue += ')';
    }
    return retValue;
};

const ODataParser = function () {

    "use strict";

    const KEY_REGEX = /^([$][0-9]+[$])$/g;

    const REGEX = {
        parenthesis: /^([(](.*)[)])$/,
        andor: /^(.*?) (or|and)+ (.*)$/,
        op: /(\w*) (eq|gt|lt|ge|le|ne) (datetimeoffset'(.*)'|'(.*)'|[0-9]*)/,
        startsWith: /^startswith[(](.*),'(.*)'[)]/,
        endsWith: /^endswith[(](.*),'(.*)'[)]/,
        contains: /^contains[(](.*),'(.*)'[)]/
    };

    function buildLike(match, key) {
        let right = (key === 'startsWith') ? match[2] + '*' : (key === 'endsWith') ? '*' + match[2] : '*' + match[2] + '*';
        return new Predicate({
            subject: match[1],
            operator: Operators.LIKE,
            value: right
        });
    }

    function parseFragment(filter) {
        let found = false;
        let obj = null;
        for (let key in REGEX) {
            const regex = REGEX[key];
            if (found) {
                break;
            }
            let match = filter.match(regex);
            if (match) {
                switch (regex) {
                case REGEX.parenthesis:
                    return parseNested(filter);
                    break;
                case REGEX.andor:
                    let subject = /(\$[0-9]+\$)/.test(match[1]) ? match[1] : parseFragment(match[1]);
                    let value = /(\$[0-9]+\$)/.test(match[3]) ? match[3] : parseFragment(match[3]);
                    obj = new Predicate({
                        subject: subject,
                        operator: match[2],
                        value: value
                    });
                    break;
                case REGEX.op:
                    obj = new Predicate({
                        subject: match[1],
                        operator: match[2],
                        value: (match[3].indexOf('\'') === -1) ? +match[3] : match[3]
                    });
                    if (typeof obj.value === 'string') {
                        const quoted = obj.value.match(/^'(.*)'$/);
                        const m = obj.value.match(/^datetimeoffset'(.*)'$/);
                        if (quoted && quoted.length > 1) {
                            obj.value = quoted[1];
                        } else if (m && m.length > 1) {
                            obj.value = new Date(m[1]);
                        }
                    }


                    break;
                case REGEX.startsWith:
                case REGEX.endsWith:
                case REGEX.contains:
                    obj = buildLike(match, key);
                    break;
                }
                found = true;
            }
        }
        return obj;
    }

    function parseNested(filter) {
        const expressions = {};

        const handleSubstitutions = (key, filterSubstring) => {
            let subsituted = false;
            // the expression by key is a reference another expression
            if (!expressions[key] && filterSubstring.match(KEY_REGEX)) {
                expressions[key] = expressions[filterSubstring];
                subsituted = true;
            } else {
                handleExpressionCascade(key, 'subject');
                handleExpressionCascade(key, 'value');
            }
            if (!subsituted) {
                const match = filterSubstring.match(KEY_REGEX);
                if (match && match.length === 2) {
                    expressions[key].subject = expressions[match[0]];
                    expressions[key].value = expressions[match[1]];
                } else if (match && match.length == 1) {
                    if (filterSubstring.indexOf('$') === 0) {
                        expressions[key].subject = expressions[match[0]];
                    } else {
                        expressions[key].value = expressions[match[0]];
                    }
                }
            }
        };

        /**
         * Cascade a parameter of an expression to a matched expression
         * @param key - the key in the cache
         * @param param - the parameter key (subject|value)
         */
        const handleExpressionCascade = (key, param) => {
            let match = (expressions[key] && typeof expressions[key][param] === 'string') ? expressions[key][param].match(KEY_REGEX) : undefined;
            if (match && match.length == 1) {
                expressions[key][param] = expressions[match[0]];
            }
        };

        /**
         * Determine if the opening parathensis belongs to a function such as
         * "contains(" or "startswith("
         *
         * @param str
         * @param i
         * @returns {boolean}
         */
        const isParenthesisForFunction = (str, i) => {
            let retVal = false;
            Object.keys(Functions).forEach(fn => {
                const fnLen = Functions[fn].length;
                retVal = retVal || (i > fnLen && str.substring(i - fnLen, i) === Functions[fn]);
            });
            return retVal;
        };

        while (filter.indexOf('(') !== -1) {
            let i, leftParenthesisIndex = 0;
            let isInsideQuotes = false;
            let isInsideFunction = false;
            for (i = 0; i < filter.length; i++) {
                if (filter[i] === '\'') {
                    isInsideQuotes = !isInsideQuotes;
                    continue;
                } else if (!isInsideQuotes) {
                    if (filter[i] === '(') {
                        if (isParenthesisForFunction(filter, i)) {
                            isInsideFunction = true;
                            continue;
                        }
                        leftParenthesisIndex = i;
                    } else if (filter[i] === ')') {
                        const filterSubstring = filter.substring(leftParenthesisIndex + 1, (isInsideFunction ? i + 1 : i));
                        if (isInsideFunction) {
                            leftParenthesisIndex++; // need to include full parenthesis
                            isInsideFunction = false;
                        }
                        const key = `$${Object.keys(expressions).length}$`;
                        expressions[key] = parseFragment(filterSubstring);
                        handleSubstitutions(key, filterSubstring);
                        filter = `${filter.substring(0, leftParenthesisIndex)}${key}${filter.substring(i + 1)}`;
                        break;
                    }
                }
                if (i === filter.length - 1) {
                    throw {
                        key: 'INVALID_FILTER_STRING',
                        msg: 'The given string has uneven number of parenthesis'
                    };
                }
            }
        }
        return expressions[`$${Object.keys(expressions).length - 1}$`];
    }

    return {
        parse: function (filterStr) {
            if (!filterStr || filterStr === '') {
                return null;
            }
            let filter = filterStr.trim();
            let obj = {};
            if (filter.length > 0) {
                obj = parseFragment(filter);
            }
            return obj;
        }
    };
}();

module.exports = {
    Parser: ODataParser,
    Operators: Operators,
    Predicate: Predicate
};
