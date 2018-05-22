var EEDSummary = (function() {
    var background;

    var curWidth;
    var tickW;
    var posX;
    var flexTxn, flexVisit, flexAVG, flexRunning, flexError;

    var ctxFillStyle = '#ABAEB5';

    var imgIcon, iconPt;

    var that;

    var imgTxn, imgVisit, imgAVG, imgRunning, imgError;
    var imgTxnLoad, imgVisitLoad, imgAVGLoad, imgRunningLoad, imgErrorLoad;
    var imgTxnDraw, imgVisitDraw, imgAVGDraw, imgRunningDraw, imgErrorDraw;

    var txnCountToday, txnCountYester, errorRate, visitorCnt, averageCnt;

    var EEDSummary = function(args) {
        this.props = {
            width     : 1920,
            height    : 50,
            minWidth  : 1480,
            minHeight : 50,
            id        : null,
            dom       : null,
            canvasTxn     : null,
            canvasVisit   : null,
            canvasAVG     : null,
            canvasRunning : null,
            canvasError   : null,
            ctxTxn        : null,
            ctxVisit      : null,
            ctxAVG        : null,
            ctxRunning    : null,
            ctxError      : null,
            ctxFillStyle  : '#ABAEB5'
        };

        var ix;
        for (ix in args) {
            this.props[ix] = args[ix];
        }
    };

    EEDSummary.prototype.init = function() {
        this.initProperty();
        this.setInitialSize();
        this.setTickW();
        this.initCanvas();
    };

    EEDSummary.prototype.initProperty = function() {
        this.props.dom = document.getElementById(this.props.id);

        background = document.createElement("div");
        background.className = "summaryBackground";
        background.setAttribute("width", this.props.width);
        background.setAttribute("height", this.props.height);

        this.props.dom.appendChild(background);

        ctxFillStyle = "#ABAEB5";

        imgIcon = {
            'src' : 'images/xm_icon_White_v1.png'
        };
        iconPt = {
            'txn'        : {'x': 0,   'y': 825, 'w': 40, 'h': 40},
            'visit'      : {'x': 43,  'y': 825, 'w': 40, 'h': 40},
            'elapseAVG'  : {'x': 86,  'y': 825, 'w': 40, 'h': 40},
            'running'    : {'x': 129, 'y': 825, 'w': 40, 'h': 40},
            'error'      : {'x': 172, 'y': 825, 'w': 40, 'h': 40}
        };

        txnCountToday  = 0;
        txnCountYester = 0;
        errorRate      = 0;
        visitorCnt     = 0;
        averageCnt     = 0;
    };

    EEDSummary.prototype.setInitialSize = function() {
        var w, h;

        w  = ( this.props.width  < this.props.minWidth ) ? this.props.minWidth : this.props.width ;
        h  = ( this.props.height < this.props.minHeight ) ? this.props.minHeight : this.props.height;

        background.style.width  = w + "px";
        background.style.height = h + "px";
    };

    EEDSummary.prototype.initCanvas = function() {
        var that = this;

        this.props.canvasTxn = document.createElement("canvas");
        this.props.canvasTxn.setAttribute("width", tickW * flexTxn);
        this.props.canvasTxn.setAttribute("height", this.props.height);
        background.appendChild(this.props.canvasTxn);

        this.props.canvasVisit = document.createElement("canvas");
        this.props.canvasVisit.setAttribute("width", tickW * flexVisit);
        this.props.canvasVisit.setAttribute("height", this.props.height);
        background.appendChild(this.props.canvasVisit);

        this.props.canvasAVG = document.createElement("canvas");
        this.props.canvasAVG.setAttribute("width", tickW * flexAVG);
        this.props.canvasAVG.setAttribute("height", this.props.height);
        background.appendChild(this.props.canvasAVG);

        this.props.canvasRunning = document.createElement("canvas");
        this.props.canvasRunning.setAttribute("width", tickW * flexRunning);
        this.props.canvasRunning.setAttribute("height", this.props.height);
        background.appendChild(this.props.canvasRunning);

        this.props.canvasError = document.createElement("canvas");
        this.props.canvasError.setAttribute("width", tickW * flexError);
        this.props.canvasError.setAttribute("height", this.props.height);
        background.appendChild(this.props.canvasError);

        background.append(this.props.canvasTxn, this.props.canvasVisit, this.props.canvasAVG, this.props.canvasRunning, this.props.canvasError);

        this.props.ctxTxn = this.props.canvasTxn.getContext("2d");
        this.props.ctxVisit = this.props.canvasVisit.getContext("2d");
        this.props.ctxAVG = this.props.canvasAVG.getContext("2d");
        this.props.ctxRunning = this.props.canvasRunning.getContext("2d");
        this.props.ctxError = this.props.canvasError.getContext("2d");


        that = this;

        imgTxn = new Image();
        imgTxn.src = imgIcon.src;
        imgTxn.onload = function(){
            imgTxnLoad = true;
        };

        imgVisit = new Image();
        imgVisit.src = imgIcon.src;
        imgVisit.onload = function(){
            imgVisitLoad = true;
        };

        imgAVG = new Image();
        imgAVG.src = imgIcon.src;
        imgAVG.onload = function(){
            imgAVGLoad = true;
        };

        imgRunning = new Image();
        imgRunning.src = imgIcon.src;
        imgRunning.onload = function(){
            imgRunningLoad = true;
        };

        imgError = new Image();
        imgError.src = imgIcon.src;
        imgError.onload = function(){
            imgErrorLoad = true;
        };
    };

    EEDSummary.prototype.setTickW = function() {
        curWidth = typeof this.props.width === 'string' ? 1920 : this.props.width;

        if(this.props.width < this.props.width + 50){
            // posX = 0;
            posX = 20;
            flexTxn = 4;
            flexVisit = 2.5;
            flexAVG = 3;
            flexRunning = 2;
            flexError = 1.5;
        }else {
            posX = 20;
            flexTxn = 4;
            flexVisit = 3;
            flexAVG = 3;
            flexRunning = 2.5;
            flexError = 1.5;
        }
        tickW = (curWidth - 60) / (flexTxn + flexVisit + flexAVG + flexRunning + flexError);
    };

    EEDSummary.prototype.getProps = function() {
        return this.props;
    };

    EEDSummary.prototype.clearAllCanvas = function() {
        this.props.ctxTxn.clearRect(0, 0, this.props.width, this.props.height);
        this.props.ctxVisit.clearRect(0, 0, this.props.width, this.props.height);
        this.props.ctxAVG.clearRect(0, 0, this.props.width, this.props.height);
        this.props.ctxRunning.clearRect(0, 0, this.props.width, this.props.height);
        this.props.ctxError.clearRect(0, 0, this.props.width, this.props.height);
    };

    EEDSummary.prototype.draw = function(data) {
        this.clearAllCanvas();
        this.drawTxn(data.txnToday, data.txnYester);
        this.drawVisitor(data.visitorCnt);
        this.drawAVG(data.elapseAVG);
        this.drawRunningCnt(data.runningCnt);
        this.drawErrorCnt(data.errorCnt);
    };

    EEDSummary.prototype.drawImage = function(ctx, img, iconPt, posX) {
        ctx.drawImage(img, iconPt.x, iconPt.y, iconPt.w, iconPt.h, posX, 5, iconPt.w, iconPt.h);
    };

    EEDSummary.prototype.drawTxn = function(txnToday, txnYester) {
        if (!imgTxnLoad) {
            setTimeout(this.drawTxn.bind(this, txnToday, txnYester), 10);
            return;
        }

        var text, textWidth, font, fontLg;

        font = 14;
        if(txnToday >= 100000 || txnYester >= 100000){
            fontLg = 22;
        }else{
            fontLg = 26;
        }

        this.props.ctxTxn.save();

        // Draw Image
        this.props.ctxTxn.fillStyle = this.props.ctxFillStyle;
        this.drawImage(this.props.ctxTxn, imgTxn, iconPt["txn"], posX);

        // '총 거래건수(금일/어제):'
        //TODO - 한글 -> 영문으로 변경해놓을것
        this.props.ctxTxn.font = common.Util.getFontSize(font);
        // text = common.Util.TR('Txn Count(Today/Yesterday)') + ' : ';
        text = common.Util.TR('총 거래건수(금일/어제)') + ' : ';
        textWidth = this.props.ctxTxn.measureText(text).width + 40;
        this.props.ctxTxn.fillText(text, 40 + posX, 32);

        // '금일'
        this.props.ctxTxn.save();
        this.props.ctxTxn.font = common.Util.getFontSize(fontLg);
        text = common.Util.getCommaFormat(txnToday);
        this.props.ctxTxn.fillText(text, textWidth + posX, 33);
        textWidth += this.props.ctxTxn.measureText(text).width;
        this.props.ctxTxn.restore();

        // '건/'
        //TODO - 한글 -> 영문으로 변경해놓을것
        // text = ' ' + common.Util.TR('Txn') + ' / ';
        text = ' ' + common.Util.TR('건') + ' / ';
        this.props.ctxTxn.fillText(text, textWidth + posX, 32);
        textWidth += this.props.ctxTxn.measureText(text).width;

        // '어제'
        this.props.ctxTxn.save();
        this.props.ctxTxn.font = common.Util.getFontSize(fontLg);
        text = common.Util.getCommaFormat(txnYester);
        this.props.ctxTxn.fillText(text, textWidth + posX, 33);
        textWidth += this.props.ctxTxn.measureText(text).width;
        this.props.ctxTxn.restore();

        //TODO - 한글 -> 영문으로 변경해놓을것
        // text = ' ' + common.Util.TR('Txn');
        text = ' ' + common.Util.TR('건');
        this.props.ctxTxn.fillText(text, textWidth + posX, 32);

        this.props.ctxTxn.restore();
        imgTxnLoad = true;
    };

    EEDSummary.prototype.drawVisitor = function(visitorCnt) {
        if (!imgVisitLoad) {
            setTimeout(this.drawVisitor.bind(this, visitorCnt), 10);
            return;
        }
        var text, textWidth, font, fontLg;

        font = 14;
        if(visitorCnt > 100000){
            fontLg = 22;
        }else{
            fontLg = 26;
        }

        this.props.ctxVisit.save();

        // Draw Image
        this.props.ctxVisit.fillStyle = this.props.ctxFillStyle;
        this.drawImage(this.props.ctxVisit, imgVisit, iconPt["visit"], posX);

        //'방문자 수 : '
        this.props.ctxVisit.font = common.Util.getFontSize(font);

        //TODO - 한글 -> 영문으로 변경할것
        // text = common.Util.TR('Visitor Count') + ' : ';
        text = common.Util.TR('방문자 수') + ' : ';
        textWidth = this.props.ctxVisit.measureText(text).width + 42;
        this.props.ctxVisit.fillText(text, 42 + posX, 32);

        this.props.ctxVisit.save();
        this.props.ctxVisit.font = common.Util.getFontSize(fontLg);
        text = common.Util.getCommaFormat(visitorCnt);
        this.props.ctxVisit.fillText(text, textWidth + posX, 34);
        textWidth += this.props.ctxVisit.measureText(text).width;
        this.props.ctxVisit.restore();

        //TODO - 한글 -> 영문으로 변경할것
        // text = ' ' + common.Util.TR('ppl');
        text = ' ' + common.Util.TR('명');
        this.props.ctxVisit.fillText(text, textWidth + posX, 32);

        this.props.ctxVisit.restore();
    };

    EEDSummary.prototype.drawAVG = function(elapseAVG) {
        if (!imgAVGLoad) {
            setTimeout(this.drawAVG.bind(this, elapseAVG), 10);
            return;
        }
        var text, textWidth, font, fontLg;

        font = 14;
        if(elapseAVG > 100000){
            fontLg = 22;
        }else{
            fontLg = 26;
        }

        this.props.ctxAVG.save();

        // Draw Image
        this.props.ctxAVG.fillStyle = this.props.ctxFillStyle;
        this.drawImage(this.props.ctxAVG, imgAVG, iconPt["elapseAVG"], posX);

        //'평균 처리시간 : '
        //TODO - 한글 -> 영문 처리 해놓을것
        this.props.ctxAVG.font = common.Util.getFontSize(font);
        // text = common.Util.TR('Elapse AVG Time') + ' : ';
        text = common.Util.TR('평균 처리시간(AVG)') + ' : ';
        this.props.ctxAVG.fillText(text, 44 + posX, 32);
        textWidth = this.props.ctxAVG.measureText(text).width + 44;

        this.props.ctxAVG.save();
        this.props.ctxAVG.font = common.Util.getFontSize(fontLg);
        text = common.Util.getCommaFormat(elapseAVG.toFixed(2));
        this.props.ctxAVG.fillText(text, textWidth + posX, 34);
        textWidth += this.props.ctxAVG.measureText(text).width;
        this.props.ctxAVG.restore();

        text = ' sec';
        this.props.ctxAVG.fillText(text, textWidth + posX, 32);

        this.props.ctxVisit.restore();
    };

    EEDSummary.prototype.drawRunningCnt = function(runningCnt) {
        if (!imgRunningLoad) {
            setTimeout(this.drawRunningCnt.bind(this, runningCnt), 10);
            return;
        }
        var text, textWidth, font, fontLg;

        font = 14;
        if(runningCnt > 100000){
            fontLg = 22;
        }else{
            fontLg = 26;
        }

        this.props.ctxRunning.save();

        // Draw Image
        this.props.ctxRunning.fillStyle = this.props.ctxFillStyle;
        this.drawImage(this.props.ctxRunning, imgAVG, iconPt["running"], posX);

        //'가동율 : '
        //TODO - 한글 -> 영문 처리 해놓을것
        this.props.ctxRunning.font = common.Util.getFontSize(font);
        // text = common.Util.TR('Running Count') + ' : ';
        text = common.Util.TR('가동율') + ' : ';
        this.props.ctxRunning.fillText(text, 44 + posX, 32);
        textWidth = this.props.ctxRunning.measureText(text).width + 44;

        this.props.ctxRunning.save();
        this.props.ctxRunning.font = common.Util.getFontSize(fontLg);
        text = runningCnt;
        this.props.ctxRunning.fillText(text, textWidth + posX, 34);
        textWidth += this.props.ctxRunning.measureText(text).width;
        this.props.ctxRunning.restore();

        text = ' %';
        this.props.ctxRunning.fillText(text, textWidth + posX, 32);

        this.props.ctxVisit.restore();
    };

    EEDSummary.prototype.drawErrorCnt = function(errorCnt) {
        if (!imgRunningLoad) {
            setTimeout(this.drawErrorCnt.bind(this, errorCnt), 10);
            return;
        }
        var text, textWidth, font, fontLg;

        font = 14;
        if(errorCnt > 100000){
            fontLg = 22;
        }else{
            fontLg = 26;
        }

        this.props.ctxError.save();

        // Draw Image
        this.props.ctxError.fillStyle = this.props.ctxFillStyle;
        this.drawImage(this.props.ctxError, imgAVG, iconPt["error"], posX);

        //'가동율 : '
        //TODO - 한글 -> 영문 처리 해놓을것
        this.props.ctxError.font = common.Util.getFontSize(font);
        // text = common.Util.TR('Error Count') + ' : ';
        text = common.Util.TR('오류율') + ' : ';
        this.props.ctxError.fillText(text, 44 + posX, 32);
        textWidth = this.props.ctxError.measureText(text).width + 44;

        this.props.ctxError.save();
        this.props.ctxError.font = common.Util.getFontSize(fontLg);
        text = errorCnt;
        this.props.ctxError.fillText(text, textWidth + posX, 34);
        textWidth += this.props.ctxError.measureText(text).width;
        this.props.ctxError.restore();

        text = ' %';
        this.props.ctxError.fillText(text, textWidth + posX, 32);

        this.props.ctxVisit.restore();
    };

    return EEDSummary;
})();
