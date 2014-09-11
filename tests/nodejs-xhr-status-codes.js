/*global describe, it */
"use strict";
var expect = require('chai').expect,
	should = require('chai').should();
var IO = require("../io"),
    URL = 'http://localhost:8000/io/status';

describe('Status codes', function () {

    it('response 200-series', function (done) {
        var options = {
                url: URL,
                method: 'GET',
                data: {res: 101}
            },
            a = [],
            res, createIO;
        createIO = function(res) {
            var requestRes = res;
            options.data.res = requestRes;
            return IO._xhr(options).then(
                function(response) {
                    var resString = requestRes.toString(),
                        responseText = response.responseText;
                    // 204 and 205 seem to be a responses without content
                    if (requestRes===204) {
                        responseText.should.be.eql('');
                    }
                    else if (requestRes===205) {
                        ((responseText==='') || (responseText===resString)).should.be.true;
                    }
                    else {
                        responseText.should.be.eql(((requestRes===204) || (requestRes===205)) ? '' : resString);
                    }
                }
            );
        }

        for (res=200; res<=206; res++) {
            a.push(createIO(res));
        }

        Promise.all(a).then(
            function() {
                done();
            },
            function(err) {
                done(err);
            }
        );
    });

    it('response 300-series', function (done) {
        var options = {
                url: URL,
                method: 'GET',
                data: {res: 101}
            },
            a = [],
            res, createIO;
        createIO = function(res) {
            var requestRes = res;
            options.data.res = requestRes;
            return IO._xhr(options).then(
                function(response) {
                    throw new Error('_xhr should not resolve');
                },
                function(error) {
                    return true;
                }
            );
        }

        for (res=300; res<=307; res++) {
            a.push(createIO(res));
        }

        Promise.all(a).then(
            function() {
                done();
            },
            function(err) {
                done(err);
            }
        );
    });

    it('response 400-series', function (done) {
        var options = {
                url: URL,
                method: 'GET',
                data: {res: 101}
            },
            a = [],
            res, createIO;
        createIO = function(res) {
            var requestRes = res;
            options.data.res = requestRes;
            return IO._xhr(options).then(
                function(response) {
                    throw new Error('_xhr should not resolve');
                },
                function(error) {
                    return true;
                }
            );
        }

        for (res=400; res<=417; res++) {
            a.push(createIO(res));
        }

        Promise.all(a).then(
            function() {
                done();
            },
            function(err) {
                done(err);
            }
        );
    });

    it('response 500-series', function (done) {
        var options = {
                url: URL,
                method: 'GET',
                data: {res: 101}
            },
            a = [],
            res, createIO;
        createIO = function(res) {
            var requestRes = res;
            options.data.res = requestRes;
            return IO._xhr(options).then(
                function(response) {
                    throw new Error('_xhr should not resolve');
                },
                function(error) {
                    return true;
                }
            );
        }

        for (res=500; res<=505; res++) {
            a.push(createIO(res));
        }

        Promise.all(a).then(
            function() {
                done();
            },
            function(err) {
                done(err);
            }
        );
    });

});