/**
 Copyvalue 2022 Jason Drake

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

var parser = require("../../src/odata-parser").Parser;
var Predicate = require("../../src/odata-parser").Predicate;

describe('ODataParser Tests', done => {

    describe('OData parsing tests', () => {

        it('Null string is not parsed', () => {
            expect(parser.parse(null)).toBe(null);
        });

        it('Empty string is not parsed', () => {
            expect(parser.parse('')).toBe(null);
        });

        it('Simple binary expression test', () => {
            var s = "name eq 'test'";
            var obj = parser.parse(s);
            expect(obj.subject).toEqual("name");
            expect(obj.operator).toEqual("eq");
            expect(obj.value).toEqual("test");
        });

        it('Simple binary expression with String with spaces', () => {
            var s = "name eq 'test of strings'";
            var obj = parser.parse(s);
            expect(obj.subject).toEqual("name");
            expect(obj.operator).toEqual("eq");
            expect(obj.value).toEqual("test of strings");
        });

        it('Simple binary expression with a number value', () => {
            var s = "id gt 5";
            var obj = parser.parse(s);
            expect(obj.subject).toEqual("id");
            expect(obj.operator).toEqual("gt");
            expect(new Number(obj.value)).toBeTruthy();
            expect(obj.value).toEqual(5);
        });

        it(
            'Simple binary expression with a number value enclosed with parenthesis',
            () => {
                var s = "(id lt 5)";
                var obj = parser.parse(s);
                expect(obj.subject).toEqual("id");
                expect(obj.operator).toEqual("lt");
                expect(new Number(obj.value)).toBeTruthy();
                expect(obj.value).toEqual(5);
            }
        );

        it('Simple binary expression with text containing parenthesis', () => {
            var s = "name eq 'ultramarine (R)'";
            var obj = parser.parse(s);
            expect(obj.subject).toEqual("name");
            expect(obj.operator).toEqual("eq");
            expect(obj.value).toEqual("ultramarine (R)");
        });

        it(
            'Simple binary expression with text containing parenthesis and bracketted parenthesis',
            () => {
                var s = "(name eq 'ultramarine (R)')";
                var obj = parser.parse(s);
                expect(obj.subject).toEqual("name");
                expect(obj.operator).toEqual("eq");
                expect(obj.value).toEqual("ultramarine (R)");
            }
        );

        it(
            'Compound binary expression with text containing parenthesis',
            () => {
                var s = "((name eq 'ultramarine (R)') and (rate eq '1d'))";
                var obj = parser.parse(s);
                var subject = obj.subject;
                var value = obj.value;
                expect( obj.operator).toEqual("and");
                expect(subject.subject).toEqual("name");
                expect(subject.operator).toEqual("eq");
                expect(subject.value).toEqual("ultramarine (R)");
                expect(value.subject).toEqual("rate");
                expect(value.operator).toEqual("eq");
                expect(value.value).toEqual("1d");
            }
        );

        it('Compound binary expression with parenthesis on value', () => {
            var s = "((name eq 'Bob') and (id gt 5))";
            var obj = parser.parse(s);
            var subject = obj.subject;
            var value = obj.value;
            expect(obj.operator).toEqual("and");
            expect(subject.subject).toEqual("name");
            expect(subject.operator).toEqual("eq");
            expect(subject.value).toEqual("Bob");
            expect(value.subject).toEqual("id");
            expect(value.operator).toEqual("gt");
            expect(value.value).toEqual(5);
        });

        it('More complex multiple binary expressions', () => {
            var s = "(name eq 'Bob' and (lastName eq 'Smiley' and (weather ne 'sunny' or temp ge 54)))";
            var obj = parser.parse(s);
            var subject = obj.subject;
            var value = obj.value;
            expect(obj.operator).toEqual("and");
            expect(subject.subject).toEqual("name");
            expect(subject.operator).toEqual("eq");
            expect(subject.value).toEqual("Bob");
            expect(value.operator).toEqual("and");
            subject = value.subject;
            value = value.value;
            expect(subject.subject).toEqual("lastName");
            expect(subject.operator).toEqual("eq");
            expect(subject.value).toEqual("Smiley");

            expect(value.operator).toEqual("or");
            subject = value.subject;
            value = value.value;
            expect(subject.subject).toEqual("weather");
            expect(subject.operator).toEqual("ne");
            expect(subject.value).toEqual("sunny");
            expect(value.subject).toEqual("temp");
            expect(value.operator).toEqual("ge");
            expect(value.value).toEqual(54);

        });

        it('Nested binary expressions', () => {
            var s = "(((district eq 'all') or (district eq 'palilula')) and ((malfunctions eq 'true') or (maintenance eq 'true')))";
            var obj = parser.parse(s);
            var subject = obj.subject;
            var value = obj.value;
            var subjectNestedSubject = subject.subject;
            var subjectNestedValue = subject.value;
            var valueNestedSubject = value.subject;
            var valueNestedValue = value.value;

            expect(obj.operator).toEqual("and");
            expect(subject.operator).toEqual("or");
            expect(value.operator).toEqual("or");

            expect(subjectNestedSubject.subject).toEqual("district");
            expect(subjectNestedSubject.value).toEqual("all");
            expect(subjectNestedSubject.operator).toEqual("eq");

            expect(subjectNestedValue.subject).toEqual("district");
            expect(subjectNestedValue.value).toEqual("palilula");
            expect(subjectNestedValue.operator).toEqual("eq");

            expect(valueNestedSubject.subject).toEqual("malfunctions");
            expect(valueNestedSubject.value).toEqual("true");
            expect(valueNestedSubject.operator).toEqual("eq");

            expect(valueNestedValue.subject).toEqual("maintenance");
            expect(valueNestedValue.value).toEqual("true");
            expect(valueNestedValue.operator).toEqual("eq");
        });

        it('Verify startsWith condition', () => {
            var s = "startswith(name,'Ja')";
            var obj = parser.parse(s);
            expect( obj.subject).toEqual('name');
            expect( obj.value).toEqual('Ja*');
            expect( obj.operator).toEqual('like');
        })

        it('Verify endsWith condition', () => {
            var s = "endswith(name,'Hole')";
            var obj = parser.parse(s);
            expect( obj.subject).toEqual('name');
            expect( obj.value).toEqual('*Hole');
            expect( obj.operator).toEqual('like');
        });

        it('Verify contains condition', () => {
            var s = "contains(name,'Something')";
            var obj = parser.parse(s);
            expect( obj.subject).toEqual('name');
            expect( obj.value).toEqual('*Something*');
            expect( obj.operator).toEqual('like');
        });

        it('Verify compound expression with contains condition', () => {
            var s = "contains(name,'Something') and (name eq 'test')";
            var obj = parser.parse(s);
            expect(obj.operator).toBe('and');
            let containsPredicate = obj.subject;
            let eqPredicate = obj.value;
            expect(containsPredicate instanceof Predicate).toBe(true);
            expect(eqPredicate instanceof Predicate).toBe(true);
            expect( containsPredicate.subject).toEqual('name');
            expect( containsPredicate.value).toEqual('*Something*');
            expect( eqPredicate.subject).toEqual('name');
            expect( eqPredicate.value).toEqual('test');
            expect( eqPredicate.operator).toEqual('eq');
        });

        it('Verify compound expression with contains condition wrapped', () => {
            var s = "(contains(name,'Something') and (name eq 'test'))";
            var obj = parser.parse(s);
            expect(obj.operator).toBe('and');
            let containsPredicate = obj.subject;
            let eqPredicate = obj.value;
            expect(containsPredicate instanceof Predicate).toBe(true);
            expect(eqPredicate instanceof Predicate).toBe(true);
            expect( containsPredicate.subject).toEqual('name');
            expect( containsPredicate.value).toEqual('*Something*');
            expect( eqPredicate.subject).toEqual('name');
            expect( eqPredicate.value).toEqual('test');
            expect( eqPredicate.operator).toEqual('eq');
        });

        it('Verify compound expression with contains condition wrapped twice', () => {
            var s = "((contains(name,'Something')) and (name eq 'test'))";
            var obj = parser.parse(s);
            expect(obj.operator).toBe('and');
            let containsPredicate = obj.subject;
            let eqPredicate = obj.value;
            expect(containsPredicate instanceof Predicate).toBe(true);
            expect(eqPredicate instanceof Predicate).toBe(true);
            expect( containsPredicate.subject).toEqual('name');
            expect( containsPredicate.value).toEqual('*Something*');
            expect( eqPredicate.subject).toEqual('name');
            expect( eqPredicate.value).toEqual('test');
            expect( eqPredicate.operator).toEqual('eq');
        });

        it('Verify like operations return a Predicate', () => {
            var s = "contains(name,'predName')";
            var obj = parser.parse(s);
            expect( obj instanceof Predicate).toBe(true);
        });

        it('Parse datetimeoffset value', () => {
            var s = "(purchased le datetimeoffset'2015-12-06T05:00:00.000Z')";
            var obj = parser.parse(s);
            expect( obj.subject).toEqual('purchased');
            expect( obj.value).toEqual(new Date('2015-12-06T05:00:00.000Z'));
            expect( obj.operator).toEqual('le');
        });

        it('Mismatched paranthesis fails at start', () => {
            var s = "(((((value ge 5)))";
            try {
                var obj = parser.parse(s);
            } catch(e) {
                expect(e.key).toBe('INVALID_FILTER_STRING');
            }
        });

        it('Mismatched paranthesis fails at end', () => {
            var s = "value eq ')')";
            try {
                var obj = parser.parse(s);
            } catch(e) {
                expect(e.key).toBe('INVALID_FILTER_STRING');
            }
        });
    });

});
