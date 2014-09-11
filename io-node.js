/**
 *
 * Provides core IO-functionality for NodeJS in the same way as 'io-win.js' does on the browser.
 * This way, all IO-methods can be used inside nodejs as well.
 *
 * @module io
 * @submodule io-node
 * @class IO
*/

/* global module:false */

"use strict";

require('ypromise');

var NAME = '[io-node]: ',
    http = require('http'),
    xmlDOMParser = require('xmldom').DOMParser,
    querystring = require('querystring'),
    DEF_REQ_TIMEOUT = 300000, // don't create an ever-lasting request: always quit after 5 minutes
    MIME_JSON = 'application/json',
    BODY_METHODS = {
        POST: 1,
        PUT: 1
    },
    CONTENT_TYPE = 'Content-Type',
    DEF_CONTENT_TYPE_POST = 'application/x-www-form-urlencoded; charset=UTF-8',
    REQUEST_TIMEOUT = 'Request-timeout',
    ABORTED = 'Request aborted',
    REGEXP_EXTRACT_URL = new RegExp("^((([a-z][a-z0-9-.]*):\/\/)?(([^\/?#:]+)(:(\\d+))?)?)?(\/?[a-z0-9-._~%!$&'()*+,;=@]+(\/[a-z0-9-._~%!$&'()*+,;=:@]+)*\/?|\/)?([#?](.*)|$)", "i"),

IO = {
    config: {},

    //===============================================================================================
    // private methods:
    //===============================================================================================
    /**
     * Sends a HTTP request to the server and returns a Promise with an additional .abort() method to cancel the request.
     *
     * The promise gets fulfilled if the server responses with `STATUS-CODE` in the 200-range.
     * It will be rejected if a timeout occurs (see `options.timeout`), or if `xhr.abort()` gets invoked.
     *
     * CORS is supported, as long as the responseserver is set up to:
     *      a) has a response header which allows the clientdomain:
     *         header('Access-Control-Allow-Origin: http://www.some-site.com'); or header('Access-Control-Allow-Origin: *');
     *      b) in cae you have set a custom HEADER (through 'options'), the responseserver MUST listen and respond
     *         to requests with the OPTION-method
     *      More info:  allows to send to your domain: see http://remysharp.com/2011/04/21/getting-cors-working/
     *
     * @method _xhr
     * @param options {Object}
     *    @param [options.url] {String} The url to which the request is sent.
     *    @param [options.method='GET'] {String} The HTTP method to use.
     *    can be ignored, even if streams are used --> the returned Promise will always hold all data
 *    @param [options.data] {Object} Data to be sent to the server, either to be used by `query-params` or `body`.
     *    @param [options.headers] {Object} HTTP request headers.
     *    @param [options.timeout=3000] {number} to timeout the request, leading into a rejected Promise.
     * @return {Promise} Promise holding the request. Has an additional .abort() method to cancel the request.
     * <ul>
     *     <li>on success: xhr {XMLHttpRequest1|XMLHttpRequest2} xhr-response</li>
     *     <li>on failure: reason {Error}</li>
     * </ul>
     * @private
    */
    _xhr: function(options) {
        console.log(NAME, '_xhrNodeJS');
        var instance = this,
            rejectHandle, promise, request, timer;

        options || (options={});
        promise = new Promise(function(fulfill, reject) {
            var extractUrl = options.url.match(REGEXP_EXTRACT_URL),
                protocol = (extractUrl[3] || '').toLowerCase(),
                host = extractUrl[5],
                port = extractUrl[7] || ((protocol==='https') ? 443 : 80),
                path = extractUrl[8],
                getparams = extractUrl[11],
                data = options.data,
                headers = options.headers,
                method = options.method,
                xmlRequest = headers && (headers.Accept==='text/xml'),
                isBodyMethod = BODY_METHODS[method],
                requestCallback, httpOptions;

            rejectHandle = reject;
            // if 'host' could not be extracted from the url: reject the promise
            host || reject('invalid url');

            if (isBodyMethod) {
                // in case of POST or PUT method: always make sure 'Content-Type' is specified
                headers || (headers={});
                (CONTENT_TYPE in headers) || (headers[CONTENT_TYPE]=DEF_CONTENT_TYPE_POST);
                if (data) {
                    data = (headers[CONTENT_TYPE]===MIME_JSON) ? JSON.stringify(data) : querystring.stringify(data);
                    headers['Content-Length'] = Buffer.byteLength(data);
                }
            }
            else {
                headers && (delete headers[CONTENT_TYPE]);
                if (getparams || data) {
                    path += '?'+(getparams || '')+((getparams && data) ? '&' : '') + (data ? querystring.stringify(data) : '');
                }
            }
            httpOptions = {
                hostname: host,
                port: port,
                path: path,
                method: method,
                headers: headers
//                auth: Currently not setup in this module
            };
            requestCallback = function(response) {
                var str = '';
                response.setEncoding('utf8');

                response.on('data', function (chunk) {
console.log('received data: '+chunk);
                    str += chunk;
                });

                response.on('end', function () {
console.log('END received data: '+response.statusCode);
                    var statusCode = response.statusCode,
                        responseobject;
                    if ((statusCode>=200) && (statusCode<300)) {
                        // to remain consisten with XHR, we define an object with the same structure
                        responseobject = {
                            responseText: str,
                            responseXML: xmlRequest ? new xmlDOMParser().parseFromString(str) : null,
                            readyState: 4,
                            status: response.statusCode,
                            getAllResponseHeaders: function () {
                                 var headers = response.headers,
                                     headersStringified = '';
                                 for(var key in headers) {
                                    if (headers.hasOwnProperty(key)) {
                                        headersStringified += '\r\n' + key + ': ' + headers[key];
                                    }
                                 }
                                 (headersStringified.length>0) && (headersStringified=headersStringified.substr(2));
                                 return headersStringified;
                            },
                            getResponseHeader: function (name) {
                                return response.headers[name];
                            }
                        };
                        clearTimeout(timer);
                        fulfill(responseobject);
                    }
                    else {
                        clearTimeout(timer);
                        reject('errorcode: '+statusCode);
                    }
                });
            };

            request = http.request(httpOptions, requestCallback);

            request.on('error', function(e) {
                clearTimeout(timer);
                reject(e.message);
            });
            timer = setTimeout(function() {
                reject(REQUEST_TIMEOUT);
                request.abort();
            }, options.timeout || instance.config.reqTimeout || DEF_REQ_TIMEOUT);

            isBodyMethod && data && request.write(data);
            request.end();
        });
        // now we need to add an `abort`-method:
        promise.abort = function() {
            clearTimeout(timer);
            rejectHandle(ABORTED);
            request.abort();
        };
        return promise;
    }
};

module.exports = IO;