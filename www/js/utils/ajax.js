'use strict';

(function (global, factory) {

    if (global instanceof Error) {
        throw global;
    } else if (typeof global.common === 'undefined' || typeof global.common.utils === 'undefined' || typeof global.common.utils.zip === 'undefined') {
        throw new Error('This has dependencies on the zip.js library. Please load this library.')
    } else if (typeof global.common.utils.ajax === 'undefined') {
        factory(global.common.utils, global.common.utils.zip);
    }

})(typeof window !== "undefined" ? window : (typeof self !== "undefined" ? self : new Error('This is only support browser!')), function (utils, zip) {

    // arraybuffer를 기본 response type으로 사용하는 ajax의 데이터를
    // 버퍼에서 꺼내와 파싱 작업을 거쳐야 한다.
    // 압축된 데이터의 경우에는 zip.js의 unzip을 사용하고
    // 압축되지 않은 데이터는 ab2str함수로 파싱한다.
    function ab2str (arr) {
        var result;

        if (arr.byteLength > 10000) {
            result = '';
            var uint8 = new Uint8Array(arr);
            var uint8Len = uint8.length;
            for (var i = 0; i < uint8Len; i++) {
                result += String.fromCharCode(uint8[i]);
            }
        } else {
            var decoder = new TextDecoder("utf-8");
            result = decoder.decode(new Uint8Array(arr));
        }

        return result;
    }

    var ajax = function (options) {
        options = options || { url: "" };
        options.type = typeof options.type === 'undefined' ? 'GET' : options.type.toUpperCase();
        options.headers = options.headers || {};
        options.timeout = parseInt(options.timeout) || 0;

        // url이 없으면 통신을 하지 않는다.
        if (options.url === '') {
            console.warn('Not found url option');
            return;
        }

        return new Promise(function (resolve, reject) {
            var client = new XMLHttpRequest();
            if (options.timeout > 0) {
                client.timeout = options.timeout;
                client.ontimeout = function () {
                    reject({
                        error: 'timeout',
                        xhr: client
                    });
                }
            }

            client.open(options.type, options.url, true);

            for (var i in options.headers) {
                if (options.headers.hasOwnProperty(i)) {
                    client.setRequestHeader(i, options.headers[i]);
                }
            }

            client.responseType = 'arraybuffer';

            client.send(options.data);
            client.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    var data;
                    if (this.getResponseHeader('X-Compress') === 'true') {
                        data = zip.unzip(this.response);
                    } else {
                        data = ab2str(this.response);
                    }
                    var contentType = this.getResponseHeader('Content-Type');
                    if (contentType && contentType.match(/json/)) {
                        data = JSON.parse(data);
                    }

                    resolve({
                        data: data,
                        statue: this.statusText
                    });
                } else if (this.readyState == 4) {
                    reject({
                        error: this.statusText,
                        xhr: client
                    });
                }
            };
        }).then(function (data) {
            return data.data;
        });
    }

    ajax.get = function (url, datas) {
        if (typeof datas !== 'undefined') {
            if (url.indexOf('?') !== -1) {
                if (!url.endsWith('&')) {
                    url += '&';
                }
            } else {
                url += '?';
            }

            var data;
            Object.keys(datas).forEach(function (key) {
                data = datas[key];

                if (data instanceof Array) {
                    data.forEach(function (dataKey) {
                        url += encodeURIComponent(key) + '=' + encodeURIComponent(dataKey) + '&'
                    });
                } else {
                    url += encodeURIComponent(key) + '=' + encodeURIComponent(data) + '&'
                }
            });

            url = url.slice(0, url.length - 1);
        }

        return ajax({
            url: url,
            type: 'GET'
        });
    }

    ajax.post = function (url, data) {
        return ajax({
            url: url,
            data: data,
            type: 'POST'
        });
    }

    ajax.fetch = {};

    utils.ajax = ajax;
});
