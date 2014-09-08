/*global describe, it */
"use strict";
var expect = require('chai').expect,
	should = require('chai').should();
var IO = require("../io-node.js"),
    URL = 'http://localhost:8000/io';


describe('Response-object', function () {

    it('responseText', function (done) {
        var options = {
            url: URL+'/action/responsetxt',
            method: 'GET'
        };
        IO._xhr(options).then(
            function(response) {
                response.responseText.should.be.eql('Acknowledge responsetext ok');
                response.readyState.should.be.eql(4);
                response.status.should.be.eql(200);
                expect(response.getAllResponseHeaders()).be.a.String;
                (response.getAllResponseHeaders().indexOf('content-type:')!==-1).should.be.true;
                response.getResponseHeader('content-type').should.be.eql('text/plain; charset=utf-8');
                done();
            }
        ).then(
            undefined,
            done
        );
    });

    it('responseXML', function (done) {
        var options = {
            url: URL+'/action/responsexml',
            headers: {'Content-Type': 'application/xml; charset=utf-8', 'Accept': 'text/xml'},
            method: 'GET',
            responseType: 'text/xml'
        }
        IO._xhr(options).then(
            function(response) {
                response.responseXML.getElementsByTagName('response')[0].firstChild.nodeValue.should.be.eql('10');
                response.readyState.should.be.eql(4);
                response.status.should.be.eql(200);
                expect(response.getAllResponseHeaders()).be.a.String;
                (response.getAllResponseHeaders().indexOf('content-type:')!==-1).should.be.true;
                response.getResponseHeader('content-type').should.be.eql('text/xml; charset=utf-8');
                done();
            }
        ).then(
            undefined,
            done
        );
    });

});


