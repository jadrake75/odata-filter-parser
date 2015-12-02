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

var superagent = require('superagent')
var expect = require('expect.js')
var operator = require("../src/odata-parser").operator;

describe('Operator Tests', function (done) {

    describe('OData Operator tests', function () {

        it('Logical test for and', function () {
            var s = "and";
            expect(s).to.be.eql(operator.AND);
            expect(operator.isLogical(s)).to.be(true);
        });

        it('Logical test for or', function () {
            var s = "or";
            expect(s).to.be.eql(operator.OR);
            expect(operator.isLogical(s)).to.be(true);
        });

        it('Logical test not valid for eq', function () {
            var s = "eq";
            expect(operator.isLogical(s)).to.be(false);
        });

        it('Unary test for null', function() {
            var s = "is null";
            expect(s).to.be.eql(operator.IS_NULL);
            expect(operator.isUnary(s)).to.be(true);
        });

        it('Unary test for binary operation', function() {
            var s = "and";
            expect(operator.isUnary(s)).to.be(false);
        });
    });
});