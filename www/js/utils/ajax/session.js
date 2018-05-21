'use strict';

(function (global, factory) {
    if (global instanceof Error) {
        throw global;
    } else if (typeof global.common === 'undefined' || typeof global.common.utils === 'undefined' || typeof global.common.utils.ajax === 'undefined') {
        // javascript 압출 라이브러리 pako에 대한 종속성 검사
        throw new Error('This has dependencies on the ajax.js library. Please load this library.')
    } else if (typeof global.common.utils.ajax.fetch.session === 'undefined') {
        factory(global.common.utils.ajax, global.common.utils.ajax.fetch);
    }

})(typeof window !== "undefined" ? window : (typeof self !== "undefined" ? self : new Error('This is only support browser!')), function (ajax, fetch) {

    function session () {
        return ajax.get('/Session')
        .then(function (response) {
            return response.response;
        });
    }

    var regularCheckerNum = -1;
    function regularCheck (interval, callback) {
        if (regularCheckerNum !== -1) clearInterval(regularCheckerNum);
        regularCheckerNum = setInterval(function () {

            if (callback) {
                session().then(callback);
            } else {
                session();
            }

        }, interval);
    }

    fetch.session = session
    fetch.session.regularCheck = regularCheck;
});