describe('Analysing params', function () {

    describe('GET-params', function () {

        it('through querystring', function (done) {
            var options = {
                url: URL+'?data=25&dummy1=5',
                method: 'GET'
            }
            IO._xhr(options).then(
                function(response) {
                    response.responseText.should.be.eql('Acknowledge get-request with data: 25');
                    done();
                }
            ).then(
                undefined,
                done
            );
        });

        it('through dataobject', function (done) {
            var options = {
                url: URL,
                method: 'GET',
                data: {data: 25}
            }
            IO._xhr(options).then(
                function(response) {
                    response.responseText.should.be.eql('Acknowledge get-request with data: 25');
                    done();
                }
            ).then(
                undefined,
                done
            );
        });

        it('combined 1', function (done) {
            var options = {
                url: URL+'?data=25&dummy1=5',
                method: 'GET',
                data: {dummy2: 10}
            }
            IO._xhr(options).then(
                function(response) {
                    response.responseText.should.be.eql('Acknowledge get-request with data: 25');
                    done();
                }
            ).then(
                undefined,
                done
            );
        });

        it('combined 2', function (done) {
            var options = {
                url: URL+'?dummy1=5&dummy2=10',
                method: 'GET',
                data: {data: 25}
            }
            IO._xhr(options).then(
                function(response) {
                    response.responseText.should.be.eql('Acknowledge get-request with data: 25');
                    done();
                }
            ).then(
                undefined,
                done
            );
        });

    });

    describe('DELETE-params', function () {

        it('through querystring', function (done) {
            var options = {
                url: URL+'?data=25&dummy=5',
                method: 'DELETE'
            }
            IO._xhr(options).then(
                function(response) {
                    response.responseText.should.be.eql('Acknowledge delete-request with data: 25');
                    done();
                }
            ).then(
                undefined,
                done
            );
        });

        it('through dataobject', function (done) {
            var options = {
                url: URL,
                method: 'DELETE',
                data: {data: 25}
            }
            IO._xhr(options).then(
                function(response) {
                    response.responseText.should.be.eql('Acknowledge delete-request with data: 25');
                    done();
                }
            ).then(
                undefined,
                done
            );
        });

        it('combined 1', function (done) {
            var options = {
                url: URL+'?data=25&dummy=5',
                method: 'DELETE',
                data: {dummy2: 10}
            }
            IO._xhr(options).then(
                function(response) {
                    response.responseText.should.be.eql('Acknowledge delete-request with data: 25');
                    done();
                }
            ).then(
                undefined,
                done
            );
        });

        it('combined 2', function (done) {
            var options = {
                url: URL+'?dummy1=5&dummy2=10',
                method: 'DELETE',
                data: {data: 25}
            }
            IO._xhr(options).then(
                function(response) {
                    response.responseText.should.be.eql('Acknowledge delete-request with data: 25');
                    done();
                }
            ).then(
                undefined,
                done
            );
        });

    });

    describe('PUT-params', function () {

        it('through querystring', function (done) {
            var options = {
                url: URL+'?data=25&dummy1=5',
                method: 'PUT'
            }
            IO._xhr(options).then(
                function(response) {
                    response.responseText.should.be.eql('Acknowledge put-request with data: undefined');
                    done();
                }
            ).then(
                undefined,
                done
            );
        });

        it('through dataobject', function (done) {
            var options = {
                url: URL,
                method: 'PUT',
                data: {data: 25}
            }
            IO._xhr(options).then(
                function(response) {
                    response.responseText.should.be.eql('Acknowledge put-request with data: 25');
                    done();
                }
            ).then(
                undefined,
                done
            );
        });

        it('combined 1', function (done) {
            var options = {
                url: URL+'?data=25&dummy1=5',
                method: 'PUT',
                data: {dummy2: 10}
            }
            IO._xhr(options).then(
                function(response) {
                    response.responseText.should.be.eql('Acknowledge put-request with data: undefined');
                    done();
                }
            ).then(
                undefined,
                done
            );
        });

        it('combined 2', function (done) {
            var options = {
                url: URL+'?dummy1=5&dummy2=10',
                method: 'PUT',
                data: {data: 25}
            }
            IO._xhr(options).then(
                function(response) {
                    response.responseText.should.be.eql('Acknowledge put-request with data: 25');
                    done();
                }
            ).then(
                undefined,
                done
            );
        });

    });

    describe('POST-params', function () {

        it('through querystring', function (done) {
            var options = {
                url: URL+'?data=25&dummy1=5',
                method: 'POST'
            }
            IO._xhr(options).then(
                function(response) {
                    response.responseText.should.be.eql('Acknowledge post-request with data: undefined');
                    done();
                }
            ).then(
                undefined,
                done
            );
        });

        it('through dataobject', function (done) {
            var options = {
                url: URL,
                method: 'POST',
                data: {data: 25}
            }
            IO._xhr(options).then(
                function(response) {
                    response.responseText.should.be.eql('Acknowledge post-request with data: 25');
                    done();
                }
            ).then(
                undefined,
                done
            );
        });

        it('combined 1', function (done) {
            var options = {
                url: URL+'?data=25&dummy1=5',
                method: 'POST',
                data: {dummy2: 10}
            }
            IO._xhr(options).then(
                function(response) {
                    response.responseText.should.be.eql('Acknowledge post-request with data: undefined');
                    done();
                }
            ).then(
                undefined,
                done
            );
        });

        it('combined 2', function (done) {
            var options = {
                url: URL+'?dummy1=5&dummy2=10',
                method: 'POST',
                data: {data: 25}
            }
            IO._xhr(options).then(
                function(response) {
                    response.responseText.should.be.eql('Acknowledge post-request with data: 25');
                    done();
                }
            ).then(
                undefined,
                done
            );
        });
    });

    describe('Aborting requests', function () {

        it('aborting', function () {
            var options = {
                url: URL+'/action/responsedelayed',
                method: 'GET'
            };
            var io = IO._xhr(options);
            io.should.be.rejected;
            setTimeout(function() {
                io.abort();
            }, 50);
        });

        it('aborting 2', function (done) {
            var options = {
                url: URL+'/action/responsedelayed',
                method: 'GET'
            };
            var io = IO._xhr(options);
            io.then(
                undefined,
                function(err) {
                    done();
                }
            );
            setTimeout(function() {
                io.abort();
            }, 50);
        });

        it('aborting by timeout', function () {
            var options = {
                url: URL+'/action/responsedelayed',
                method: 'GET',
                timeout: 100
            };
            var io = IO._xhr(options);
            io.should.be.rejected;
        });

    });

});