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
var Predicate = require("../src/odata-parser").Predicate;
var Operators = require("../src/odata-parser").Operators;

describe('Predicate Tests', function (done) {

    describe('Predicate tests', function() {
        it('Empty constructor', function() {
            var p = new Predicate();
            expect(p.operator).to.be(Operators.EQUALS);
            expect(p.subject).to.be(undefined);
            expect(p.value).to.be(undefined);
        });
    });

    describe('Predicate serialization tests', function () {

        it('Serialize a simple object', function () {
            var p = new Predicate({
                subject: 'name',
                operator: Operators.EQUALS,
                value: 'Serena'
            });
            expect(p.serialize()).to.be.eql("(name eq 'Serena')");
        });

        it('Serialize a simple logical set of objects', function () {
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
            expect(p.serialize()).to.be.eql("((name eq 'Serena') and (lastname ne 'Martinez'))");
        });

        it('Serialize boolean values', function() {
            var p = new Predicate({
                subject: 'happy',
                operator: Operators.EQUALS,
                value: true
            });
            expect(p.serialize()).to.be.eql("(happy eq true)");
        });

        it('Serialize numeric floating-point values', function() {
            var p = new Predicate({
                subject: 'pi',
                operator: Operators.GREATER_THAN,
                value: 3.14159
            });
            expect(p.serialize()).to.be.eql("(pi gt 3.14159)");
        });

        it('Serialize numeric integer values', function() {
            var p = new Predicate({
                subject: 'age',
                operator: Operators.NOT_EQUAL,
                value: 30
            });
            expect(p.serialize()).to.be.eql("(age ne 30)");
        });

        it('Serialize current date to ISO String', function() {
            var d = new Date();
            var p = new Predicate({
                subject: 'created',
                operator: Operators.GREATER_THAN,
                value: d
            });
            expect(p.serialize()).to.be.eql("(created gt datetimeoffset'" + d.toISOString() + "')");
        });

        it('Serialize object value fails', function() {
            var p = new Predicate({
                subject: 'created',
                operator: Operators.EQUALS,
                value: { a: "nice" }
            });
            try {
                expect(p.serialize());
                fail("Should have failed to serialize an object value");
            } catch( err ) {
                expect(err).to.not.be(null);
                expect(err.key).to.be.eql('UNKNOWN_TYPE');
            }
        });

        it('Serialize null value fails', function() {
            var p = new Predicate({
                subject: 'created',
                operator: Operators.EQUALS,
                value: null
            });
            try {
                expect(p.serialize());
                fail("Should have failed to serialize a null value");
            } catch( err ) {
                expect(err).to.not.be(null);
                expect(err.key).to.be.eql('INVALID_VALUE');
            }
        });

        it('Serialize null subject fails', function() {
            var p = new Predicate({
                subject: null,
                operator: Operators.EQUALS,
                value: 'foo'
            });
            try {
                expect(p.serialize());
                fail("Should have failed to serialize a null subject");
            } catch( err ) {
                expect(err).to.not.be(null);
                expect(err.key).to.be.eql('INVALID_SUBJECT');
            }
        });

        it('Serialize logical expression where one side is a not at least a predicate fails', function() {
            var p = new Predicate({
                subject: 'name',
                operator: Operators.AND,
                value: 'foo'
            });
            try {
                expect(p.serialize());
                fail("Should have failed to serialize a non-predicate value");
            } catch( err ) {
                expect(err).to.not.be(null);
                expect(err.key).to.be.eql('INVALID_LOGICAL');
            }
        });
    });

    describe('Predicate concat tests', function() {

        it('Invalid case of a single predicate', function() {
            var p = new Predicate({
                subject: 'name',
                operator: Operators.EQUALS,
                value: 'Serena'
            });
            try {
                var result = Predicate.concat(Operators.AND, p);
                fail("expected error");
            } catch( err ) {
                expect(err).to.not.be(null);
                expect(err.key).to.be.eql('INSUFFICIENT_PREDICATES');
            }
        });

        it('Invalid case with non-logical operator', function() {
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
                expect(err).to.not.be(null);
                expect(err.key).to.be.eql('INVALID_LOGICAL');
            }
        });

        it('Concatenate two simple predicates with AND', function() {
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
            expect(result.subject).to.be(p);
            expect(result.value).to.be(p2);
            expect(result.operator).to.be(Operators.AND);
        });

        it('Concatenate more than two predicates with OR', function() {
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
            expect(result.subject).to.be(p);
            expect(result.value).to.not.be(null);
            expect(result.operator).to.be(Operators.OR);
            var r = result.value;
            expect(r instanceof Predicate).to.be(true);
            expect(r.subject).to.be(p2);
            expect(r.operator).to.be(Operators.OR);
            expect(r.value).to.be(p3);
        });

    });

    describe('Predicate flatten tests', function() {

        it('Flatten single statement', function () {
            var s = new Predicate({
                subject: "name",
                value: "'Bob'"
            });
            var obj = s.flatten();
            expect(obj.length).to.be.eql(1);
            expect(obj[0].subject).to.be.eql("name");
            expect(obj[0].operator).to.be.eql("eq");
            expect(obj[0].value).to.be.eql("'Bob'");
        });

        it('Flatten single statement into existing array', function () {
            var s = new Predicate({
                subject: "name",
                value: "'Bob'"
            });
            var r = [];
            s.flatten(r);
            expect(r.length).to.be.eql(1);
            expect(r[0].subject).to.be.eql("name");
            expect(r[0].operator).to.be.eql("eq");
            expect(r[0].value).to.be.eql("'Bob'");
        });

        it('Flatten two and statements', function () {
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
            expect(obj.length).to.be.eql(2);
            var subject = obj[0];
            expect(subject.subject).to.be.eql("name");
            expect(subject.operator).to.be.eql("eq");
            expect(subject.value).to.be.eql("'Bob'");
            var value = obj[1];
            expect(value.subject).to.be.eql("lastname");
            expect(value.operator).to.be.eql("eq");
            expect(value.value).to.be.eql("'someone'");
        });
    });
});