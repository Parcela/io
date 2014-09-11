/* globals XDomainRequest: true */

"use strict";

var NAME = '[io-stream]: ',
    UNKNOW_ERROR = 'Unknown XDR-error', // XDR doesn't specify the error
    REQUEST_TIMEOUT = 'Request-timeout',

    _entendXHR = function(xhr, props, options) {
        if (typeof options.streamback === 'function') {
            if (!props._isXHR2 && !props._isXDR) {
                if (typeof XDomainRequest !== 'undefined') {
                    xhr = new XDomainRequest();
                    props._isXDR = true;
                }
            }
            props._isStream = props._isXHR2 || props._isXDR;
        }

    // TODO: check how to deal with opera-mini

        return xhr;
    },

    _progressHandle = function(xhr, promise, headers, method) {
        if (xhr._isStream) {
            console.log(NAME, 'progressHandle');
            xhr._progressPos = 0;
            xhr.onprogress = function() {
                console.log(NAME, 'xhr.onprogress received data #'+xhr.response+'#');
                promise.callback(xhr.response.substr(xhr._progressPos));
                xhr._progressPos = xhr.response.length;
            };
        }
    },

    _readyHandleXDR = function(xhr, promise, headers, method) {
        if (xhr._isXDR) {
            console.log(NAME, 'readyHandleXDR');
            // for XDomainRequest, we need 'onload' instead of 'onreadystatechange'
            xhr.onload = function() {
                clearTimeout(xhr._timer);
                console.log(NAME, 'xhr.onload invokes with responseText='+xhr.responseText);
                promise.fulfill(xhr);
            };
            xhr.onerror = function() {
                clearTimeout(xhr._timer);
                promise.reject(UNKNOW_ERROR);
            };
        }
    },

    _setStreamHeader = function(xhr, promise, headers, method) {
        if (xhr._isStream && !xhr._isXDR) {
            console.log(NAME, '_setStreamHeader');
            xhr.setRequestHeader('X-Stream', 'true');
        }
    },

    IO_Stream = {
        mergeInto: function (io) {
            io._xhrList.push(_entendXHR);
            io._xhrInitList.push(_readyHandleXDR);
            io._xhrInitList.push(_progressHandle);
            io._xhrInitList.push(_setStreamHeader);
        }
    };

module.exports = IO_Stream;


/**
 * Initiates the `XMLHttpRequest()`-instance. Tries to use XMLHttpRequest2, which is supported by all modern browsers except IE<10
 * if XMLHttpRequest2 fails, it will try to use IE's XDomainRequest.
 *
 * The returned xhr DOES support CORS for all modern browsers.
 * To use CORS, you need to setup the responseserver right
 * More info about CORS: http://remysharp.com/2011/04/21/getting-cors-working/
 *
 * Using CORS with IE9-browsers need special consideration, for it uses the XDomainRequest():
 * 1. Only GET and POST methods are supported. Other methods will be reset into one of these,
 *    so make sure the cross-domain-server handles all requests as being send with the GET or POST method.
 * 2. Only text/plain is supported for the request's Content-Type header. This will lead into troubles when handling
 *    POST-requests: the cross-domain-server needs to extract the parameters itself. For nodejs, there is a nice npm module:
 *    `express-ie-cors` https://github.com/advanced/express-ie-cors/blob/master/lib/express-ie-cors.js
 * 3. No custom headers can be added to the request.
 * 4. No authentication or cookies will be sent with the request.
 * more info: http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
 *
 * @method _createXHR
 * @param url {String} in case XMLHttpRequest2 is not available, we must determine whether to create a crossdomain-request
 * @return {XMLHttpRequest2|XMLHttpRequest|XDomainRequest} xhr-instance
 * @private
*/

    // NOT_ARRAY_ITEMS = 'response is no array',





