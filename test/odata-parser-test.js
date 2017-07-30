/**
 Copyvalue 2015 Jason Drake

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
var parser = require("../src/odata-parser").Parser;
var Predicate = require("../src/odata-parser").Predicate;

describe('ODataParser Tests', function (done) {

    describe('OData parsing tests', function () {

        it('Null string is not parsed', function() {
            expect(parser.parse(null)).to.be(null);
        });

        it('Empty string is not parsed', function() {
            expect(parser.parse('')).to.be(null);
        });

        it('Simple binary expression test', function () {
            var s = "name eq 'test'";
            var obj = parser.parse(s);
            expect(obj.subject).to.be.eql("name");
            expect(obj.operator).to.be.eql("eq");
            expect(obj.value).to.be.eql("test");
        });

        it('Simple binary expression with String with spaces', function () {
            var s = "name eq 'test of strings'";
            var obj = parser.parse(s);
            expect(obj.subject).to.be.eql("name");
            expect(obj.operator).to.be.eql("eq");
            expect(obj.value).to.be.eql("test of strings");
        });

        it('Simple binary expression with a number value', function () {
            var s = "id gt 5";
            var obj = parser.parse(s);
            expect(obj.subject).to.be.eql("id");
            expect(obj.operator).to.be.eql("gt");
            expect(new Number(obj.value)).to.be.ok();
            expect(obj.value).to.be.eql(5);
        });

        it('Simple binary expression with a number value enclosed with parenthesis', function () {
            var s = "(id lt 5)";
            var obj = parser.parse(s);
            expect(obj.subject).to.be.eql("id");
            expect(obj.operator).to.be.eql("lt");
            expect(new Number(obj.value)).to.be.ok();
            expect(obj.value).to.be.eql(5);
        });

        it('Simple binary expression with text containing parenthesis', function() {
            var s = "name eq 'ultramarine (R)'";
            var obj = parser.parse(s);
            expect(obj.subject).to.be.eql("name");
            expect(obj.operator).to.be.eql("eq");
            expect(obj.value).to.be.eql("ultramarine (R)");
        });

        it('Simple binary expression with text containing parenthesis and bracketted parenthesis', function() {
            var s = "(name eq 'ultramarine (R)')";
            var obj = parser.parse(s);
            expect(obj.subject).to.be.eql("name");
            expect(obj.operator).to.be.eql("eq");
            expect(obj.value).to.be.eql("ultramarine (R)");
        });

        it('Compound binary expression with text containing parenthesis', function() {
            var s = "((name eq 'ultramarine (R)') and (rate eq '1d'))";
            var obj = parser.parse(s);
            var subject = obj.subject;
            var value = obj.value;
            expect( obj.operator).to.be.eql("and");
            expect(subject.subject).to.be.eql("name");
            expect(subject.operator).to.be.eql("eq");
            expect(subject.value).to.be.eql("ultramarine (R)");
            expect(value.subject).to.be.eql("rate");
            expect(value.operator).to.be.eql("eq");
            expect(value.value).to.be.eql("1d");
        });

        it('Compound binary expression with parenthesis on value', function () {
            var s = "((name eq 'Bob') and (id gt 5))";
            var obj = parser.parse(s);
            var subject = obj.subject;
            var value = obj.value;
            expect(obj.operator).to.be.eql("and");
            expect(subject.subject).to.be.eql("name");
            expect(subject.operator).to.be.eql("eq");
            expect(subject.value).to.be.eql("Bob");
            expect(value.subject).to.be.eql("id");
            expect(value.operator).to.be.eql("gt");
            expect(value.value).to.be.eql(5);
        });

        it('More complex multiple binary expressions', function() {
            var s = "(name eq 'Bob' and (lastName eq 'Smiley' and (weather ne 'sunny' or temp ge 54)))";
            var obj = parser.parse(s);
            var subject = obj.subject;
            var value = obj.value;
            expect(obj.operator).to.be.eql("and");
            expect(subject.subject).to.be.eql("name");
            expect(subject.operator).to.be.eql("eq");
            expect(subject.value).to.be.eql("Bob");
            expect(value.operator).to.be.eql("and");
            subject = value.subject;
            value = value.value;
            expect(subject.subject).to.be.eql("lastName");
            expect(subject.operator).to.be.eql("eq");
            expect(subject.value).to.be.eql("Smiley");

            expect(value.operator).to.be.eql("or");
            subject = value.subject;
            value = value.value;
            expect(subject.subject).to.be.eql("weather");
            expect(subject.operator).to.be.eql("ne");
            expect(subject.value).to.be.eql("sunny");
            expect(value.subject).to.be.eql("temp");
            expect(value.operator).to.be.eql("ge");
            expect(value.value).to.be.eql("54");

        });

        it('Verify startsWith condition', function() {
            var s = "startswith(name,'Ja')";
            var obj = parser.parse(s);
            expect( obj.subject).to.be.eql('name');
            expect( obj.value).to.be.eql('Ja*');
            expect( obj.operator).to.be.eql('like');
        })

        it('Verify endsWith condition', function() {
            var s = "endswith(name,'Hole')";
            var obj = parser.parse(s);
            expect( obj.subject).to.be.eql('name');
            expect( obj.value).to.be.eql('*Hole');
            expect( obj.operator).to.be.eql('like');
        });

        it('Verify contains condition', function() {
            var s = "contains(name,'Something')";
            var obj = parser.parse(s);
            expect( obj.subject).to.be.eql('name');
            expect( obj.value).to.be.eql('*Something*');
            expect( obj.operator).to.be.eql('like');
        });

        it('Verify like operations return a Predicate', function() {
            var s = "contains(name,'predName')";
            var obj = parser.parse(s);
            expect( obj instanceof Predicate).to.be(true);
        });

        it('Parse datetimeoffset value', function() {
            var s = "(purchased le datetimeoffset'2015-12-06T05:00:00.000Z')";
            var obj = parser.parse(s);
            expect( obj.subject).to.be.eql('purchased');
            expect( obj.value).to.be.eql(new Date('2015-12-06T05:00:00.000Z'));
            expect( obj.operator).to.be.eql('le');
        })
    });

});
