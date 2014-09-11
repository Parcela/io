/*global describe, it */
"use strict";

var expect = require('chai').expect,
    should = require('chai').should();

var IO = require("../io"),
    IO_STREAM = require("../io/io-stream.js"),
    URL = '/io';

IO_STREAM.mergeInto(IO);

describe('io-stream', function () {

    it('get', function (done) {
        var options, cb, pck = 0;
        cb = function(data) {
            pck++;
            data.should.be.eql('package '+pck);
        };
        options = {
            url: URL+'/action/stream',
            method: 'GET',
            streamback: cb
        };
        IO._xhr(options).then(
            function(xhr) {
                pck.should.be.eql(10);
                xhr.responseText.should.be.eql('package 1package 2package 3package 4package 5package 6package 7package 8package 9package 10');
                done();
            }
        )
        .then(
            undefined,
            done
        );

    });

});