/*

/**
 * Sends a HTTP request to the server and returns a Promise with an additional .abort() method to cancel the request.
 * Uses `Promise.stream`, defined inside the `core-promiseext` module
 *
 * @method _xhrStream
 * @param streamback {Function} callbackfunction to process stream-information. Streamed data is available inside the argument if the callback.
 * @param options {Object}
 *    @param [options.url] {String} The url to which the request is sent.
 *    @param [options.method='GET'] {String} The HTTP method to use.
 *    can be ignored, even if streams are used --> the returned Promise will always hold all data
 *    @param [options.sync=false] {boolean} By default, all requests are sent asynchronously. To send synchronous requests, set to true.
 *    @param [options.params] {Object} Data to be sent to the server.
 *    @param [options.body] {Object} The content for the request body for POST method.
 *    @param [options.headers] {Object} HTTP request headers.
 *    @param [options.responseType='text'] {String} The response type.
 *    @param [options.timeout=3000] {number} to timeout the request, leading into a rejected Promise.
 *    @param [options.withCredentials=false] {boolean} Whether or not to send credentials on the request.
 * @return {Promise} Promise holding the request. Has an additional .abort() method to cancel the request.
 * on success:
    * data {Array} holding the streamed items: each response is a String-item in the array
 * on failure an Error object
    * reason {Error}
 * @private
*/

/*

IO._xhrStream = function(streamback, options) {
    console.log(NAME, '_xhrStream');
    var instance = this,
        xhr = instance._createXHR(options.url),
        promise;
    promise = Promise.stream(streamback);
    // xhr will be null in case of a CORS-request when no CORS is posible
    xhr ? instance._initXHR(xhr, options, promise.ready, promise.error, promise, true) : promise.reject(ERROR_NO_CORS);
    return promise;
};

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
 * @method xhr
 * @param [options] {Object}
 *    @param [options.url] {String} The url to which the request is sent.
 *    @param [options.method='GET'] {String} The HTTP method to use.
 *    @param [options.streamback] {Function} callbackfunction in case you want to process streams.
 *    can be ignored, even if streams are used --> the returned Promise will always hold all data
 *    @param [options.sync=false] {boolean} By default, all requests are sent asynchronously. To send synchronous requests, set to true.
 *    @param [options.params] {Object} Data to be sent to the server.
 *    @param [options.body] {Object} The content for the request body for POST method.
 *    @param [options.headers] {Object} HTTP request headers.
 *    @param [options.responseType='text'] {String} The response type.
 *    @param [options.timeout=3000] {Number} to timeout the request, leading into a rejected Promise.
 *    @param [options.withCredentials=false] {boolean} Whether or not to send credentials on the request.
 * @return {Promise} Promise holding the request. Has an additional .abort() method to cancel the request.
 * on success:
    * data {Array|Any} in case `streamback` is set, data will always be an array, otherwise its the plain serverresponse.
    * xhr {XMLHttpRequest|XDomainRequest} xhr-response, in case `streamback` is set, with an extra property:
          `xhr.data` {Array} an array where every single stream-resonse is an array-item
 * on failure an Error object
    * reason {Error}
*/

/*

IO.xhr = function(options) {
    console.log(NAME, 'xhr');
    var instance = this,
        streamback;
    options || (options={});
    // if `window` is undefined, we assume a NodeJS environment
    return (streamback=options.streamback) ? instance._xhrStream(streamback, options) : instance._xhr(options);
};

    /**
     * Sends a HTTP request to the server and returns a Promise with an additional .abort() method to cancel the request.
     * This method is the standard way of doing xhr-requests without processing streams.
     *
     * @method _xhr
     * @param options {Object}
     *    @param [options.url] {String} The url to which the request is sent.
     *    @param [options.method='GET'] {String} The HTTP method to use.
     *    can be ignored, even if streams are used --> the returned Promise will always hold all data
     *    @param [options.sync=false] {boolean} By default, all requests are sent asynchronously. To send synchronous requests, set to true.
     *    @param [options.params] {Object} Data to be sent to the server.
     *    @param [options.body] {Object} The content for the request body for POST method.
     *    @param [options.headers] {Object} HTTP request headers.
     *    @param [options.responseType='text'] {String} The response type.
     *    @param [options.timeout=3000] {number} to timeout the request, leading into a rejected Promise.
     *    @param [options.withCredentials=false] {boolean} Whether or not to send credentials on the request.
     * @return {Promise} Promise holding the request. Has an additional .abort() method to cancel the request.
     * on success:
        * xhr {XMLHttpRequest|XDomainRequest} xhr-response
     * on failure an Error object
        * reason {Error}
     * @private
    */

