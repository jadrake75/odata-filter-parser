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

var Operator = {
    EQUALS: 'eq',
    AND: 'and',
    OR: 'or',
    GREATER_THAN: 'gt',
    LESS_THAN: 'lt',
    GREATER_THAN_EQUAL: 'ge',
    LESS_THAN_EQUAL: 'le',
    NOT_EQUAL: 'ne',
    IS_NULL: 'is null',

    /**
     * Whether a defined operation is unary or binary.  Will return true
     * if the operation only supports a subject with no value.
     *
     * @param {String} op the operation to check.
     * @return {Boolean} whether the operation is an unary operation.
     */
    isUnary: function (op) {
        var value = false;
        if (op === Operator.IS_NULL) {
            value = true;
        }
        return value;
    },
    /**
     * Whether a defined operation is a logical operator or not.
     *
     * @param {String} op the operation to check.
     * @return {Boolean} whether the operation is a logical operation.
     */
    isLogical: function (op) {
        return (op === Operator.AND || op === Operator.OR);
    }
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

    function buildLike(match,key) {
        var right = (key === 'startsWith') ? match[2] + '*' : (key === 'endsWith') ? '*' + match[2] : '*' + match[2] + '*';
        if( match[0].charAt(match[0].lastIndexOf(')')-1) === "\'") {
            right = "\'" + right + "\'";
        }
        return {
            left: match[1],
            type: 'like',
            right: right
        };
    }

    return {
        flatten: function(predicate, result) {
            if( !result ) {
                result = [];
            }
            if( Operator.isLogical(predicate.type) ) {
                this.flatten( predicate.left, result);
                this.flatten( predicate.right, result);
            } else {
                result.push(predicate);
            }
            return result;
        },

        parse: function(filterStr) {
            var self = this;
            if( !filterStr ) {
                return null;
            }
            var filter = filterStr.trim();
            var obj = {};
            if( filter.length > 0 ) {
                obj = self.parseFragment(filter);
            }
            return obj;
        },

        parseFragment: function(filter) {
            var self = this;
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
                                obj = self.parseFragment(match[2]);
                            }
                            break;
                        case REGEX.andor:
                            obj = {
                                left: self.parseFragment(match[1]),
                                type: match[2],
                                right: self.parseFragment(match[3])
                            };
                            break;
                        case REGEX.op:
                            obj = {
                                left: match[1],
                                type: match[2],
                                right: ( match[3].indexOf('\'') === -1) ? +match[3] : match[3]
                            };
                            break;
                        case REGEX.startsWith:
                        case REGEX.endsWith:
                        case REGEX.contains:
                            obj = buildLike(match,key);
                            break;
                    }
                    found = true;
                }
            };
            return obj;
        }
    };
}();

module.exports = {
    parser: ODataParser,
    operator: Operator
};