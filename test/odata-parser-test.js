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
var parser = require("../src/odata-parser").parser;

describe('ODataParser Tests', function (done) {

    describe('OData parsing tests', function () {

        it('Simple binary expression test', function () {
            var s = "name eq 'test'";
            var obj = parser.parse(s);
            expect(obj.left).to.be.eql("name");
            expect(obj.type).to.be.eql("eq");
            expect(obj.right).to.be.eql("'test'");
        });

        it('Simple binary expression with String with spaces', function () {
            var s = "name eq 'test of strings'";
            var obj = parser.parse(s);
            expect(obj.left).to.be.eql("name");
            expect(obj.type).to.be.eql("eq");
            expect(obj.right).to.be.eql("'test of strings'");
        });

        it('Simple binary expression with a number value', function () {
            var s = "id gt 5";
            var obj = parser.parse(s);
            expect(obj.left).to.be.eql("id");
            expect(obj.type).to.be.eql("gt");
            expect(new Number(obj.right)).to.be.ok();
            expect(obj.right).to.be.eql(5);
        });

        it('Simple binary expression with a number value enclosed with parenthesis', function () {
            var s = "(id lt 5)";
            var obj = parser.parse(s);
            expect(obj.left).to.be.eql("id");
            expect(obj.type).to.be.eql("lt");
            expect(new Number(obj.right)).to.be.ok();
            expect(obj.right).to.be.eql(5);
        });

        it('Simple binary expression with text containing parenthesis', function() {
            var s = "name eq 'ultramarine (R)'";
            var obj = parser.parse(s);
            expect(obj.left).to.be.eql("name");
            expect(obj.type).to.be.eql("eq");
            expect(obj.right).to.be.eql("'ultramarine (R)'");
        });

        it('Simple binary expression with text containing parenthesis and bracketted parenthesis', function() {
            var s = "(name eq 'ultramarine (R)')";
            var obj = parser.parse(s);
            expect(obj.left).to.be.eql("name");
            expect(obj.type).to.be.eql("eq");
            expect(obj.right).to.be.eql("'ultramarine (R)'");
        });

        it('Compound binary expression with text containing parenthesis', function() {
            var s = "((name eq 'ultramarine (R)') and (rate eq '1d'))";
            var obj = parser.parse(s);
            var left = obj.left;
            var right = obj.right;
            expect( obj.type).to.be.eql("and");
            expect(left.left).to.be.eql("name");
            expect(left.type).to.be.eql("eq");
            expect(left.right).to.be.eql("'ultramarine (R)'");
            expect(right.left).to.be.eql("rate");
            expect(right.type).to.be.eql("eq");
            expect(right.right).to.be.eql("'1d'");
        });

        it('Compound binary expression with parenthesis on right', function () {
            var s = "((name eq 'Bob') and (id gt 5))";
            var obj = parser.parse(s);
            var left = obj.left;
            var right = obj.right;
            expect(obj.type).to.be.eql("and");
            expect(left.left).to.be.eql("name");
            expect(left.type).to.be.eql("eq");
            expect(left.right).to.be.eql("\'Bob\'");
            expect(right.left).to.be.eql("id");
            expect(right.type).to.be.eql("gt");
            expect(right.right).to.be.eql(5);
        });

        it('More complex multiple binary expressions', function() {
            var s = "(name eq 'Bob' and (lastName eq 'Smiley' and (weather ne 'sunny' or temp ge 54)))";
            var obj = parser.parse(s);
            var left = obj.left;
            var right = obj.right;
            expect(obj.type).to.be.eql("and");
            expect(left.left).to.be.eql("name");
            expect(left.type).to.be.eql("eq");
            expect(left.right).to.be.eql("\'Bob\'");
            expect(right.type).to.be.eql("and");
            left = right.left;
            right = right.right;
            expect(left.left).to.be.eql("lastName");
            expect(left.type).to.be.eql("eq");
            expect(left.right).to.be.eql("\'Smiley\'");

            expect(right.type).to.be.eql("or");
            left = right.left;
            right = right.right;
            expect(left.left).to.be.eql("weather");
            expect(left.type).to.be.eql("ne");
            expect(left.right).to.be.eql("\'sunny\'");
            expect(right.left).to.be.eql("temp");
            expect(right.type).to.be.eql("ge");
            expect(right.right).to.be.eql("54");

        });

        it('Verify startsWith condition', function() {
            var s = "startswith(name,'Ja')";
            var obj = parser.parse(s);
            expect( obj.left).to.be.eql('name');
            expect( obj.right).to.be.eql('\'Ja*\'');
            expect( obj.type).to.be.eql('like');
        })

        it('Verify endsWith condition', function() {
            var s = "endswith(name,'Hole')";
            var obj = parser.parse(s);
            expect( obj.left).to.be.eql('name');
            expect( obj.right).to.be.eql('\'*Hole\'');
            expect( obj.type).to.be.eql('like');
        });

        it('Verify contains condition', function() {
            var s = "contains(name,'Something')";
            var obj = parser.parse(s);
            expect( obj.left).to.be.eql('name');
            expect( obj.right).to.be.eql('\'*Something*\'');
            expect( obj.type).to.be.eql('like');
        });

    });

    describe('OData flatten tests', function() {

        it('Flatten single statement', function () {
            var s = {
                left: "name",
                type: "eq",
                right: "'Bob'"
            };
            var obj = parser.flatten(s);
            expect(obj.length).to.be.eql(1);
            expect(obj[0].left).to.be.eql("name");
            expect(obj[0].type).to.be.eql("eq");
            expect(obj[0].right).to.be.eql("'Bob'");
        });

        it('Flatten two and statements', function () {
            var s = {
                left: {
                    left: "name",
                    type: "eq",
                    right: "'Bob'"
                },
                type: "and",
                right: {
                    left: "lastname",
                    type: "eq",
                    right: "'someone'"
                }
            };

            var obj = parser.flatten(s);
            console.log(obj);
            expect(obj.length).to.be.eql(2);
            var left = obj[0];
            expect(left.left).to.be.eql("name");
            expect(left.type).to.be.eql("eq");
            expect(left.right).to.be.eql("'Bob'");
            var right = obj[1];
            expect(right.left).to.be.eql("lastname");
            expect(right.type).to.be.eql("eq");
            expect(right.right).to.be.eql("'someone'");
        });
    });
});
