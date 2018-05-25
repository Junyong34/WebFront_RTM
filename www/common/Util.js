if (!window.common) {
    window.common = {Util: {}};
}
window.common.Util = {
    COLOR: {
        BACKGROUND            : "#2C2F36",
        BLACK                 : "#181B24",
        LEGEND                : "#4C5960",
        // LABEL                 : "#ABAEB5",
        LABEL                 : "#E7E7E7",
        MAIN_CIRCLE_FLOOR     : "#27384b",
        SUB_CIRCLE_FLOOR      : "#284133",
        MAIN_FLOOR_BORDER     : "#374b62",
        SUB_FLOOR_BORDER      : "#3b5b48",
        SERVER_NORMAL         : "#00A9FF",
        SERVER_NORMAL_LIGHT   : "#61CAFF",
        SERVER_NORMAL_DARK    : "#007FBF",
        SERVER_WARNING        : "#E6BE00",
        SERVER_WARNING_LIGHT  : "#F0D761",
        SERVER_WARNING_DARK   : "#8C7506",
        SERVER_CRITICAL       : "#E60000",
        SERVER_CRITICAL_LIGHT : "#F06161",
        SERVER_CRITICAL_DARK  : "#971616",
        SERVER_DOWN           : "#393c43",
        SERVER_DOWN_LIGHT     : "#85878c",
        PGBAR_BORDER          : "#1D1F26",
        PGBAR_SERVER_ON       : "#004790",
        PGBAR_DATA_ON         : "#00A9FF",
        TPS_CHART_AXES        : "#CCCCCC",
        TPS_CHART_GUIDE       : "#5D5D5D",
        NORMAL                : "#42A5F6",
        WARNING               : "#FF9803",
        CRITICAL              : "#D7000F",
        TPS_DIAL              : "#41A5F6"
    },

    printErr: function(errorStr, callee) {
        console.debug('%c' + '[Error] ' + errorStr, 'color:Red;');
        console.debug('Caller :', arguments.callee.caller);
        console.debug('callee :', callee);
    },

    /**
     * 원의 x 좌표를 구함
     * x - 원의 중심점 x좌표
     * radianRate - 각도 세타
     * radius - 반지름
     */
    getPosXOnCircle: function(x, radianRate, radius) {
        // return x + (Math.cos((Math.PI * 2) * radianRate) * radius);
        return x + Math.cos((Math.PI * radianRate)) * radius;
    },

    /**
     * 원의 y 좌표를 구함
     * * x - 원의 중심점 x좌표
     * radianRate - 각도 세타
     * radius - 반지름
     */
    getPosYOnCircle: function(y, radianRate, radius) {
        // return y + (Math.sin((Math.PI * 2) * radianRate) * radius);
        return y + Math.sin((Math.PI * radianRate)) * radius;
    },

    getTextWidth: function(text, ctx) {
        return ctx.measureText(text).width;
    },

    getMax: function(a, b) {
        return a > b ? a : b;
    },

    /**
     * color와 alpha 투명도를 주면 rgba() 형태로 변환하는 메소드
     * color - color 값. # 유무 상관 없음, rgb 값 3자리로 들어온 값도 처리 가능. 예) "#fff" -> "ffffff"
     * alpha - opacity
     */
    getRGBA: function(color, alpha) {
        if (color[0] === '#') {
            color = color.substring(1);
        }

        if (color.length === 3) {
            color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
        }

        if (isNaN(alpha) || typeof alpha === "object") {
            alpha = 0;
        } else {
            if (typeof alpha === "string") {
                alpha = parseFloat(alpha);
            }

            if (alpha < 0) {
                alpha = 0;
            } else if (alpha > 1) {
                alpha = 1;
            }
        }

        var R, G, B, A;

        R = "0x" + color.substring(0, 2);
        G = "0x" + color.substring(2, 4);
        B = "0x" + color.substring(4, 6);

        R = parseInt(R);
        G = parseInt(G);
        B = parseInt(B);
        A = alpha;

        return 'rgba(' + R.toString(10) + ',' + G.toString(10) + ',' + B.toString(10) + ',' + A + ')';
    },

    /**
     * COLOR에 등록된 값의 key 값을 text 파라미터로 넘기고, 원하는 투명도를 같이 넘기면 투명도가 적용되서 해당하는 색이 반환된다
     */
    getColor: function(text, alpha) {
        var color;

        if (!text || !text.length) {
            return;
        }

        if (typeof text !== "string") {
            text = text + '';
        }

        color = this.COLOR[text.toUpperCase()];

        if (alpha !== undefined && alpha !== null) {
            return this.getRGBA(color, alpha);
        } else {
            return color;
        }
    },

    getFontSize: function(v) {
        return v + 'px Droid Sans, NanumGothic';
    },

    getCommaFormat: function(v) {
        if (isNaN(v) || typeof v === "object") {
            v = 0;
        }

        v += '';

        return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    TR: function(v) {
        return v;
    },
    /***
     * 정렬 메소드.
     * 반드시 배열로 넘겨야하고, 값이 2개 이상일 때부터 적용 된다.
     * 정렬(orderBy)를 "desc"라고 정확하게 넘기지 않는 모든 경우에 대해서 "asc"로 적용된다.
     */
    sort: function(data, orderBy) {
        if (!Array.isArray(data)) {
            return data;
        }

        if (data.length < 2) {
            return data;
        }

        var order = !orderBy ? "asc" : orderBy.toLowerCase();

        if (order === "desc") {
            data.sort(function(a, b) {
                return b > a;
            });
        } else {
            data.sort(function(a, b) {
                return a > b;
            });
        }

        return data;
    }
};
Object.freeze(window.common.Util);
