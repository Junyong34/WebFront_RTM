'use strict';

(function (global, factory) {
    if (global instanceof Error) {
        throw global;
    } else if (typeof global.pako === 'undefined') {
        throw new Error('This has dependencies on the pako.js library. Please load this library.');
    } else if (typeof global.common === 'undefined') {
        global.common = {};
    }

    if (typeof global.common.utils === 'undefined') {
        global.common.utils = {};
    }

    if (typeof global.common.utils.zip === 'undefined') {
        factory(global.common.utils, pako);
    }

})(typeof window !== "undefined" ? window : (typeof self !== "undefined" ? self : new Error('This is only support browser!')), function (utils, pako) {
    utils.zip = {
        unzip: function (arr) {
            var data = new Uint8Array(arr, 0, arr.byteLength - 1);
            var inflate = pako.inflate(pako.inflate(data));
            var str = String.fromCharCode.apply(null, inflate);

            return decodeURIComponent(escape(str));
        }
    };
});
