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

var operators = require("../../src/odata-parser").Operators;

describe('Operator Tests', done => {

    describe('OData Operator tests', () => {

        it('Logical test for and', () => {
            var s = "and";
            expect(s).toEqual(operators.AND);
            expect(operators.isLogical(s)).toBe(true);
        });

        it('Logical test for or', () => {
            var s = "or";
            expect(s).toEqual(operators.OR);
            expect(operators.isLogical(s)).toBe(true);
        });

        it('Logical test not valid for eq', () => {
            var s = "eq";
            expect(operators.isLogical(s)).toBe(false);
        });

        it('Unary test for null', () => {
            var s = "is null";
            expect(s).toEqual(operators.IS_NULL);
            expect(operators.isUnary(s)).toBe(true);
        });

        it('Unary test for binary operation', () => {
            var s = "and";
            expect(operators.isUnary(s)).toBe(false);
        });
    });
});