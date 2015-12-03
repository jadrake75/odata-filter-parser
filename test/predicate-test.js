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
    });

    describe('Predicate concat tests', function() {
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