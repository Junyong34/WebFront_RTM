var EEDChart = (function() {
    var props     = {
        minWidth  : 1080,
        minHeight : 590,
        width     : null,
        height    : null,
        id        : null,
        dom       : null
    };
    // var prevW     = null;
    // var prevH     = null;

    var Chart = function(args) {
        var ix;

        for (ix in args) {
            props[ix] = args[ix];
        }
    };

    /**
     * Getter, Setter
     */

    Chart.prototype.getWidth = function() {
        return props.width;
    };

    Chart.prototype.getHeight = function() {
        return props.height;
    };

    Chart.prototype.getMinWidth = function() {
        return props.minWidth;
    };

    Chart.prototype.getMinHeight = function() {
        return props.minHeight;
    };

    Chart.prototype.getDomContext = function() {
        return props.dom;
    };

    Chart.prototype.getProps = function() {
        return props;
    };

    Chart.prototype.setCanvasAttr = function(w, h, ctx) {
        ctx.width  = w;
        ctx.height = h;
    };

    Chart.prototype.setId = function(ID) {
        props.id = ID;
    };

    Chart.prototype.setWidth = function(w) {
        props.width = w;
    };

    Chart.prototype.setHeight = function(h) {
        props.height = h;
    };

    Chart.prototype.setMinWidth = function(minW) {
        props.minWidth = minW;
    };

    Chart.prototype.setMinHeight = function(minH) {
        props.minHeight = minH;
    };

    Chart.prototype.setDom = function(id) {
        props.dom = document.getElementById(id);

        if (!props.dom) {
            throw Error("Target ID is undefeined.");
        }
    };

    return Chart;
})();