/*

    IO._xhr: function(options) {
        console.log(NAME, '_xhr');
        var instance = this,
            promise, fulfilledHandle, rejectHandle, xhr;
        options || (options={});
        promise = new Promise(function(fulfill, reject) {
            fulfilledHandle = fulfill;
            rejectHandle = reject;
        });
        xhr = instance._createXHR();
        xhr.timeout = options.timeout || (isStream && (instance.config.reqTimeout || DEF_REQ_TIMEOUT));
        instance._initXHR(xhr, options, fulfilledHandle, rejectHandle, promise);
        return promise;
    };
};


        // now define methods which listen for the xhr-events:
        xhr._isXDR ? instance._setReadyHandleXDR(xhr, fulfill, reject) : instance._setReadyHandle(xhr, fulfill, reject);
        isStream && instance._setProgressHandle(xhr, promise);


            /**
     * Adds the `xhr.onprogress()` method on the xhr-instance which is used by xhr when events occur.
     *
     * This events is responsible for sending partial data to the streamcallback
     *
     * @method _setProgressHandle
     * @param xhr {Object} containing the xhr-instance
     * @param promise {Promise} reference to the Promise created by _xhr
     * @private
    */

/*

    IO._setProgressHandle: function(xhr, promise) {
        console.log(NAME, '_setProgressHandle');
        xhr._progressPos = 0;
        xhr.onprogress = function() {
            console.log(NAME, 'xhr.onprogress received data');
            promise.add(this.response.substr(xhr._progressPos));
            xhr._progressPos = this.response.length;
        };
    };


/**
 * Performs an AJAX GET request.  Shortcut for a call to [`xhr`](#method_xhr) with `method` set to  `'GET'`.
 * Expects the server to response streamwise (though not necessary).
 *
 * Additional parameters can be on the url (with questionmark), through `params`, or both.
 *
 * You can use the `streamback` function to process intermediate serverresponses
 * The resolved Promise-callback returns an array where each item represents a serverresponse.
 *
 * The Promise gets fulfilled if the server responses with `STATUS-CODE` in the 200-range (excluded 204).
 * It will be rejected if a timeout occurs (see `options.timeout`), or if `xhr.abort()` gets invoked.
 *
 * @method getStream
 * @param url {String} URL of the resource server
 * @param [params] {Object} additional parameters.
 * @param streamback {Function} callbackfunction to process stream-information. Streamed data is available inside the argument if the callback.
 * @param [options] {Object}
 *    @param [options.url] {String} The url to which the request is sent.
 *    can be ignored, even if streams are used --> the returned Promise will always hold all data
 *    @param [options.sync=false] {boolean} By default, all requests are sent asynchronously. To send synchronous requests, set to true.
 *    @param [options.params] {Object} Data to be sent to the server.
 *    @param [options.body] {Object} The content for the request body for POST method.
 *    @param [options.headers] {Object} HTTP request headers.
 *    @param [options.responseType='text'] {String} The response type.
 *    @param [options.timeout=3000] {Number} to timeout the request, leading into a rejected Promise.
 *    @param [options.withCredentials=false] {boolean} Whether or not to send credentials on the request.
 * @return {Promise}
 * on success:
    * data {Array} holding the streamed items: each response is a String-item in the array
 * on failure an Error object
    * reason {Error}
*/

