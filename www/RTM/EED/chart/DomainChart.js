var DomainChart = (function() {
    var props     = null;

    // Image
    var imgIcon = {
        "mainCircle": "images/was_Bg.png",
        "subCircle": "images/web_Db.png"
    };
    var imgPt = {
        "mainCircle": {
            "x": 373,
            "y": 373
        },
        "subCircle": {
            "x": 237,
            "y": 237
        }
    };

    // Property
    var PROP = {
        BG_PCHART_RADIAN_MAIN : imgPt.mainCircle.x / 2,
        BG_PCHART_RADIAN_SUB  : imgPt.subCircle.x / 2,
        BG_PGBAR_HEIGHT       : 60,
        MAIN_CIRCLE_OUTER     : 190,
        MAIN_CIRCLE_FLOOR     : 186,
        SUB_CIRCLE_OUTER      : 120,
        SUB_CIRCLE_FLOOR      : 116,
        LABEL_WIDTH           : 50,
        PGBAR_HEIGHT          : 50
    };

    // Position
    var lPosX, lPosY, mPosX, mPosY, rPosX, rPosY, rPBarX, rPBarY, lPBarX, lPBarY, PBarLen;
    var leftSubTimer, rightSubTimer, mainTimer;
    var cvsChartWidth, cvsChartHeight, chartTop, chartBot;
    var leftChartX, leftChartY, rightChartX, rightChartY;

    // Data
    var tasks, radians, radius, chartDataLeft, chartDataRight;

    // Image
    var subImg, mainImg, subImgLoaded, mainImgLoaded;

    var tick, deltaX;

    // Canvas
    var canvasBG, canvasData, canvasTask, canvasChartLeft, canvasChartRight;
    var ctxBG, ctxData, ctxTask, ctxChartLeft, ctxChartRight;

    function setCanvasAttr(w, h, ctx) {
        ctx.width  = w;
        ctx.height = h;
    }

    var DomainChart = function(args) {
        // init(args);
        // initProperty();
        // initCanvas();
        EEDChart.call(this, args);
        this.initProperty(args);
        this.initCanvas();
    };
    // DomainChart.prototype = new EEDChart(arguments);
    DomainChart.prototype = Object.create(EEDChart.prototype);
    DomainChart.prototype.constructor = EEDChart;

    /**
     * Getter, Setter
     */

    /**
     * Draw Methods
     */
    // DomainChart.prototype.init = function(args) {
    //
    //     this.initProperty(args);
    // };

    DomainChart.prototype.initCanvas = function() {
        var w, h;

        w = ( props.width - 12 < props.minWidth ) ? props.minWidth : props.width - 12;
        h = ( props.height - 50 < props.minHeight ) ? props.minHeight : props.height - 50;

        setCanvasAttr(w, h, canvasBG);
        setCanvasAttr(w, h, canvasData);
        setCanvasAttr(w, h, canvasTask);
        setCanvasAttr(cvsChartWidth, cvsChartHeight, canvasChartLeft);
        setCanvasAttr(cvsChartWidth, cvsChartHeight, canvasChartRight);

        ctxBG         = canvasBG.getContext("2d");
        ctxData       = canvasData.getContext("2d");
        ctxTask       = canvasTask.getContext("2d");
        ctxChartLeft  = canvasChartLeft.getContext("2d");
        ctxChartRight = canvasChartRight.getContext("2d");
    };

    DomainChart.prototype.initProperty = function(args) {
        props = this.getProps();

        lPosX = PROP.BG_PCHART_RADIAN_SUB * 1.3;
        lPosY = props.height / 2;
        mPosX = props.width / 2.1;
        mPosY = props.height / 2;

        PBarLen = mPosX - lPosX;
        lPBarX = lPosX;
        lPBarY = lPosY - PROP.PGBAR_HEIGHT / 2;
        rPBarX = mPosX;
        rPBarY = mPosY - PROP.PGBAR_HEIGHT / 2;

        rPosX = mPosX + PBarLen;
        rPosY = props.height / 2;

        leftSubTimer  = null;
        rightSubTimer = null;
        mainTimer     = null;

        radians = [10 / 16, 14.4 / 16, 9.2 / 16, 15.1 / 16, 8.5 / 16, 15.63 / 16, 7.8 / 16, 0.15 / 16, 7.1 / 16, 0.65 / 16, 6.3 / 16, 1.44 / 16, 5.6 / 16, 2.1 / 16];
        radius  = [113, 145, 115, 155, 115, 155, 115, 145, 117, 158, 124, 140, 128, 140];

        chartDataLeft  = [];
        chartDataRight = [];

        cvsChartWidth  = (mPosX - PROP.BG_PCHART_RADIAN_MAIN) - (lPosX + PROP.BG_PCHART_RADIAN_SUB);
        cvsChartHeight = PROP.BG_PGBAR_HEIGHT;
        chartTop       = cvsChartHeight * 0.2;
        chartBot       = cvsChartHeight * 0.8;
        leftChartX     = lPosX + PROP.BG_PCHART_RADIAN_SUB;
        leftChartY     = (lPosY + 4 - PROP.BG_PGBAR_HEIGHT / 2);
        rightChartX    = mPosX + PROP.BG_PCHART_RADIAN_MAIN;
        rightChartY    = leftChartY;

        tick   = 20;
        deltaX = 0;

        this.setDom(args.id);
        var dom = this.getDomContext();

        // Canvas
        canvasBG = document.createElement("canvas");
        canvasBG.className         = "domainCanvas";
        canvasBG.style.position    = "absolute";
        canvasBG.style.top         = 0 + "px";
        canvasBG.style.left        = 0 + "px";
        dom.appendChild(canvasBG);

        canvasData = document.createElement("canvas");
        canvasData.className       = "domainCanvas";
        canvasData.style.position  = "absolute";
        canvasData.style.top       = 0 + "px";
        canvasData.style.left      = 0 + "px";
        dom.appendChild(canvasData);

        canvasTask = document.createElement("canvas");
        canvasTask.className       = "domainCanvas";
        canvasTask.style.position  = "absolute";
        canvasTask.style.top       = 0 + "px";
        canvasTask.style.left      = 0 + "px";
        dom.appendChild(canvasTask);

        canvasChartLeft = document.createElement("canvas");
        canvasChartLeft.className      = "domainCanvas-Left";
        canvasChartLeft.style.position = "absolute";
        canvasChartLeft.style.top      = leftChartY + "px";
        canvasChartLeft.style.left     = leftChartX + "px";
        dom.appendChild(canvasChartLeft);

        canvasChartRight = document.createElement("canvas");
        canvasChartRight.className      = "domainCanvas-Right";
        canvasChartRight.style.position = "absolute";
        canvasChartRight.style.top      = rightChartY + "px";
        canvasChartRight.style.left     = rightChartX + "px";
        canvasChartRight.style.left     = rightChartX + "px";
        dom.appendChild(canvasChartRight);

        // Image Load
        subImg = new Image();
        subImg.src = imgIcon.subCircle;
        subImg.onload = function() {
            subImgLoaded = true;
        };

        mainImg = new Image();
        mainImg.src = imgIcon.mainCircle;
        mainImg.onload = function() {
            mainImgLoaded = true;
        }
    };

    DomainChart.prototype.draw = function(data) {
        this.clearAllCanvas();
        this.drawManager(data);
    };

    DomainChart.prototype.drawManager = function(data) {
        this.drawBackground();
        this.drawContents(data);
    };

    DomainChart.prototype.drawBackground = function() {
        ctxBG.save();
        ctxBG.fillStyle = common.Util.getColor("background");

        this.drawBGCircle();
        this.drawBGPBar();
        this.drawBGChart();
        ctxBG.restore();
    };

    DomainChart.prototype.clearAllCanvas = function() {
        width  = this.getWidth();
        height = this.getHeight();

        ctxData.beginPath();
        ctxData.clearRect(0, 0, width, height);

        ctxTask.beginPath();
        ctxTask.clearRect(0, 0, width, height);

        ctxChartLeft.beginPath();
        ctxChartLeft.clearRect(0, 0, width, height);

        ctxChartRight.beginPath();
        ctxChartRight.clearRect(0, 0, width, height);
    };

    DomainChart.prototype.drawBGCircle = function() {
        // Left Circle
        ctxBG.beginPath();
        ctxBG.arc(lPosX, lPosY, PROP.BG_PCHART_RADIAN_SUB, 0, Math.PI * 2);
        ctxBG.fill();
        ctxBG.closePath();

        // Middle Circle
        ctxBG.beginPath();
        ctxBG.arc(mPosX, mPosY, PROP.BG_PCHART_RADIAN_MAIN, 0, Math.PI * 2);
        ctxBG.fill();
        ctxBG.closePath();

        // Right Circle
        ctxBG.beginPath();
        ctxBG.arc(rPosX, rPosY, PROP.BG_PCHART_RADIAN_SUB, 0, Math.PI * 2);
        ctxBG.fill();
        ctxBG.closePath();
    };

    DomainChart.prototype.drawBGPBar = function() {
        // Left PGBAR
        ctxBG.beginPath();
        ctxBG.rect(lPBarX, lPBarY, mPosX - lPBarX, PROP.BG_PGBAR_HEIGHT);
        ctxBG.fill();
        ctxBG.closePath();

        // Right PGBAR
        ctxBG.beginPath();
        ctxBG.rect(rPBarX, rPBarY, rPosX - rPBarX, PROP.BG_PGBAR_HEIGHT);
        ctxBG.fill();
        ctxBG.closePath();
    };

    DomainChart.prototype.drawBGChart = function() {
        var ix, x, y, height;

        deltaX = (cvsChartWidth * 0.90) / tick;
        x = leftChartX + deltaX * 2 - 2;
        y = leftChartY + chartTop;
        height = chartBot - chartTop;

        // Draw Chart Axis
        // this.ctxBG.strokeStyle = common.Util.getColor("TPS_CHART_AXES");
        // this.ctxBG.lineWidth = 0.5;
        // this.ctxBG.beginPath();
        // this.ctxBG.moveTo(x, y);
        // this.ctxBG.lineTo(x, y + height);
        // this.ctxBG.lineTo(x + this.cvsChartWidth * 0.90 - this.deltaX, y + height);
        // this.ctxBG.stroke();
        // this.ctxBG.closePath();

        // Draw Cross Lines
        // this.ctxBG.strokeStyle = common.Util.getColor("TPS_CHART_GUIDE");
        // for (ix = 1; ix < this.tick; ix++) {
        //     this.ctxBG.beginPath();
        //     this.ctxBG.moveTo(x + ix * this.deltaX, y);
        //     this.ctxBG.lineTo(x + ix * this.deltaX, y + height - 1);
        //     this.ctxBG.stroke();
        //     this.ctxBG.closePath();
        // }
    };

    DomainChart.prototype.drawContents = function(data) {
        var lX, lY, mX, mY, rX, rY;

        lX = lPosX - PROP.BG_PCHART_RADIAN_SUB;
        lY = lPosY - PROP.BG_PCHART_RADIAN_SUB;
        mX = mPosX - PROP.BG_PCHART_RADIAN_MAIN;
        mY = mPosY - PROP.BG_PCHART_RADIAN_MAIN + 5;
        rX = rPosX - PROP.BG_PCHART_RADIAN_SUB;
        rY = rPosY - PROP.BG_PCHART_RADIAN_SUB;

        // Draw Images
        this.drawSubCircle(lX, lY, subImg, leftSubTimer);
        this.drawMainCircle(mX, mY, mainImg, mainTimer);
        this.drawSubCircle(rX, rY, subImg, rightSubTimer);

        // Data - TPS, Elapse, Error Count
        this.drawSubData(lPosX, lPosY, data.sub1);
        this.drawMainData(mPosX, mPosY, data.main);
        this.drawSubData(rPosX, rPosY, data.sub2);

        // Draw Chart
        this.drawTPSChart(ctxChartLeft, data.sub1.tps, chartDataLeft);
        this.drawTPSChart(ctxChartRight, data.main.tps, chartDataRight);

        // Tasks Label
        this.drawMainTaskLabel(mPosX, mPosY);
    };

    DomainChart.prototype.drawMainCircle = function (x, y, img, timer) {
        if (!mainImgLoaded) {
            if (timer) {
                clearTimeout(timer);
            }

            timer = setTimeout(this.drawMainCircle.bind(this, x, y, img, timer), 10);
            return;
        }

        ctxBG.drawImage(
            img, 0, 0, imgPt.mainCircle.x, imgPt.mainCircle.y,
            x, y, imgPt.mainCircle.x, imgPt.mainCircle.y
        );

        if (timer) {
            clearTimeout(timer);
        }
    };

    DomainChart.prototype.drawMainData = function(x, y, data) {
        var text;

        ctxData.save();
        ctxData.fillStyle = common.Util.getColor("LABEL");
        ctxData.align = "center";

        ctxData.beginPath();

        //TODO - tps 뻥튀기 부분 제거할것
        data.tps *= 20;
        if (data.tps >= 1000) {
            data.tps = data.tps.toFixed(0);
            text = common.Util.getCommaFormat(data.tps);
            ctxData.font = common.Util.getFontSize(30);
            ctxData.fillText(text, x + 3 - common.Util.getTextWidth(text, ctxData) / 2, y - 135);
        } else {
            data.tps = data.tps.toFixed(1);
            text = common.Util.getCommaFormat(data.tps);
            ctxData.font = common.Util.getFontSize(40);
            ctxData.fillText(text, x + 3 - common.Util.getTextWidth(text, ctxData) / 2, y - 130);
        }
        ctxData.closePath();

        text = 'TPS';
        ctxData.save();
        ctxData.beginPath();
        ctxData.font = "bold " + common.Util.getFontSize(16);
        ctxData.fillStyle = common.Util.getColor("BLACK");
        ctxData.fillText(text, x + 3 - common.Util.getTextWidth(text, ctxData) / 2, y - 110);
        ctxData.closePath();
        ctxData.restore();

        // Elapse Time
        text = "Elapse Time(sec)";
        ctxData.font = common.Util.getFontSize(14);
        ctxData.beginPath();
        ctxData.fillText(text, x + 3 - common.Util.getTextWidth(text, ctxData) / 2, y - 38);
        ctxData.closePath();

        // Elapse Time
        if (data.elapse >= 1000) {
            text = data.elapse.toFixed(0);
        } else if (data.elapse >= 100) {
            text = data.elapse.toFixed(1);
        } else {
            text = data.elapse.toFixed(2);
        }

        ctxData.font = common.Util.getFontSize(50);
        ctxData.beginPath();
        ctxData.fillText(text, x + 3 - common.Util.getTextWidth(text, ctxData) / 2, y + 20);
        ctxData.closePath();

        // Error Count
        text = "Error Count";
        ctxData.font = common.Util.getFontSize(11);
        ctxData.beginPath();
        ctxData.fillText(text, x + 8 - common.Util.getTextWidth(text, ctxData), y + 50);
        ctxData.closePath();

        text = data.errorCnt.toFixed(1);
        ctxData.font = common.Util.getFontSize(16);
        ctxData.beginPath();
        ctxData.fillText(text, x + 25, y + 50);
        ctxData.closePath();
        ctxData.restore();
    };

    DomainChart.prototype.drawMainTaskLabel = function(x, y) {
        var ix, ixLen, text, tasks;

        tasks = props.tasks || [];

        ctxTask.fillStyle = common.Util.getColor("LABEL");
        ctxTask.font = "700 " + common.Util.getFontSize(10.5);

        // Draw tasks on the left
        for (ix = 0, ixLen = tasks.length; ix < ixLen; ix += 2) {
            text = tasks[ix];

            ctxTask.beginPath();
            ctxTask.fillText(
                text,
                common.Util.getPosXOnCircle(x, radians[ix], radius[ix]) - common.Util.getTextWidth(text, ctxTask),
                common.Util.getPosYOnCircle(y, radians[ix], radius[ix])
            );
            ctxTask.closePath();
        }

        // Draw tasks on the right
        for (ix = 1, ixLen = tasks.length; ix < ixLen; ix += 2) {
            text = tasks[ix];

            ctxTask.beginPath();
            ctxTask.fillText(
                text,
                common.Util.getPosXOnCircle(x, radians[ix], radius[ix]) - common.Util.getTextWidth(text, ctxTask),
                common.Util.getPosYOnCircle(y, radians[ix], radius[ix])
            );
            ctxTask.closePath();
        }
    };

    DomainChart.prototype.drawSubCircle = function (x, y, img, timer) {
        if (!subImgLoaded) {
            if (timer) {
                clearTimeout(timer);
            }

            timer = setTimeout(this.drawSubCircle.bind(this, x, y, img, timer), 10);
            return;
        }

        ctxBG.drawImage(
            img, 0, 0, imgPt.subCircle.x, imgPt.subCircle.y,
            x, y, imgPt.subCircle.x, imgPt.subCircle.y
        );

        if (timer) {
            clearTimeout(timer);
        }
    };

    DomainChart.prototype.drawSubData = function(x, y, data) {
        var text;

        ctxData.save();
        ctxData.fillStyle = common.Util.getColor("LABEL");
        ctxData.align = "center";

        //TODO - tps 뻥튀기 부분 제거할것
        data.tps *= 30;
        if (data.tps >= 1000) {
            data.tps = data.tps.toFixed(0);
            text = common.Util.getCommaFormat(data.tps);

            ctxData.font = common.Util.getFontSize(20);
            ctxData.beginPath();
            ctxData.fillText(text, x + 20 - common.Util.getTextWidth(text, ctxData), y - 38);
            ctxData.closePath();

            ctxData.font = common.Util.getFontSize(12);
            ctxData.beginPath();
            ctxData.fillText("TPS", x + 26, y - 38);
            ctxData.closePath();
        } else {
            data.tps = data.tps.toFixed(1);
            text = common.Util.getCommaFormat(data.tps);

            ctxData.font = common.Util.getFontSize(25);
            ctxData.beginPath();
            ctxData.fillText(text, x + 20 - common.Util.getTextWidth(text, ctxData), y - 35);
            ctxData.closePath();

            ctxData.font = common.Util.getFontSize(12);
            ctxData.beginPath();
            ctxData.fillText("TPS", x + 26, y - 38);
            ctxData.closePath();
        }

        // Elapse Time
        if (data.elapse >= 1000) {
            text = data.elapse.toFixed(0);
        } else {
            text = data.elapse.toFixed(1);
        }

        ctxData.font = common.Util.getFontSize(40);
        ctxData.beginPath();
        ctxData.fillText(text, x + 3 - common.Util.getTextWidth(text, ctxData) / 1.35, y + 18);
        ctxData.closePath();

        ctxData.font = common.Util.getFontSize(12);
        ctxData.beginPath();
        ctxData.fillText("Sec", x + 25, y + 18);
        ctxData.closePath();

        // Error Count
        text = data.errorCnt.toFixed(1);
        ctxData.font = common.Util.getFontSize(20);
        ctxData.beginPath();
        ctxData.fillText(text, x + 18 - common.Util.getTextWidth(text, ctxData), y + 50);
        ctxData.closePath();

        text = "ERR";
        ctxData.font = common.Util.getFontSize(12);
        ctxData.beginPath();
        ctxData.fillText(text, x + 24, y + 50);
        ctxData.closePath();
        ctxData.restore();
    };

    DomainChart.prototype.drawTPSChart = function (ctx, value, data) {
        var ix, ixLen, posX, posY, startX, startY, max, chartMax, height, text;

        if (!data.length) {
            for (ix = 0; ix < tick; ix++) {
                data.push(0);
            }
        }

        if (typeof value === "string") {
            value = parseFloat(value);
        }

        data.pop();
        data.unshift(value);

        for (ix = 0, chartMax = 0, ixLen = data.length; ix < ixLen; ix++) {
            if (chartMax < data[ix]) {
                chartMax = data[ix];
            }
        }

        ctx.clearRect(0, 0, cvsChartWidth, cvsChartHeight);

        max = chartMax * 1.2;
        height = chartBot - chartTop;
        startX = deltaX * 2 - 2;
        startY = chartTop;
        posX = startX;
        posY = startY + height - ( (data[0] / max) * height );

        // Draw Text
        text = max >= 1000 ? Math.floor(max / 1000) + 'k' : Math.floor(max);

        ctx.save();
        ctx.fillStyle = common.Util.getColor("TPS_CHART_AXES");
        ctx.align = "right";
        ctx.font = common.Util.getFontSize(10);
        ctx.fillText(text, 0, 18);
        ctx.restore();

        // Draw Chart
        // ctx.fillStyle   = "#ffb0c1";
        ctx.fillStyle = common.Util.getRGBA("#2c99f0", 0.5);
        ctx.strokeStyle = "#2c99f0";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(posX, posY);

        for (ix = 1, ixLen = data.length; ix < ixLen; ix++) {
            posX = startX + ix * deltaX;
            posY = startY + height - ( (data[ix] / max) * height );

            // Draw line
            ctx.lineTo(posX, posY);
        }

        //Fill
        posX = startX + (ix - 1) * deltaX;
        posY = startY + height;
        ctx.lineTo(posX, posY);
        ctx.lineTo(startX, posY);

        ctx.stroke();
        ctx.fill();

        ctx.closePath();

        // Draw the very bottom line
        posX = startX + (ix - 1) * deltaX;
        posY = startY + height;
        ctx.strokeStyle = common.Util.getColor("BACKGROUND");
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(startX, posY);
        ctx.lineTo(posX, posY);
        ctx.stroke();
        ctx.closePath();

        // Drawing Points
        posX = startX;
        posY = startY + height - ( (data[0] / max) * height );

        ctx.strokeStyle = "#2c99f0";
        ctx.fillStyle = "#ffffff";
        for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
            posX = startX + ix * deltaX;
            posY = startY + height - ( (data[ix] / max) * height );

            ctx.beginPath();
            ctx.arc(posX, posY, 2, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fill();
            ctx.closePath();
        }
    };

    return DomainChart;
})();
