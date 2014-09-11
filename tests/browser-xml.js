/*global describe, it */
"use strict";

var expect = require('chai').expect,
    should = require('chai').should();

var IO = require("../io"),
    IO_XML = require("../io/io-xml.js"),
    URL = '/io';

IO_XML.mergeInto(IO);

describe('io.readXML()', function () {

    it('xml response', function (done) {
        IO.readXML(URL+'/action/responsexml').then(
            function(responseXML) {
                responseXML.getElementsByTagName('response')[0].firstChild.nodeValue.should.be.eql('10');
                done();
            },
            done
        );
    });

    it('non text/xml response', function (done) {
        IO.readXML(URL+'/action/responsetxt').then(
            function() {
                done(new Error('readXML should not resolve when responsetype is not text/xml'));
            },
            function(error) {
                error.message.should.be.eql('recieved Content-Type is no XML');
                done();
            }
        );
    });

    it('aborted', function () {
        var io = IO.readXML(URL+'/action/responsedelayed');
        io.should.be.rejected;
        setTimeout(function() {
            io.abort();
        }, 50);
    });

});
