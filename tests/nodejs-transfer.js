/*global describe, it */
"use strict";

var expect = require('chai').expect,
    should = require('chai').should();

var IO = require("../io"),
    IO_TRANSFER = require("../io/io-transfer.js"),
    URL = 'http://localhost:8000/io',
    TYPEOF = require("utils").typeof,
    REG_APP_JSON = /^application\/json/;

IO_TRANSFER.mergeInto(IO);

describe('io-transfer methods', function () {

    describe('data', function () {
        it('get', function () {
            return IO.get(URL+'/action/responsetxt').should.become('Acknowledge responsetext ok');
        });

        it('read', function () {
            return expect(IO.read(URL+'/extractdata', {id: 1})).to.eventually.have.property('id');
        });

        it('insert', function () {
            return expect(IO.insert(URL+'/extractdata', {id: 1})).to.eventually.have.property('id');
        });

        it('update', function () {
            return expect(IO.update(URL+'/extractdata', {id: 1})).to.eventually.have.property('id');
        });

        it('delete', function () {
            return expect(IO.delete(URL+'/extractdata', {id: 1})).to.eventually.have.property('id');
        });

        it('send', function () {
            return IO.send(URL+'/extractdata', {id: 1}).should.become('{"id":1}');
        });
    });

    describe('right method', function () {
        it('read --> GET', function () {
            return expect(IO.read(URL+'/extractdata/method', {id: 1})).to.eventually.have.property('GET');
        });
        it('insert --> not all fields --> POST', function () {
            return expect(IO.insert(URL+'/extractdata/method', {id: 1})).to.eventually.have.property('POST');
        });

        it('insert --> all fields --> PUT', function () {
            return expect(IO.insert(URL+'/extractdata/method', {id: 1}, {allfields: true})).to.eventually.have.property('PUT');
        });

        it('update --> not all fields --> POST', function () {
            return expect(IO.update(URL+'/extractdata/method', {id: 1}, {allfields: false})).to.eventually.have.property('POST');
        });

        it('update --> all fields --> PUT', function () {
            return expect(IO.update(URL+'/extractdata/method', {id: 1})).to.eventually.have.property('PUT');
        });

        it('delete --> DELETE', function () {
            return expect(IO.delete(URL+'/extractdata/method', {id: 1})).to.eventually.have.property('DELETE');
        });

        it('send --> not all fields --> POST', function () {
            return IO.send(URL+'/extractdata/method', {id: 1}, {allfields: false}).should.become('{"POST":true}');
        });

        it('send --> all fields --> PUT', function () {
            return IO.send(URL+'/extractdata/method', {id: 1}).should.become('{"PUT":true}');
        });

    });

    describe('right headers', function () {
        it('action insert', function (done) {
            IO.insert(URL+'/extractdata/headers', {id: 1}).then(
                function(response) {
                    response['x-action'].should.be.eql('insert');
                    done();
                }
            )
            .then(
                undefined,
                done
            );
        });

        it('action update', function (done) {
            IO.update(URL+'/extractdata/headers', {id: 1}).then(
                function(response) {
                    response['x-action'].should.be.eql('update');
                    done();
                }
            )
            .then(
                undefined,
                done
            );
        });

        it('read accept', function (done) {
            IO.read(URL+'/extractdata/headers', {id: 1}).then(
                function(response) {
                    response.accept.should.be.eql('application/json');
                    done();
                }
            )
            .then(
                undefined,
                done
            );
        });

        it('send accept', function (done) {
            IO.send(URL+'/extractdata/headers', {id: 1}).then(
                function(response) {
                    var r = JSON.parse(response);
                    (r.accept===undefined).should.be.true;
                    done();
                }
            )
            .then(
                undefined,
                done
            );
        });

        it('insert accept', function (done) {
            IO.insert(URL+'/extractdata/headers', {id: 1}).then(
                function(response) {
                    response.accept.should.be.eql('application/json');
                    done();
                }
            )
            .then(
                undefined,
                done
            );
        });

        it('update accept', function (done) {
            IO.update(URL+'/extractdata/headers', {id: 1}).then(
                function(response) {
                    response.accept.should.be.eql('application/json');
                    done();
                }
            )
            .then(
                undefined,
                done
            );
        });

        it('delete accept', function (done) {
            IO.delete(URL+'/extractdata/headers', {id: 1}).then(
                function(response) {
                    (response.accept===undefined).should.be.true;
                    done();
                }
            )
            .then(
                undefined,
                done
            );
        });

        it('read content-type', function (done) {
            IO.read(URL+'/extractdata/headers', {id: 1}).then(
                function(response) {
                    (response['content-type']===undefined).should.be.true;
                    done();
                }
            )
            .then(
                undefined,
                done
            );
        });

        it('send content-type', function (done) {
            IO.send(URL+'/extractdata/headers', {id: 1}).then(
                function(response) {
                    var r = JSON.parse(response);
                    REG_APP_JSON.test(r['content-type']).should.be.true;
                    done();
                }
            )
            .then(
                undefined,
                done
            );
        });

        it('insert content-type', function (done) {
            IO.insert(URL+'/extractdata/headers', {id: 1}).then(
                function(response) {
                    REG_APP_JSON.test(response['content-type']).should.be.true;
                    done();
                }
            )
            .then(
                undefined,
                done
            );
        });

        it('update content-type', function (done) {
            IO.update(URL+'/extractdata/headers', {id: 1}).then(
                function(response) {
                    REG_APP_JSON.test(response['content-type']).should.be.true;
                    done();
                }
            )
            .then(
                undefined,
                done
            );
        });

        it('delete content-type', function (done) {
            IO.delete(URL+'/extractdata/headers', {id: 1}).then(
                function(response) {
                    (response['content-type']===undefined).should.be.true;
                    done();
                }
            )
            .then(
                undefined,
                done
            );
        });
    });

    describe('JSON processing', function () {
        it('insert retrieve Date', function (done) {
            var data = {
                personal: {
                    birthday: new Date()
                }
            };
            IO.insert(URL+'/extractdata', data, {parseJSONDate: true}).then(
                function(data) {
                    TYPEOF.typeOf(data.personal.birthday).should.be.eql('date');
                    done();
                }
            ).then(
                undefined,
                done
            );
        });

        it('Date as String without header', function (done) {
            var data = {
                personal: {
                    birthday: new Date()
                }
            };
            IO.insert(URL+'/extractdata/headers', data).then(
                function(response) {
                    (response['x-jsondate']===undefined).should.be.eql(true);
                    done();
                }
            ).then(
                undefined,
                done
            );
        });

        it('Date as Date with header', function (done) {
            var data = {
                personal: {
                    birthday: new Date()
                }
            };
            IO.insert(URL+'/extractdata/headers', data, {parseJSONDate: true}).then(
                function(response) {
                    response['x-jsondate'].should.be.eql('true');
                    done();
                }
            ).then(
                undefined,
                done
            );
        });
    });

    describe('data aborted', function () {
        it('get', function () {
            var io = IO.get(URL+'/action/responsedelayed');
            io.should.be.rejected;
            setTimeout(function() {
                io.abort();
            }, 50);
        });

        it('read', function () {
            var io = IO.read(URL+'/extractdata', {id: 1}, {headers: {'X-Delay': 500}});
            io.should.be.rejected;
            setTimeout(function() {
                io.abort();
            }, 50);
        });

        it('insert', function () {
            var io = IO.insert(URL+'/extractdata', {id: 1}, {headers: {'X-Delay': 500}});
            io.should.be.rejected;
            setTimeout(function() {
                io.abort();
            }, 50);
        });

        it('update', function () {
            var io = IO.update(URL+'/extractdata', {id: 1}, {headers: {'X-Delay': 500}});
            io.should.be.rejected;
            setTimeout(function() {
                io.abort();
            }, 50);
        });

        it('delete', function () {
            var io = IO.delete(URL+'/extractdata', {id: 1}, {headers: {'X-Delay': 500}});
            io.should.be.rejected;
            setTimeout(function() {
                io.abort();
            }, 50);
        });

        it('send', function () {
            var io = IO.send(URL+'/extractdata', {id: 1}, {headers: {'X-Delay': 500}});
            io.should.be.rejected;
            setTimeout(function() {
                io.abort();
            }, 50);
        });

    });

});