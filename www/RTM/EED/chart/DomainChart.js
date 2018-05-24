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
        BG_PCHART_RADIAN_MAIN : imgPt.mainCircle.x / 2 + 10,
        BG_PCHART_RADIAN_SUB  : imgPt.subCircle.x / 2 + 10,
        BG_PGBAR_HEIGHT       : 60,
        MAIN_CIRCLE_OUTER     : 190,
        MAIN_CIRCLE_FLOOR     : 186,
        SUB_CIRCLE_OUTER      : 120,
        SUB_CIRCLE_FLOOR      : 116,
        LABEL_WIDTH           : 50,
        PGBAR_HEIGHT          : 50,
        NORMAL_RATE           : 1.5 + 1.7,
        WARNING_RATE          : 1.5 + 1.9,
        CRITICAL_RATE         : 1.5 + 2.0
    };

    // Position
    var lPosX, lPosY, mPosX, mPosY, rPosX, rPosY, rPBarX, rPBarY, lPBarX, lPBarY, PBarLen;
    var leftSubTimer, rightSubTimer, mainTimer;
    var cvsChartWidth, cvsChartHeight, chartTop, chartBot;
    var leftChartX, leftChartY, rightChartX, rightChartY;

    // Data
    var taskInfos, radians, radius, cirRadians, cirRadius, chartDataLeft, chartDataRight;

    // Image
    var subImg, mainImg, subImgLoaded, mainImgLoaded;

    var tick, deltaX;

    // Canvas
    var canvasBG, canvasEffect, canvasDial, canvasData, canvasTask, canvasAlarm, canvasChartLeft, canvasChartRight;
    var ctxBG, ctxEffect, ctxDial, ctxData, ctxTask, ctxAlarm, ctxChartLeft, ctxChartRight;

    // Dial
    var lastMainTPSMax, lastLSubTPSMax, lastRSubTPSMax;
    var mainDialTick, subDialTick, time, startAlpha, endAlpha;
    var subOuterRadius, subInnerRadius, mainOuterRadius, mainInnerRadius;
    var mainTickWidth, subTickWidth, mainTPSTick, lSubTPSTick, rSubTPSTick;
    var lDialTimer, mDialTimer, rDialTimer;
    var dialParams, posXList, posYList, outerRadList, innerRadList, tickList, TPSPrevious, TPSCurrent, dialTickList, TPSTickList, timerList, lastMaxTPSList, alarmColorList;

    var firstInit;

    // Alarm
    var alarmColor, alarmStatus;
    var spinningCnt, spinningRate, spinningGap, spinningTimer;

    function setCanvasAttr(w, h, ctx) {
        ctx.width  = w;
        ctx.height = h;
    }

    var DomainChart = function(args) {
        EEDChart.call(this, args);
        this.initProperty(args);
        this.initCanvas(args);
        this.initDialParams();

        this.alarmAnimation();
    };
    DomainChart.prototype = Object.create(EEDChart.prototype);
    DomainChart.prototype.constructor = EEDChart;

    DomainChart.prototype.initCanvas = function(args) {
        var w, h, dom;

        dom   = this.getDomContext();

        w     = ( props.width - 12 < props.minWidth ) ? props.minWidth : props.width - 12;
        h     = ( props.height - 50 < props.minHeight ) ? props.minHeight : props.height - 50;

        // Canvas

        canvasEffect = document.createElement("canvas");
        canvasEffect.className       = "domainCanvas";
        canvasEffect.id              = "canvasEffect";
        canvasEffect.style.position  = "absolute";
        canvasEffect.style.top       = 0 + "px";
        canvasEffect.style.left      = 0 + "px";
        dom.appendChild(canvasEffect);

        canvasBG = document.createElement("canvas");
        canvasBG.className         = "domainCanvas";
        canvasBG.id                = "canvasBG";
        canvasBG.style.position    = "absolute";
        canvasBG.style.top         = 0 + "px";
        canvasBG.style.left        = 0 + "px";
        dom.appendChild(canvasBG);

        canvasDial = document.createElement("canvas");
        canvasDial.className       = "domainCanvas";
        canvasDial.id              = "canvasDial";
        canvasDial.style.position  = "absolute";
        canvasDial.style.top       = 0 + "px";
        canvasDial.style.left      = 0 + "px";
        dom.appendChild(canvasDial);

        canvasData = document.createElement("canvas");
        canvasData.className       = "domainCanvas";
        canvasData.id              = "canvasData";
        canvasData.style.position  = "absolute";
        canvasData.style.top       = 0 + "px";
        canvasData.style.left      = 0 + "px";
        dom.appendChild(canvasData);

        canvasTask = document.createElement("canvas");
        canvasTask.className       = "domainCanvas";
        canvasTask.id              = "canvasTask";
        canvasTask.style.position  = "absolute";
        canvasTask.style.top       = 0 + "px";
        canvasTask.style.left      = 0 + "px";
        dom.appendChild(canvasTask);

        canvasAlarm = document.createElement("canvas");
        canvasAlarm.className       = "domainCanvas";
        canvasAlarm.id              = "canvasAlarm";
        canvasAlarm.style.position  = "absolute";
        canvasAlarm.style.top       = mPosY - PROP.MAIN_CIRCLE_FLOOR + "px";
        canvasAlarm.style.left      = mPosX - PROP.MAIN_CIRCLE_FLOOR + "px";
        dom.appendChild(canvasAlarm);

        canvasChartLeft = document.createElement("canvas");
        canvasChartLeft.className      = "domainCanvas-Left";
        canvasChartLeft.id             = "canvasChartLeft";
        canvasChartLeft.style.position = "absolute";
        canvasChartLeft.style.top      = leftChartY + "px";
        canvasChartLeft.style.left     = leftChartX + "px";
        dom.appendChild(canvasChartLeft);

        canvasChartRight = document.createElement("canvas");
        canvasChartRight.className      = "domainCanvas-Right";
        canvasChartRight.id             = "canvasChartRight";
        canvasChartRight.style.position = "absolute";
        canvasChartRight.style.top      = rightChartY + "px";
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
        };

        setCanvasAttr(w, h, canvasBG);
        setCanvasAttr(w, h, canvasEffect);
        setCanvasAttr(w, h, canvasDial);
        setCanvasAttr(w, h, canvasData);
        setCanvasAttr(w, h, canvasTask);
        setCanvasAttr(PROP.MAIN_CIRCLE_FLOOR * 2, PROP.MAIN_CIRCLE_FLOOR * 2, canvasAlarm);
        setCanvasAttr(cvsChartWidth, cvsChartHeight, canvasChartLeft);
        setCanvasAttr(cvsChartWidth, cvsChartHeight, canvasChartRight);

        ctxBG         = canvasBG.getContext("2d");
        ctxEffect     = canvasEffect.getContext("2d");
        ctxDial       = canvasDial.getContext("2d");
        ctxData       = canvasData.getContext("2d");
        ctxTask       = canvasTask.getContext("2d");
        ctxAlarm      = canvasAlarm.getContext("2d");
        ctxChartLeft  = canvasChartLeft.getContext("2d");
        ctxChartRight = canvasChartRight.getContext("2d");
    };

    DomainChart.prototype.initProperty = function(args) {
        var ix, ixLen;

        this.setDom(args.id);

        props = this.getProps();

        // Position - 그림을 그리기 위해 필요한 위치 값에 대한 변수
        lPosX = PROP.BG_PCHART_RADIAN_SUB * 1.3;    // 왼쪽 circle의 x 좌표
        lPosY = props.height / 2;                   // 왼족 circle의 y 좌표
        mPosX = props.width / 2.1;                  // 가운데 circle의 x 좌표
        mPosY = props.height / 2;                   // 가운데 circle의 y 좌표

        PBarLen = mPosX - lPosX;                    // 각 원을 연결하는 차트가 들어가는 다리의 길이
        lPBarX = lPosX;                             // 왼쪽 다리의 x 좌표
        lPBarY = lPosY - PROP.PGBAR_HEIGHT / 2;     // 왼쪽 다리의 y 좌표
        rPBarX = mPosX;                             // 오른쪽 다리의 x 좌표
        rPBarY = mPosY - PROP.PGBAR_HEIGHT / 2;     // 오른쪽 다리의 y 좌표

        rPosX = mPosX + PBarLen;                    // 오른쪽 circle의 x 좌표
        rPosY = props.height / 2;                   // 오른쪽 circle의 y 좌표

        leftSubTimer  = null;                       // 왼쪽 circle에 대한 timer
        rightSubTimer = null;                       // 오른쪽 circle에 대한 timer
        mainTimer     = null;                       // 가운데 circle에 대한 timer

        taskInfos  = {};                            // 가운데 circle에서 각 업무명, 업무에 대응하는 색깔 원의 위치 값에 대한 라디안, 반지름 값을 저장하는 객체
        cirRadians = [3.28,   1.721,   3.175,   1.828,   3.075,   1.925,    2.997,   2.0075,   2.914,   2.085,   2.819,   2.176,  2.715,   2.278];                         // 가운데 원의 조그만 색깔 원들을 그리기 위해 필요한 라디안 값
        cirRadius  = [89.5,    89.5,    89.5,      91,    90.5,    90.5,     90.5,       91,    91.2,    91.5,      91,   91.8,    91.5,   92];                            // 가운데 원의 조그만 색깔 원들을 그리기 위해 필요한 반지름 값
        radians    = [10 / 16, 14.4 / 16, 9.2 / 16, 15.1 / 16, 8.5 / 16, 15.63 / 16, 7.8 / 16, 0.15 / 16, 7.1 / 16, 0.65 / 16, 6.3 / 16, 1.44 / 16, 5.6 / 16, 2.1 / 16];   // 가운데 원의 업무명 을 그리기 위해 필요한 라디안 값
        radius     = [113, 145, 115, 155, 115, 155, 115, 145, 117, 158, 124, 140, 128, 140];                                                                               // 가운데 원의 업무명 을 그리기 위해 필요한 반지름 값

        for (ix = 0, ixLen = props.tasks.length; ix < ixLen; ix++) {
            taskInfos[props.tasks[ix]] = {
                cirRadians : cirRadians[ix],
                cirRadius  : cirRadius[ix],
                radians    : radians[ix],
                radius     : radius[ix]
            };
        }

        // Chart - 다리에 들어갈 차트에 필요한 변수
        chartDataLeft  = [];                                                                               // 왼쪽 다리에 들어갈 차트에 넣어줄 데이터 배열
        chartDataRight = [];                                                                               // 오른쪽 다리에 들어갈 차트에 넣어줄 데이터 배열

        cvsChartWidth  = (mPosX - PROP.BG_PCHART_RADIAN_MAIN) - (lPosX + PROP.BG_PCHART_RADIAN_SUB);       // 다리에 들어갈 차트를 담는 캔버스의 너비
        cvsChartHeight = PROP.BG_PGBAR_HEIGHT;                                                             // 다리에 들어갈 차트를 담는 캔버스의 높이
        chartTop       = cvsChartHeight * 0.2;                                                             // 차트의 실제 top 위치
        chartBot       = cvsChartHeight * 0.8;                                                             // 차트의 실제 bot 위치
        leftChartX     = lPosX + PROP.BG_PCHART_RADIAN_SUB;                                                // 왼쪽 다리에 들어갈 차트의 x 좌표
        leftChartY     = (lPosY + 4 - PROP.BG_PGBAR_HEIGHT / 2);                                           // 왼쪽 다리에 들어갈 차트의 y 좌표
        rightChartX    = mPosX + PROP.BG_PCHART_RADIAN_MAIN;                                               // 오른쪽 다리에 들어갈 차트의 x 좌표
        rightChartY    = leftChartY;                                                                       // 오른쪽 다리에 들어갈 차트의 y 좌표

        tick   = 10;                   // 차트의 xaxis 개수
        deltaX = 0;                    // 차트에서 각 x 값들 사이의 거리 계산을 위한 변수

        // Dial - TPS 다이얼 애니메이션을 표현하기 위해 필요한 변수
        lastMainTPSMax    = 220000;                             // 가운데 circle에 해당하는 전날 TPS 최대 값
        lastLSubTPSMax    = 1500;                               // 왼쪽 circle에 해당하는 전날 TPS 최대 값
        lastRSubTPSMax    = 4000;                              // 오른쪽 circle에 해당하는 전날 TPS 최대 값

        mainDialTick  = 60;                                     // 가운데 circle의 다이얼의 tick 개수
        mainTickWidth = 12;                                     // 가운데 circle의 다이얼의 개당 크기
        mainTPSTick   = lastMainTPSMax / mainDialTick;          // 전날 TPS 최대값 대비 다이얼 tick 개수의 비율로, 한 tick 당 얼만큼의 값을 담고 있어야하는지를 계산하는 변수

        subDialTick   = 45;                                     // 왼쪽, 오른쪽 circle의 다이얼의 tick 개수
        subTickWidth  = 9;                                      // 왼쪽, 오른쪽 circle의 다이얼의 개당 크기
        lSubTPSTick   = lastLSubTPSMax / subDialTick;           // 전날 TPS 최대값 대비 다이얼 tick 개수의 비율로, 한 tick 당 얼만큼의 값을 담고 있어야하는지를 계산하는 변수
        rSubTPSTick   = lastRSubTPSMax / subDialTick;           // 전날 TPS 최대값 대비 다이얼 tick 개수의 비율로, 한 tick 당 얼만큼의 값을 담고 있어야하는지를 계산하는 변수
        time          = 0.01;                                   // 다이얼의 증감을 표현하는 애니메이션이 몇 초안에 완료가 되어야하는지를 나타내는 변수
        startAlpha    = 0.98;                                   // 처음   tick의 투명도 값.   0 미만이거나 1 초과일 수 없다
        endAlpha      = 1;                                      // 마지막 tick의 투명도 값. 0 미만이거나 1 초과일 수 없고 startAlpha보다 같거나 큰 값이어야 한다

        firstInit     = true;                                   // 화면 로드 후 최초로 데이터를 받아온 것인지 체크하는 변수

        subOuterRadius  = PROP.BG_PCHART_RADIAN_SUB - 5;        // 왼쪽, 오른쪽 circle에 들어가는 TPS 다이얼 tick에 대해서, 원의 중심을 기준으로 tick의 가장 바깥 부분까지의 거리
        subInnerRadius  = subOuterRadius - 10;                  // 왼쪽, 오른쪽 circle에 들어가는 TPS 다이얼 tick에 대해서, 원의 중심을 기준으로 tick의 가장 안쪽 부분까지의 거리
        mainOuterRadius = PROP.BG_PCHART_RADIAN_MAIN - 5;       // 가운데 circle에 들어가는 TPS 다이얼 tick에 대해서, 원의 중심을 기준으로 tick의 가장 바깥 부분까지의 거리
        mainInnerRadius = mainOuterRadius - 10;                 // 가운데 circle에 들어가는 TPS 다이얼 tick에 대해서, 원의 중심을 기준으로 tick의 가장 안쪽 부분까지의 거리

        lDialTimer = [null];                                    // 왼쪽 circle의 다이얼 애니메이션에 대한 timer
        mDialTimer = [null];                                    // 가운데 circle의 다이얼 애니메이션에 대한 timer
        rDialTimer = [null];                                    // 오른쪽 circle의 다이얼 애니메이션에 대한 timer

        // --------------------- 다이얼 애니메이션을 그리기 위해서 최종적으로 가지고 다녀야할 변수들 -------------------
        dialParams = {                                                       // 왼쪽, 가운데, 오른쪽 circle에 대해서 변수들을 갖고 있다.
            lSub : {
                draw: {},                                                    // draw는 최초에 다이얼 tick을 그릴 때 사용
                animation: {}                                                // animatino은 다이얼 애니메이션을 표현할 때 사용
            },
            main : {
                draw: {},
                animation: {}
            },
            rSub : {
                draw: {},
                animation: {}
            }
        };

        posXList       = [lPosX, mPosX, rPosX];                              //
        posYList       = [lPosY, mPosY, rPosY];
        tickList       = [subTickWidth, mainTickWidth, subTickWidth];
        dialTickList   = [subDialTick, mainDialTick, subDialTick];
        outerRadList   = [subOuterRadius, mainOuterRadius, subOuterRadius];
        innerRadList   = [subInnerRadius, mainInnerRadius, subInnerRadius];
        TPSPrevious    = [0, 0, 0];
        TPSCurrent     = [0, 0, 0];
        TPSTickList    = [lSubTPSTick, mainTPSTick, rSubTPSTick];
        timerList      = [lDialTimer, mDialTimer, rDialTimer];
        lastMaxTPSList = [lastLSubTPSMax, lastMainTPSMax, lastRSubTPSMax];
        alarmColorList = ["red", "orange", "#41a5f6"];

        // Alarm
        spinningCnt  = 4;
        spinningRate = 1.5;
        spinningGap  = 0.47;
    };

    /**
     * dialParams의 각 프로퍼티 값을 새롭게 재정의 하는 메소드.
     * 일정 주기(3초)마다 데이터가 들어오면 그 데이터에 맞게 dialParams에 대한 프로퍼티 값을 수정해준다.
     * 게이지의 위치에 대한 라디안 값을 계산하기 위해 필요한 rate 값을 계산하는 구간이기도 하다. 화면이 처음 로드가 되었다면(firstInit === true) 시작 위치는 무조건 12시방향으로,
     * 두 번째 데이터 로드때부터는 직전 rate 를 이어받는다.
     *
     * MAX값보다 더 큰 값이 들어와 게이지가 100%를 넘어가게 될 경우, 실제로는 100%까지만 채우는 방식을 택한다. 이 때 rate의 최대값은 100%이다.
     * TPSCurrent가 비교 대상인 직전 최대값(lastMAX)보다 크다면, TPSCurrent는 lastMAX로 값을 덮어씌운다.
     * 다이얼 애니메이션의 로직이 TPSCurrent의 값과 TPSPrevious의 값을 비교하면서 계속해서 채워나갈지 말지 결정하기때문에 TPSCurrent의 최대값은 lastMAX로 되야한다.
     */
    DomainChart.prototype.initDialParams = function() {
        var ix, jx, rate, TPSCur, TPSPrev;

        jx = 0;
        for (ix in dialParams) {

            if (firstInit) {
                rate    = 1.5;
                TPSCur  = TPSCurrent[jx];
                TPSPrev = TPSPrevious[jx];

            } else {
                if (TPSPrevious[jx] > dialParams[ix].animation.lastMAXTPS) {
                    rate    = 3.5;
                    TPSPrev = dialParams[ix].animation.lastMAXTPS;

                } else {
                    rate    = dialParams[ix].animation.rate;
                    TPSPrev = TPSPrevious[jx];

                }

                if (TPSCurrent[jx] > dialParams[ix].animation.lastMAXTPS) {
                    TPSCur = dialParams[ix].animation.lastMAXTPS;

                } else {
                    TPSCur = TPSCurrent[jx];

               }

            }

            // if (firstInit) {
            //     TPSCur  = TPSPrev;
            //     TPSPrev = 0;
            // } else {
            //     if (TPSCur >= dialParams[ix].animation.lastMAXTPS) {
            //         TPSCurrent[jx] = TPSCur = dialParams[ix].animation.lastMAXTPS;
            //         rate = 3.5 - 2 / dialTickList[jx];
            //
            //     } else if (TPSCur >= TPSPrev) {
            //
            //
            //     } else {
            //
            //     }
            //
            //     if (TPSPrev >= dialParams[ix].animation.lastMAXTPS) {
            //         TPSPrevious[jx] = TPSPrev = dialParams[ix].animation.lastMAXTPS;
            //
            //     } else if (TPSCur >= TPSPrev) {
            //
            //
            //     } else {
            //
            //     }
            // }

            dialParams[ix].draw = {
                ctx         : ctxDial,
                x           : posXList[jx],
                y           : posYList[jx],
                outerRadius : outerRadList[jx],
                innerRadius : innerRadList[jx],
                tickWidth   : tickList[jx],
                dialTick    : dialTickList[jx],
                lastMAXTPS  : lastMaxTPSList[jx]
            };

            dialParams[ix].animation = {
                ctx         : ctxDial,
                x           : posXList[jx],
                y           : posYList[jx],
                outerRadius : outerRadList[jx],
                innerRadius : innerRadList[jx],
                tickWidth   : tickList[jx],
                rate        : rate,
                color       : alarmColorList[jx],
                alpha       : startAlpha,
                timer       : timerList[jx],
                dialTick    : dialTickList[jx],
                TPSCur      : TPSCur,
                TPSPrev     : TPSPrev,
                TPSTick     : TPSTickList[jx],
                lastMAXTPS  : lastMaxTPSList[jx]
            };
            jx++;
        }
    };

    /**
     * 원 가장 바깥에서 빙글빙글 도는 애니메이션 구현 부분. CPU Pie Chart에 있는 효과와 동일하다.
     */
    DomainChart.prototype.alarmAnimation = function() {
        var ix, ixLen;

        ctxEffect.clearRect(0, 0, canvasEffect.width, canvasEffect.height);
        ctxEffect.save();
        ctxEffect.strokeStyle = common.Util.getRGBA(common.Util.COLOR.BLACK, 0.55);
        ctxEffect.lineWidth = 14;

        // Left Circle
        for (ix = 0, ixLen = spinningCnt; ix < ixLen; ix++) {
            ctxEffect.beginPath();
            ctxEffect.arc(lPosX, lPosY, PROP.BG_PCHART_RADIAN_SUB + 10, Math.PI * (spinningRate + 0.5 * ix), Math.PI * (spinningRate + 0.5 * ix + spinningGap));
            ctxEffect.stroke();
            ctxEffect.closePath();
        }

        // Main Circle
        for (ix = 0, ixLen = spinningCnt; ix < ixLen; ix++) {
            ctxEffect.beginPath();
            ctxEffect.arc(mPosX, mPosY, PROP.BG_PCHART_RADIAN_MAIN + 10, Math.PI * (spinningRate + 0.5 * ix), Math.PI * (spinningRate + 0.5 * ix + spinningGap));
            ctxEffect.stroke();
            ctxEffect.closePath();
        }

        // Right Circle
        for (ix = 0, ixLen = spinningCnt; ix < ixLen; ix++) {
            ctxEffect.beginPath();
            ctxEffect.arc(rPosX, rPosY, PROP.BG_PCHART_RADIAN_SUB + 10, Math.PI * (spinningRate + 0.5 * ix), Math.PI * (spinningRate + 0.5 * ix + spinningGap));
            ctxEffect.stroke();
            ctxEffect.closePath();
        }

        ctxEffect.restore();

        spinningRate += 0.005;

        cancelAnimationFrame(spinningTimer);
        spinningTimer = requestAnimationFrame(this.alarmAnimation.bind(this));
    };

    DomainChart.prototype.clearAllCanvas = function() {
        width  = this.getWidth();
        height = this.getHeight();

        ctxData.beginPath();
        ctxData.clearRect(0, 0, width, height);

        ctxChartLeft.beginPath();
        ctxChartLeft.clearRect(0, 0, width, height);

        ctxChartRight.beginPath();
        ctxChartRight.clearRect(0, 0, width, height);
    };

    /**
     * 파라미터로 넘긴 캔버스들의 영역을 초기화하는 메소드
     */
    DomainChart.prototype.clearCanvas = function(ctx) {
        var width, height;

        width  = this.getWidth();
        height = this.getHeight();

        if (Array.isArray(ctx)) {
            var ix, ixLen;

            for (ix = 0, ixLen = ctx.length; ix < ixLen; ix++) {
                ctx[ix].clearRect(0, 0, width, height);
            }
        } else {
            ctx.clearRect(0, 0, width, height);
        }
    };

    DomainChart.prototype.draw = function() {
        this.clearAllCanvas();
        this.drawManager();
    };

    DomainChart.prototype.drawManager = function() {
        this.drawBackground();
        this.drawContents();
    };

    DomainChart.prototype.drawBackground = function() {
        ctxBG.save();
        ctxBG.fillStyle = common.Util.getColor("background");

        this.drawBGCircle();
        this.drawBGPBar();
        this.drawBGChart();
        ctxBG.restore();
    };

    /**
     * @param params   - dialParam 객체
     * @param startVal - 시작 값
     * @param endVal   - 도착지점 값
     * @param idx      - circle 인덱스. (0: 왼쪽, 1: 가운데, 2: 오른쪽 circle)
     *
     * TPSCurrent 값이 TPSPrevious 보다 작을 때 Tick을 채워주는 메소드. startVal,
     */
    DomainChart.prototype.dialAnimation = function(params, startVal, endVal, idx) {

        if (startVal >= endVal) {
            TPSCurrent[idx] = params.TPSCur = startVal;
            // clearTimeout(params.timer[0]);
            cancelAnimationFrame(params.timer[0]);
            return;
        }

        params.ctx.save();
        params.ctx.globalAlpha = params.alpha;
        params.ctx.lineWidth   = params.tickWidth;

        params.ctx.strokeStyle = common.Util.COLOR.TPS_DIAL;

        params.ctx.save();
        params.ctx.beginPath();
        params.ctx.moveTo(common.Util.getPosXOnCircle(params.x, params.rate, params.outerRadius), common.Util.getPosYOnCircle(lPosY, params.rate, params.outerRadius));
        params.ctx.lineTo(common.Util.getPosXOnCircle(params.x, params.rate, params.innerRadius), common.Util.getPosYOnCircle(lPosY, params.rate, params.innerRadius));
        params.ctx.stroke();
        params.ctx.closePath();
        params.ctx.restore();

        startVal       += params.TPSTick;
        params.alpha   += (endAlpha - startAlpha) / params.dialTick;
        params.rate    += 2 / params.dialTick;

        // if (endVal > startVal) {
        //     cancelAnimationFrame(params.timer[0]);
        //     clearTimeout(params.timer[0]);
        //     // params.timer[0] = setTimeout(this.dialAnimation.bind(this, params, startVal, endVal, idx), time * 1000 / params.dialTick);
        //     params.timer[0] = setTimeout(requestAnimationFrame(this.dialAnimation.bind(this, params, startVal, endVal, idx)), time * 1000 / params.dialTick);
        // } else {
        //     TPSCurrent[idx] = params.TPSCur = startVal;
        //     clearTimeout(params.timer[0]);
        // }

        cancelAnimationFrame(params.timer[0]);
        clearTimeout(params.timer[0]);
        // params.timer[0] = setTimeout(requestAnimationFrame(this.dialAnimation.bind(this, params, startVal, endVal, idx)), time * 1000 / params.dialTick);
        params.timer[0] = requestAnimationFrame(this.dialAnimation.bind(this, params, startVal, endVal, idx));


        params.ctx.restore();
    };

    DomainChart.prototype.dialRevAnimation = function(params, startVal, endVal, idx) {
        var outerX, outerY, innerX, innerY;

        if (startVal <= endVal) {
            TPSCurrent[idx] = params.TPSCur = startVal;
            // clearTimeout(params.timer[0]);
            cancelAnimationFrame(params.timer[0]);
            return;
        }

        params.ctx.save();

        // Canvas의 테두리에 다른 색의 흔적이 남는 데 이 걸 없애기 위해 BACKGROUND로 한 번 덮고 다시 그린다.
        outerX = common.Util.getPosXOnCircle(params.x, params.rate, params.outerRadius);
        outerY = common.Util.getPosYOnCircle(lPosY, params.rate, params.outerRadius + 0.75);
        innerX = common.Util.getPosXOnCircle(params.x, params.rate, params.innerRadius);
        innerY = common.Util.getPosYOnCircle(lPosY, params.rate, params.innerRadius - 0.75);

        params.ctx.lineWidth   = params.tickWidth + 5;
        params.ctx.strokeStyle = common.Util.COLOR.BACKGROUND;
        params.ctx.save();
        params.ctx.beginPath();
        params.ctx.moveTo(outerX, outerY);
        params.ctx.lineTo(innerX, innerY);
        params.ctx.stroke();
        params.ctx.closePath();
        params.ctx.restore();

        innerX = common.Util.getPosXOnCircle(params.x, params.rate, params.innerRadius);
        innerY = common.Util.getPosYOnCircle(lPosY, params.rate, params.innerRadius);

        params.ctx.lineWidth   = params.tickWidth;
        params.ctx.strokeStyle = common.Util.getRGBA("#304152", 1);
        params.ctx.save();
        params.ctx.beginPath();
        params.ctx.moveTo(outerX, outerY);
        params.ctx.lineTo(innerX, innerY);
        params.ctx.stroke();
        params.ctx.closePath();
        params.ctx.restore();

        startVal       -= params.TPSTick;
        params.rate    -= 2 / params.dialTick;
        params.alpha   -= (endAlpha - startAlpha) / params.dialTick;

        // if (startVal > endVal) {
        //     cancelAnimationFrame(params.timer[0]);
        //     clearTimeout(params.timer[0]);
        //     // params.timer[0] = setTimeout(this.dialRevAnimation.bind(this, params, startVal, endVal, idx), time * 1000 / params.dialTick);
        //     params.timer[0] = setTimeout(requestAnimationFrame(this.dialRevAnimation.bind(this, params, startVal, endVal, idx)), time * 1000 / params.dialTick);
        // } else {
        //     TPSCurrent[idx] = params.TPSCur = startVal;
        //     clearTimeout(params.timer[0]);
        // }

        cancelAnimationFrame(params.timer[0]);
        clearTimeout(params.timer[0]);
        // params.timer[0] = setTimeout(requestAnimationFrame(this.dialRevAnimation.bind(this, params, startVal, endVal, idx)), time * 1000 / params.dialTick);
        params.timer[0] = requestAnimationFrame(this.dialRevAnimation.bind(this, params, startVal, endVal, idx));


        params.ctx.restore();
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

    DomainChart.prototype.drawContents = function() {
        var ix, lX, lY, mX, mY, rX, rY;

        lX = lPosX - PROP.BG_PCHART_RADIAN_SUB + 10;
        lY = lPosY - PROP.BG_PCHART_RADIAN_SUB + 8;
        mX = mPosX - PROP.BG_PCHART_RADIAN_MAIN + 10;
        mY = mPosY - PROP.BG_PCHART_RADIAN_MAIN + 5 + 8;
        rX = rPosX - PROP.BG_PCHART_RADIAN_SUB + 10;
        rY = rPosY - PROP.BG_PCHART_RADIAN_SUB + 8;

        // Draw Images
        this.drawSubCircle(lX, lY, lPosX, lPosY, subImg, leftSubTimer);
        this.drawMainCircle(mX, mY, mPosX, mPosY, mainImg, mainTimer);
        this.drawSubCircle(rX, rY, rPosX, rPosY, subImg, rightSubTimer);

        // Tasks Label & Task Circles
        //TODO - 임시로 해놓은 것. setInterval 없앨 것
        this.drawMainTaskLabel(mPosX, mPosY);
        setInterval(this.drawMainTaskLabel.bind(this, mPosX, mPosY), 3000);

        // Draw Dial & Max Gauge of TPS
        for (ix in dialParams) {
            this.drawDial(dialParams[ix].draw);
            this.drawMaxTPS(dialParams[ix].draw);
        }

        // Draw Alarm Sign
        this.drawTaskCircle();
        setInterval(this.drawTaskCircle.bind(this), 3000);
    };

    DomainChart.prototype.drawDial = function(params) {
        var ix, ixLen, rate, sx, sy, ex, ey;

        params.ctx.save();
        params.ctx.strokeStyle = common.Util.getRGBA("#41a5f6", 0.5);
        params.ctx.globalAlpha = 0.3;
        params.ctx.lineWidth   = params.tickWidth;

        for (ix = params.dialTick * 1.5, ixLen = params.dialTick * 3.5; ix < ixLen; ix += 2) {
            rate = ix / params.dialTick;

            sx   = common.Util.getPosXOnCircle(params.x, rate, params.outerRadius);
            sy   = common.Util.getPosYOnCircle(params.y, rate, params.outerRadius);
            ex   = common.Util.getPosXOnCircle(params.x, rate, params.innerRadius);
            ey   = common.Util.getPosYOnCircle(params.y, rate, params.innerRadius);

            // 테두리
            // params.ctx.save();
            // params.ctx.lineWidth = params.tickWidth;
            // params.ctx.strokeStyle = common.Util.getRGBA("#41a5f6", 0.5);
            // params.ctx.beginPath();
            // params.ctx.moveTo(sx, sy);
            // params.ctx.lineTo(ex, ey);
            // params.ctx.stroke();
            // params.ctx.closePath();
            // params.ctx.restore();

            params.ctx.beginPath();
            params.ctx.moveTo(sx, sy);
            params.ctx.lineTo(ex, ey);
            params.ctx.stroke();
            params.ctx.closePath();
        }
        params.ctx.restore();
    };

    DomainChart.prototype.drawMainCircle = function (x, y, cx, cy, img, timer) {
        if (!mainImgLoaded) {
            if (timer) {
                clearTimeout(timer);
            }

            timer = setTimeout(this.drawMainCircle.bind(this, x, y, cx, cy, img, timer), 10);
            return;
        }

        ctxBG.drawImage(
            img, 0, 0, imgPt.mainCircle.x, imgPt.mainCircle.y,
            x, y, imgPt.mainCircle.x, imgPt.mainCircle.y
        );

        // Dial Ticks
        // this.drawDial(ctxDial, cx, cy, mainOuterRadius, mainInnerRadius, mainTickWidth, mainDialTick);

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
        var posX, posY, key, text, cx, cy;

        //TODO ------------- 삭제 --------------
        ctxTask.clearRect(0, 0, 1000, 1000);
        //TODO ------------- 삭제 --------------

        ctxTask.fillStyle = common.Util.getColor("LABEL");
        ctxTask.font = "700 " + common.Util.getFontSize(10.5);

        // Label
        ctxTask.save();
        for (key in taskInfos) {
            text = key;

            ctxTask.beginPath();
            ctxTask.fillText(
                text,
                common.Util.getPosXOnCircle(x, taskInfos[key].radians * 2, taskInfos[key].radius) - common.Util.getTextWidth(text, ctxTask),
                common.Util.getPosYOnCircle(y, taskInfos[key].radians * 2, taskInfos[key].radius)
            );
            ctxTask.closePath();
        }
        ctxTask.restore();

        // Circle
        //TODO - color 임시로 해놓았음. 수정할 것
        //TODO ------------- 삭제 --------------
        var color = ["red", common.Util.TPS_DIAL || "#41A5F6", "orange"];
        ctxAlarm.clearRect(0, 0, 1000, 1000);
        //TODO ------------- 삭제 --------------

        cx = ctxAlarm.canvas.width / 2;
        cy = ctxAlarm.canvas.height / 2;

        ctxAlarm.save();
        for (key in taskInfos) {
            text = key;
            posX = common.Util.getPosXOnCircle(cx, taskInfos[key].cirRadians, taskInfos[key].cirRadius);
            posY = common.Util.getPosYOnCircle(cy, taskInfos[key].cirRadians, taskInfos[key].cirRadius);

            ctxAlarm.beginPath();
            ctxAlarm.fillStyle = color[Math.floor(Math.random() * 3)];
            ctxAlarm.arc(posX, posY, 5, 0, Math.PI * 2);
            ctxAlarm.fill();
            ctxAlarm.closePath();
        }
        ctxAlarm.restore();
    };

    DomainChart.prototype.drawMaxTPS = function(params) {
        var posX, posY, newPosX, newPosY, textA, textB;

        posX = common.Util.getPosXOnCircle(params.x, 1.5, params.outerRadius + 5);
        posY = common.Util.getPosYOnCircle(params.y, 1.5, params.outerRadius + 5);

        params.ctx.save();
        params.ctx.lineWidth = 2;
        params.ctx.strokeStyle = common.Util.COLOR.LABEL;
        params.ctx.fillStyle = common.Util.COLOR.LABEL;
        params.ctx.font = common.Util.getFontSize(13);

        params.ctx.beginPath();
        params.ctx.moveTo(posX, posY);
        params.ctx.lineTo(posX, posY - 10);
        params.ctx.stroke();
        params.ctx.closePath();

        params.ctx.lineJoin = "round";
        newPosX = common.Util.getPosXOnCircle(posX, 1.1, 20);
        newPosY = common.Util.getPosYOnCircle(posY - 10, 1.1, 20);
        params.ctx.beginPath();
        params.ctx.moveTo(posX, posY - 10);
        params.ctx.lineTo(newPosX, newPosY);
        params.ctx.stroke();
        params.ctx.closePath();

        params.ctx.save();
        params.ctx.fillStyle = common.Util.COLOR.LABEL;
        params.ctx.strokeStyle = common.Util.COLOR.SERVER_NORMAL_DARK;
        params.ctx.lineWidth = 3;
        params.ctx.beginPath();
        params.ctx.arc(newPosX, newPosY, 5, 0, Math.PI * 2);
        params.ctx.fill();
        params.ctx.stroke();
        params.ctx.closePath();
        params.ctx.restore();

        textA = "Max ";
        textB = common.Util.getCommaFormat(params.lastMAXTPS);
        params.ctx.fillText(textA, newPosX - common.Util.getTextWidth(textA + textB, params.ctx) - 30, newPosY + 3.5);

        params.ctx.font = common.Util.getFontSize(17);
        params.ctx.fillText(textB, newPosX - common.Util.getTextWidth(textB, params.ctx) - 15, newPosY + 5);
        params.ctx.restore();
    };

    DomainChart.prototype.drawSubCircle = function (x, y, cx, cy, img, timer) {
        if (!subImgLoaded) {
            if (timer) {
                clearTimeout(timer);
            }

            timer = setTimeout(this.drawSubCircle.bind(this, x, y, cx, cy, img, timer), 10);
            return;
        }

        ctxBG.drawImage(
            img, 0, 0, imgPt.subCircle.x, imgPt.subCircle.y,
            x, y, imgPt.subCircle.x, imgPt.subCircle.y
        );

        // Dial Ticks
        // this.drawDial(ctxDial, cx, cy, subOuterRadius, subInnerRadius, subTickWidth, subDialTick);

        if (timer) {
            clearTimeout(timer);
        }
    };

    DomainChart.prototype.drawSubData = function(x, y, data) {
        var text;

        ctxData.save();
        ctxData.fillStyle = common.Util.getColor("LABEL");
        ctxData.align = "center";

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

    DomainChart.prototype.drawTaskCircle = function() {
        var cx, cy, color, randIdx, text;

        cx = ctxAlarm.canvas.width / 2;
        cy = ctxAlarm.canvas.height / 2;

        ctxAlarm.clearRect(95, 270, 190, 90);

        // Draw sign area
        ctxAlarm.save();
        //TODO - 임시로 해놓음.수정할것
        color = [common.Util.COLOR.SERVER_CRITICAL_DARK, common.Util.COLOR.SERVER_WARNING_DARK, common.Util.COLOR.SERVER_NORMAL_DARK];
        text  = ["CRITICAL", "WARNING", "NORMAL"];
        randIdx = Math.floor(Math.random() * 3);

        ctxAlarm.strokeStyle = common.Util.getRGBA(color[randIdx], 0.8);
        ctxAlarm.lineWidth = 65;
        ctxAlarm.beginPath();
        ctxAlarm.arc(cx, cy + 3, PROP.MAIN_CIRCLE_FLOOR - 50, Math.PI * 2.338, Math.PI * 2.655);
        ctxAlarm.stroke();
        ctxAlarm.closePath();

        color = [common.Util.COLOR.SERVER_CRITICAL, common.Util.COLOR.SERVER_WARNING, common.Util.COLOR.SERVER_NORMAL];
        ctxAlarm.strokeStyle = common.Util.getRGBA(color[randIdx], 0.8);
        ctxAlarm.lineWidth = 50;
        ctxAlarm.beginPath();
        ctxAlarm.arc(cx, cy + 3, PROP.MAIN_CIRCLE_FLOOR - 50, Math.PI * 2.338, Math.PI * 2.655);
        ctxAlarm.stroke();
        ctxAlarm.closePath();

        // Draw text
        if (text[randIdx] === "WARNING") {
            ctxAlarm.font = common.Util.getFontSize(25);
        } else {
            ctxAlarm.font = common.Util.getFontSize(27);
        }
        ctxAlarm.align = "center";
        ctxAlarm.fillStyle = common.Util.getRGBA("#ffffff", 0.75);
        ctxAlarm.fillText(text[randIdx], 132, 327);

        ctxAlarm.restore();
    };

    /**
     * data를 주기적으로 받아서 데이터 초기화를 하는 메소드
     * TPSPrevious와 TPSCurrent. 2가지 지표를 가지고 다이얼 애니메이션을 조절한다.
     * 화면이 처음 로드되었을 때(firstInit === true)는 TPSPrevious에만 값을 담아놓는다. 이 때 TPSCurrnt는 0으로 초기화 값이 유지가 되는 상태
     * 두 번째 데이터 로드(firstInit === false)때 부터 TPSPrevious에 TPSCurrent를 옮겨 담고, TPSCurrent에 새로운 데이터 값을 넣는다.
     * 다이얼 애니메이션은 기본적으로 TPSCurrent의 값이 TPSPrevious의 값보다 크면 더 큰 값이 들어왔으므로 게이지를 채우고, 작으면 더 작은 값이 들어왔으므로 게이지를 줄이는 방식이다.
     */
    DomainChart.prototype.drawPacketData = function(data) {
        this.clearCanvas([ctxData, ctxChartLeft, ctxChartRight]);

        if (firstInit) {
            TPSPrevious = [data.sub1.tps, data.main.tps, data.sub2.tps];

        } else {
            TPSPrevious = TPSCurrent.slice();
            TPSCurrent  = [data.sub1.tps, data.main.tps, data.sub2.tps];

        }

        // Data - TPS, Elapse, Error Count
        this.drawSubData(lPosX, lPosY, data.sub1);
        this.drawMainData(mPosX, mPosY, data.main);
        this.drawSubData(rPosX, rPosY, data.sub2);

        // Draw Chart
        this.drawTPSChart(ctxChartLeft, data.sub1.tps, chartDataLeft);
        this.drawTPSChart(ctxChartRight, data.main.tps, chartDataRight);
    };

    DomainChart.prototype.startAnimation = function() {
        var ix, idx, timer, params;

        clearTimeout(lDialTimer[0]);
        clearTimeout(mDialTimer[0]);
        clearTimeout(rDialTimer[0]);

        // ctxDial.clearRect(0, 0, this.getWidth(), this.getHeight());

        // for (ix in dialParams) {
        //     this.drawDial(dialParams[ix].draw);
        // }

        // init params
        this.initDialParams();

        idx = 0;
        for (ix in dialParams) {
            timer = dialParams[ix].animation.timer;
            params = dialParams[ix].animation;

                if (firstInit) {
                    // timer[0] = setTimeout(this.dialAnimation.bind(this, params, params.TPSCur, params.TPSPrev, idx), 0);
                    timer[0] = requestAnimationFrame(this.dialAnimation.bind(this, params, params.TPSCur, params.TPSPrev, idx));
                } else {
                    if (params.TPSPrev > params.TPSCur) {
                        // timer[0] = setTimeout(this.dialRevAnimation.bind(this, params, params.TPSPrev, params.TPSCur, idx), 0);
                        timer[0] = requestAnimationFrame(this.dialRevAnimation.bind(this, params, params.TPSPrev, params.TPSCur, idx));
                    } else if (params.TPSCur > params.TPSPrev) {
                        // timer[0] = setTimeout(this.dialAnimation.bind(this, params, params.TPSPrev, params.TPSCur, idx), 0);
                        timer[0] = requestAnimationFrame(this.dialAnimation.bind(this, params, params.TPSPrev, params.TPSCur, idx));
                    }
                }

            idx++;
        }

        firstInit = false;

    };

    return DomainChart;
})();
