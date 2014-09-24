/* global describe, it */

(function (window) {

    "use strict";

    var chai = require('chai'),
        expect = chai.expect,
    	should = chai.should();

    chai.use(require('chai-as-promised'));

    var IO = require("../io")(window),
        URL = 'http://servercors.itsa.io/io',
        ieTest = window.navigator.userAgent.match(/MSIE (\d+)\./),
        ie = ieTest && ieTest[1],
        xdr = ie && (ie<10);

    // we might need cors to make the tests pass in travis
    xdr && require("../io-cors-ie9.js")(window).mergeInto(IO);

    describe('Response-object', function () {

        it('responseText', function (done) {
            var options = {
                url: URL+'/action/responsetxt',
                method: 'GET'
            };
            IO.request(options).then(
                function(response) {
                    response.responseText.should.be.eql('Acknowledge responsetext ok');
                    (response.readyState===4).should.be.true; // response.readyState.should.be.eql(4) --> goes wrong in IE<10 ??
                    (response.status===200).should.be.true; // response.status.should.be.eql(200) --> goes wrong in IE<10 ??
                    expect(response.getAllResponseHeaders()).be.a.String;
                    ((response.getAllResponseHeaders().indexOf('Content-Type:')!==-1) || (response.getAllResponseHeaders().indexOf('content-type:')!==-1)).should.be.true;
                    response.getResponseHeader('Content-Type').should.be.eql(xdr ? 'text/plain' : 'text/plain; charset=utf-8');
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
            IO.request(options).then(
                function(response) {
                    response.responseXML.getElementsByTagName('response')[0].firstChild.nodeValue.should.be.eql('10');
                    (response.readyState===4).should.be.true; // response.readyState.should.be.eql(4) --> goes wrong in IE<10 ??
                    (response.status===200).should.be.true; // response.status.should.be.eql(200) --> goes wrong in IE<10 ??
                    expect(response.getAllResponseHeaders()).be.a.String;
                    ((response.getAllResponseHeaders().indexOf('Content-Type:')!==-1) || (response.getAllResponseHeaders().indexOf('content-type:')!==-1)).should.be.true;
                    response.getResponseHeader('Content-Type').should.be.eql(xdr ? 'text/xml' : 'text/xml; charset=utf-8');
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
                IO.request(options).then(
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
                IO.request(options).then(
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
                IO.request(options).then(
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
                IO.request(options).then(
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
                IO.request(options).then(
                    function(response) {
                        response.responseText.should.be.eql('Acknowledge '+(xdr ? 'get' : 'delete')+'-request with data: 25');
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
                IO.request(options).then(
                    function(response) {
                        response.responseText.should.be.eql('Acknowledge '+(xdr ? 'get' : 'delete')+'-request with data: 25');
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
                IO.request(options).then(
                    function(response) {
                        response.responseText.should.be.eql('Acknowledge '+(xdr ? 'get' : 'delete')+'-request with data: 25');
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
                IO.request(options).then(
                    function(response) {
                        response.responseText.should.be.eql('Acknowledge '+(xdr ? 'get' : 'delete')+'-request with data: 25');
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
                IO.request(options).then(
                    function(response) {
                        response.responseText.should.be.eql('Acknowledge '+(xdr ? 'post' : 'put')+'-request with data: undefined');
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
                IO.request(options).then(
                    function(response) {
                        response.responseText.should.be.eql('Acknowledge '+(xdr ? 'post' : 'put')+'-request with data: 25');
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
                IO.request(options).then(
                    function(response) {
                        response.responseText.should.be.eql('Acknowledge '+(xdr ? 'post' : 'put')+'-request with data: undefined');
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
                IO.request(options).then(
                    function(response) {
                        response.responseText.should.be.eql('Acknowledge '+(xdr ? 'post' : 'put')+'-request with data: 25');
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
                IO.request(options).then(
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
                IO.request(options).then(
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
                IO.request(options).then(
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
                IO.request(options).then(
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

            it('aborting', function (done) {
                var options = {
                    url: URL+'/action/responsedelayed',
                    method: 'GET'
                };
                var io = IO.request(options);
                io.then(
                    function() {
                        done(new Error('io should not be fulfilled'));
                    },
                    function() {
                        done();
                    }
                );
                setTimeout(function() {
                    io.abort();
                }, 50);
            });

            it('aborting by timeout', function (done) {
                var options = {
                    url: URL+'/action/responsedelayed',
                    method: 'GET',
                    timeout: 100
                };
                var io = IO.request(options);
                io.then(
                    function() {
                        done(new Error('io should not be fulfilled'));
                    },
                    function() {
                        done();
                    }
                );
            });

        });

    });

}(global.window || require('fake-dom')));