/*
IO_Class.prototype.getStream = function (url, params, streamback, options) {
    console.log(NAME, 'I.IO.getStream  --> '+url+' params: '+JSON.stringify(params));
    options || (options={});
    options.url = url;
    // method will be uppercased by IO.xhr
    options.params = params;
    options.streamback = streamback;
    return this.xhr(options);
};

/**
 * Performs an AJAX request with the GET HTTP method.
 * Expects the server to response a JSON-array or JSON-object.
 * Expects the server to response streamwise (though not necessary). A typical usage would be
 * to response with small array-subsets.
 *
 * `streamback` gets invoked with every streamed response, passing an array at its argument which holds
 * the items of this partial response.
 * The resolved Promise-callback returns an array which holds all the items.
 *
 * Additional request-parameters can be on the url (with questionmark), through `params`, or both.
 *
 * The Promise gets fulfilled if the server responses with `STATUS-CODE` in the 200-range (excluded 204).
 * It will be rejected if a timeout occurs (see `options.timeout`), or if `xhr.abort()` gets invoked.
 *
 * Note1: CORS is supported, as long as the responseserver is set up to:
 *       a) has a response header which allows the clientdomain:
 *          header('Access-Control-Allow-Origin: http://www.some-site.com'); or header('Access-Control-Allow-Origin: *');
 *       b) in cae you have set a custom HEADER (through 'options'), the responseserver MUST listen and respond
 *          to requests with the OPTION-method
 *       More info:  allows to send to your domain: see http://remysharp.com/2011/04/21/getting-cors-working/
 * Note2: If you expect the server to response with data that consist of Date-properties, you should set `options.parseJSONDate` true.
 *        Parsing takes a bit longer, but it will generate trully Date-objects.
 *
 * @method readStreamedArray
 * @param url {String} URL of the resource server
 * @param [params] {Object} additional parameters.
 * @param [streamback] {Function} function with 1 argument (items) which gets invoked on every partial response.
 * @param [options] {Object} See also: [`I.io`](#method_xhr)
 *    @param [options.url] {String} The url to which the request is sent.
 *    can be ignored, even if streams are used --> the returned Promise will always hold all data
 *    @param [options.sync=false] {boolean} By default, all requests are sent asynchronously. To send synchronous requests, set to true.
 *    @param [options.params] {Object} Data to be sent to the server.
 *    @param [options.body] {Object} The content for the request body for POST method.
 *    @param [options.headers] {Object} HTTP request headers.
 *    @param [options.responseType='text'] {String} The response type.
 *    @param [options.timeout=3000] {Number} to timeout the request, leading into a rejected Promise.
 *    @param [options.withCredentials=false] {boolean} Whether or not to send credentials on the request.
 *    @param [options.parseJSONDate=false] {boolean} Whether the server returns JSON-stringified data which has Date-objects.
 * @return {Promise}
 * on success:
    * Object received data
 * on failure an Error object
    * reason {Error}
*/

/*
IO_Class.prototype.readStreamedArray = function(url, params, streamback, options) {
    console.log(NAME, 'I.IO.readObject  --> '+url+' params: '+JSON.stringify(params));
    var totalarray = [],
        ioStream, parseError;
    options || (options={});
    ioStream = function(partialdata) {
        console.log(NAME, 'IO.readStreamedArray receives partial data: '+partialdata);
        var newdata;
        try {
            newdata = JSON.parse(partialdata, (options.parseJSONDate) ? REVIVER : null);
            streamback(newdata);
            Array.prototype.push.apply(totalarray, Array.isArray(newdata) ? newdata : [newdata]);
        }
        catch (err) {
            console.warn(NAME, 'IO.readStreamedArray cannot parse partial data: '+NOT_ARRAY_ITEMS);
            parseError = true;
        }
    };
    return this.getStream(url, params, ioStream, options).then(
        function(alldata) {
            // first check if there was a parseError on the initial data
            if (parseError) {
                console.warn(NAME, 'IO.readStreamedArray will reject because of partial parse-error: '+NOT_ARRAY_ITEMS);
                throw new Error(NOT_ARRAY_ITEMS);
            }
            // in case no partial response happened, all data might have got within 1 request:
            try {
                (totalarray.length===0) && (totalarray=JSON.parse(alldata, (options.parseJSONDate) ? REVIVER : null));
            }
            catch (err) {
                console.warn(NAME, 'IO.readStreamedArray will reject because of parse-error: '+NOT_ARRAY_ITEMS);
                throw new Error(NOT_ARRAY_ITEMS);
            }
            console.log(NAME, 'IO.readStreamedArray returns with: '+JSON.stringify(totalarray));
            return totalarray;
        }
    );
};

    */
