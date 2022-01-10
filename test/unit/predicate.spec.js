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

var Predicate = require("../../src/odata-parser").Predicate;
var Operators = require("../../src/odata-parser").Operators;

describe('Predicate Tests', done => {

    describe('Predicate tests', () => {
        it('Empty constructor', () => {
            var p = new Predicate();
            expect(p.operator).toBe(Operators.EQUALS);
            expect(p.subject).toBe(undefined);
            expect(p.value).toBe(undefined);
        });
    });

    describe('Predicate serialization tests', () => {

        it('Serialize a simple object', () => {
            var p = new Predicate({
                subject: 'name',
                operator: Operators.EQUALS,
                value: 'Serena'
            });
            expect(p.serialize()).toEqual("(name eq 'Serena')");
        });

        it('Serialize a simple logical set of objects', () => {
            var p = new Predicate({
                subject: new Predicate({
                    subject: 'name',
                    operator: Operators.EQUALS,
                    value: 'Serena'
                }),
                operator: Operators.AND,
                value: new Predicate({
                    subject: 'lastname',
                    operator: Operators.NOT_EQUAL,
                    value: 'Martinez'
                })
            });
            expect(p.serialize()).toEqual("((name eq 'Serena') and (lastname ne 'Martinez'))");
        });

        it('Serialize boolean values', () => {
            var p = new Predicate({
                subject: 'happy',
                operator: Operators.EQUALS,
                value: true
            });
            expect(p.serialize()).toEqual("(happy eq true)");
        });

        it('Serialize numeric floating-point values', () => {
            var p = new Predicate({
                subject: 'pi',
                operator: Operators.GREATER_THAN,
                value: 3.14159
            });
            expect(p.serialize()).toEqual("(pi gt 3.14159)");
        });

        it('Serialize numeric integer values', () => {
            var p = new Predicate({
                subject: 'age',
                operator: Operators.NOT_EQUAL,
                value: 30
            });
            expect(p.serialize()).toEqual("(age ne 30)");
        });

        it('Serialize current date to ISO String', () => {
            var d = new Date();
            var p = new Predicate({
                subject: 'created',
                operator: Operators.GREATER_THAN,
                value: d
            });
            expect(p.serialize()).toEqual("(created gt datetimeoffset'" + d.toISOString() + "')");
        });

        it('Serialize object value fails', () => {
            var p = new Predicate({
                subject: 'created',
                operator: Operators.EQUALS,
                value: { a: "nice" }
            });
            try {
                expect(p.serialize());
                fail("Should have failed to serialize an object value");
            } catch( err ) {
                expect(err).not.toBe(null);
                expect(err.key).toEqual('UNKNOWN_TYPE');
            }
        });

        it('Serialize null value fails', () => {
            var p = new Predicate({
                subject: 'created',
                operator: Operators.EQUALS,
                value: null
            });
            try {
                expect(p.serialize());
                fail("Should have failed to serialize a null value");
            } catch( err ) {
                expect(err).not.toBe(null);
                expect(err.key).toEqual('INVALID_VALUE');
            }
        });

        it('Serialize null subject fails', () => {
            var p = new Predicate({
                subject: null,
                operator: Operators.EQUALS,
                value: 'foo'
            });
            try {
                expect(p.serialize());
                fail("Should have failed to serialize a null subject");
            } catch( err ) {
                expect(err).not.toBe(null);
                expect(err.key).toEqual('INVALID_SUBJECT');
            }
        });

        it(
            'Serialize logical expression where one side is a not at least a predicate fails',
            () => {
                var p = new Predicate({
                    subject: 'name',
                    operator: Operators.AND,
                    value: 'foo'
                });
                try {
                    expect(p.serialize());
                    fail("Should have failed to serialize a non-predicate value");
                } catch( err ) {
                    expect(err).not.toBe(null);
                    expect(err.key).toEqual('INVALID_LOGICAL');
                }
            }
        );

        it('Serialize LIKE with no wildcard', () => {
            var p = new Predicate({
                subject: 'name',
                operator: Operators.LIKE,
                value: 'Serena'
            });
            var s = p.serialize();
            expect(s).toBe('(contains(name,\'Serena\'))');
        });

        it('Serialize LIKE with wildcards', () => {
            var p = new Predicate({
                subject: 'name',
                operator: Operators.LIKE,
                value: '*Some*'
            });
            var s = p.serialize();
            expect(s).toBe('(contains(name,\'Some\'))');
        });

        it('Serialize LIKE with starting wildcard', () => {
            var p = new Predicate({
                subject: 'name',
                operator: Operators.LIKE,
                value: '*ending'
            });
            var s = p.serialize();
            expect(s).toBe('(endswith(name,\'ending\'))');
        });

        it('Serialize LIKE with ending wildcard', () => {
            var p = new Predicate({
                subject: 'name',
                operator: Operators.LIKE,
                value: 'starting*'
            });
            var s = p.serialize();
            expect(s).toBe('(startswith(name,\'starting\'))');
        });

        it('Serialize LIKE with middle wildcard', () => {
            var p = new Predicate({
                subject: 'name',
                operator: Operators.LIKE,
                value: 'start*end'
            });
            var s = p.serialize();
            expect(s).toBe('(contains(name,\'start*end\'))');
        });
    });

    describe('Predicate concat tests', () => {

        it('Invalid case of a single predicate', () => {
            var p = new Predicate({
                subject: 'name',
                operator: Operators.EQUALS,
                value: 'Serena'
            });
            try {
                var result = Predicate.concat(Operators.AND, p);
                fail("expected error");
            } catch( err ) {
                expect(err).not.toBe(null);
                expect(err.key).toEqual('INSUFFICIENT_PREDICATES');
            }
        });

        it('Invalid case with non-logical operator', () => {
            var p = new Predicate({
                subject: 'name',
                operator: Operators.EQUALS,
                value: 'Serena'
            });
            var p2 = new Predicate({
                subject: 'age',
                operator: Operators.LESS_THAN,
                value: 5
            });
            try {
                var result = Predicate.concat(Operators.LESS_THAN, p, p2);
                fail("expected error");
            } catch( err ) {
                expect(err).not.toBe(null);
                expect(err.key).toEqual('INVALID_LOGICAL');
            }
        });

        it('Concatenate two simple predicates with AND', () => {
            var p = new Predicate({
                subject: 'name',
                operator: Operators.EQUALS,
                value: 'Serena'
            });
            var p2 = new Predicate({
                subject: 'age',
                operator: Operators.LESS_THAN,
                value: 5
            });
            var result = Predicate.concat(Operators.AND, p, p2);
            expect(result.subject).toBe(p);
            expect(result.value).toBe(p2);
            expect(result.operator).toBe(Operators.AND);
        });

        it('Concatenate more than two predicates with OR', () => {
            var p = new Predicate({
                subject: 'name',
                operator: Operators.EQUALS,
                value: 'Serena'
            });
            var p2 = new Predicate({
                subject: 'age',
                operator: Operators.LESS_THAN,
                value: 5
            });
            var p3 = new Predicate({
                subject: 'happiness',
                operator: Operators.EQUAL,
                value: 'high'
            });
            var result = Predicate.concat(Operators.OR, p, p2,p3);
            expect(result.subject).toBe(p);
            expect(result.value).not.toBe(null);
            expect(result.operator).toBe(Operators.OR);
            var r = result.value;
            expect(r instanceof Predicate).toBe(true);
            expect(r.subject).toBe(p2);
            expect(r.operator).toBe(Operators.OR);
            expect(r.value).toBe(p3);
        });

        it('Concatenate with an array of values', () => {
            var arr = [];
            for( var i = 0; i < 3; i++ ) {
                arr.push( new Predicate({
                    subject: 'name',
                    operator: Operators.EQUALS,
                    value: 'text-' + i
                }));
            }
            var result = Predicate.concat(Operators.OR, arr);
            expect(result.subject).toBe(arr[0]);
            expect(result.value).not.toBe(null);
            expect(result.operator).toBe(Operators.OR);
            var r = result.value;
            expect(r instanceof Predicate).toBe(true);
            expect(r.subject).toBe(arr[1]);
            expect(r.operator).toBe(Operators.OR);
            expect(r.value).toBe(arr[2]);
        });

    });

    describe('Predicate flatten tests', () => {

        it('Flatten single statement', () => {
            var s = new Predicate({
                subject: "name",
                value: "'Bob'"
            });
            var obj = s.flatten();
            expect(obj.length).toEqual(1);
            expect(obj[0].subject).toEqual("name");
            expect(obj[0].operator).toEqual("eq");
            expect(obj[0].value).toEqual("'Bob'");
        });

        it('Flatten single statement into existing array', () => {
            var s = new Predicate({
                subject: "name",
                value: "'Bob'"
            });
            var r = [];
            s.flatten(r);
            expect(r.length).toEqual(1);
            expect(r[0].subject).toEqual("name");
            expect(r[0].operator).toEqual("eq");
            expect(r[0].value).toEqual("'Bob'");
        });

        it('Flatten two and statements', () => {
            var s = new Predicate({
                subject: new Predicate({
                    subject: "name",
                    operator: "eq",
                    value: "'Bob'"
                }),
                operator: "and",
                value: new Predicate({
                    subject: "lastname",
                    operator: "eq",
                    value: "'someone'"
                })
            });

            var obj = s.flatten();
            expect(obj.length).toEqual(2);
            var subject = obj[0];
            expect(subject.subject).toEqual("name");
            expect(subject.operator).toEqual("eq");
            expect(subject.value).toEqual("'Bob'");
            var value = obj[1];
            expect(value.subject).toEqual("lastname");
            expect(value.operator).toEqual("eq");
            expect(value.value).toEqual("'someone'");
        });
    });
});