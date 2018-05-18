'use strict';

(function (global, factory) {
    if (global instanceof Error) {
        throw global;
    } else if (typeof global.common === 'undefined' || typeof global.common.utils === 'undefined' || typeof global.common.utils.ajax === 'undefined') {
        throw new Error('This has dependencies on the ajax.js library. Please load this library.');
    } else if (typeof global.common.utils.local === 'undefined') {
        factory(global.common, global.common.utils, global.common.utils.ajax);
    }

})(typeof window !== "undefined" ? window : (typeof self !== "undefined" ? self : new Error('This is only support browser!')), function (root, utils, ajax) {
    var local = {
        load: function (local, isCached) {
            return ajax.get('/Lang', {
                lang: local
            }).then(function (res) {
                if (isCached) {
                    root.LANG = Object.freeze(res.response);
                }

                return res.response;
            }).catch(function (err) {
                console.error(err.error);
            });
        }
    }

    utils.local = local
});
