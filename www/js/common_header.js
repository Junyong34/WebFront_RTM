window.common_header = function (session) {
    'use strict';
    if (session && session.locationPath) {

        var home = '/realtime/cinema';

        if (window.location.pathname.indexOf('Menu'))
            if (session.locationPath) {
                home = session.locationPath;
            }

        $('body').append('<div class="fixed_top">[' + session.userid + ']</div>');
        $('#header').append('<a href="' + home + '" class="homelink" style="position: absolute;left: 20px;top: 9px;width: 174px;height: 27px;"></a>');
    }
};
