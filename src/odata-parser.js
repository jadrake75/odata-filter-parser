/**
 Copyright 2015 Jason Drake

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

var Operators = {
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
        var value = false;
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

/**
 * Predicate is the basic model construct of the odata expression
 *
 * @param config
 * @returns {Predicate}
 * @constructor
 */
var Predicate = function (config) {
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
    var result;
    var arr = [];
    if( p instanceof Array ) {
        arr = p;
    } else {
        for( var i = 1; i < arguments.length; i++ ) {
            arr.push( arguments[i] );
        }
    }
    var len = arr.length;
    result = new Predicate({
        subject: arr[0],
        operator: operator
    });
    if (len === 2) {
        result.value = arr[len - 1];
    } else {
        var a = [];
        for( var j = 1; j < len; j++ ) {
            a.push(arr[j]);
        }
        result.value = Predicate.concat(operator, a);
    }
    return result;
};

Predicate.prototype.flatten = function(result) {
    if( !result ) {
        result = [];
    }
    if( Operators.isLogical(this.operator) ) {
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
Predicate.prototype.serialize = function() {
    var retValue = '';
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
        retValue = '(' + ((this.subject instanceof Predicate) ? this.subject.serialize() : this.subject) + ' ' + this.operator;
        if (!Operators.isUnary(this.operator)) {
            if (this.value === undefined || this.value === null) {
                throw {
                    key: 'INVALID_VALUE',
                    msg: 'The value was required but was not defined.'
                };
            }
            retValue += ' ';
            var val = typeof this.value;
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
        retValue += ')';
    }
    return retValue;
};

var ODataParser = function() {

    "use strict";

    var REGEX = {
        parenthesis: /^([(](.*)[)])$/,
        andor: /^(.*?) (or|and)+ (.*)$/,
        op: /(\w*) (eq|gt|lt|ge|le|ne) (datetimeoffset'(.*)'|'(.*)'|[0-9]*)/,
        startsWith: /^startswith[(](.*),'(.*)'[)]/,
        endsWith: /^endswith[(](.*),'(.*)'[)]/,
        contains: /^contains[(](.*),'(.*)'[)]/
    };

    function buildLike(match, key) {
        var right = (key === 'startsWith') ? match[2] + '*' : (key === 'endsWith') ? '*' + match[2] : '*' + match[2] + '*';
        return {
            subject: match[1],
            operator: Operators.LIKE,
            value: right
        };
    }

    function parseFragment(filter) {
        var found = false;
        var obj = null;
        for (var key in REGEX ) {
            var regex = REGEX[key];
            if( found ) {
                break;
            }
            var match = filter.match(regex);
            if( match ) {
                switch (regex) {
                    case REGEX.parenthesis:
                        if( match.length > 2 ) {
                            if( match[2].indexOf(')') < match[2].indexOf('(')) {
                                continue;
                            }
                            obj = parseFragment(match[2]);
                        }
                        break;
                    case REGEX.andor:
                        obj = new Predicate({
                            subject: parseFragment(match[1]),
                            operator: match[2],
                            value: parseFragment(match[3])
                        });
                        break;
                    case REGEX.op:
                        obj = new Predicate({
                            subject: match[1],
                            operator: match[2],
                            value: ( match[3].indexOf('\'') === -1) ? +match[3] : match[3]
                        });
                        if(typeof obj.value === 'string') {
                            var quoted = obj.value.match(/^'(.*)'$/);
                            var m = obj.value.match(/^datetimeoffset'(.*)'$/);
                            if(quoted && quoted.length > 1) {
                                obj.value = quoted[1];
                                console.log("new value=", obj.value);
                            }
                            else if(m && m.length > 1) {
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

    return {
        parse: function(filterStr) {
            if( !filterStr || filterStr === '') {
                return null;
            }
            var filter = filterStr.trim();
            var obj = {};
            if( filter.length > 0 ) {
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