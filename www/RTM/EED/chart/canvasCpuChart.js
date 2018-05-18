var canvasCpuChart = (function () {
    function canvasCpuChart(_id, _fps, _currentRatio, _alarmLevel, _width, _height, _radius, _textYPos, _oldValue, _color) {
        this.id = _id;
        this.fps = _fps;
        this.currentRatio = _currentRatio;
        this.alarmLevel = _alarmLevel;
        this.width = _width;
        this.height = _height;
        this.radius = _radius;
        this.textYPos = _textYPos;
        this.oldValue = _oldValue;
        this.color = _color;
        this.backgroundColor = '#585c66';
        this.fontColor = common.Util.getColor('LABEL');
        // 돌아가는 테두리
        this.circleCnt = 4;
        this.angle = 0;
        //  돌아가는 방향 시계방향 = false , 시계반대방향 = true
        this.counterClockwise = false;
        // 시작 종료 지점
        this.startAngle = 1.30 * Math.PI + this.angle;
        this.endAngle = 1.75 * Math.PI + this.angle;
        this.title = '';

    }

    canvasCpuChart.prototype._gs = function () {
        var self = this;
        return {

            getTitle: function () {
                return self.title;
            },
            setTitle: function (_title) {
                self.title = _title;
                return self._gs();
            },

            getFps: function () {
                return self.fps;
            },
            setFps: function (_fps) {
                self.fps = _fps;
                return self._gs();
            },

            getFps: function () {
                return self.fps;
            },
            setFps: function (_fps) {
                self.fps = _fps;
                return self._gs();
            },

            getCurrentRatio: function () {
                return self.currentRatio;
            },
            setCurrentRatio: function (_CurrentRatio) {
                self.CurrentRatio = _CurrentRatio;
                return self._gs();
            },

            getAlarmLevel: function () {
                return self.alarmLevel;
            },
            setAlarmLevel: function (_alarmLevel) {
                self.alarmLevel = _alarmLevel;
                return self._gs();
            },

            getWidth: function () {
                return self.width;
            },
            setWidth: function (_width) {
                self.width = _width;
                return self._gs();
            },

            getHeight: function () {
                return self.height;
            },
            setHeight: function (_height) {
                self.height = _height;
                return self._gs();
            },

            getRadius: function () {
                return self.radius;
            },
            setFRadius: function (_radius) {
                self.radius = _radius;
                return self._gs();
            },

            getTextYPos: function () {
                return self.textYPos;
            },
            setTextYPost: function (_textYPos) {
                self.textYPos = _textYPos;
                return self._gs();
            },

            getOldValue: function () {
                return self.oldValue;
            },
            setOldValue: function (_oldValue) {
                self.oldValue = _oldValue;
                return self._gs();
            },
        }
    }

    canvasCpuChart.prototype.init = function () {

        // 정적 그림 그리기  캔버스 영역
        this.backgroundCanvasDraw();
        // 무한으로 빙글빙글 도는 캔버스
        this.infinityCircleTrun();
        // 데이타에 따른 동적 그림 그리기 캔버스 영역
        this.animationCanvasDraw();
    }
    canvasCpuChart.prototype.draw = function (_value) {

        var me = this;
        var value = _value;
        if (this.animationTimer || this.requestAniTimer) {
            clearTimeout(this.animationTimer);
            cancelAnimationFrame(this.requestAniTimer);
        }
        if (this.oldValue != value || this.alarmLevel != this.oldLevel) {
            // 30 - 70 = -40
            var nDiff = (this.oldValue - value);
            if (nDiff > -2 && nDiff < 2)
                this.fps = 1;
            else if (nDiff > -5 && nDiff < 5)
                this.fps = 4;
            else if (nDiff > -10 && nDiff < 10)
                this.fps = 6;
            else if (nDiff > -15 && nDiff < 15)
                this.fps = 8;
            else
                this.fps = 14;
        } else {
            return;
        }
        // 값이 들어오지 않으면 -1
        if (value === -1) {
            value = NaN;
            me.alarmLevel = 0;
            this.backgroundCanvasDraw(-1);
            this.animationCanvasDraw();
            this.infinityDraw('down');
        }
        var width = this.width,
            height = this.height,
            ratio = Math.max(Math.min(Math.floor(value), 100), 0),
            delta = (ratio - this.currentRatio) / this.fps,
            frame = 1;

        function animate() {
            if (document.visibilityState != 'visible')
                return;

            me.animationTimer = setTimeout(function () {
                if (frame <= me.fps)
                    me.requestAniTimer = requestAnimationFrame(animate);
            }, 500 / me.fps);

            //ratio = me.currentRatio + delta;
            ratio = me.currentRatio + delta;
            me.currentRatio = ratio;
            ratio = Math.max(Math.min(Math.floor(ratio), 100), 0);

            me.ctx.clearRect(0, 0, width, height);
            me.ctx.save();
            me.ctx.beginPath();
            me.ctx.lineWidth = 10;
            me.ctx.lineCap = 'round';
            me.ctx.shadowBlur = 12;
            if (isNaN(ratio)) {
                me.ctx.strokeStyle = me.color[0];
                me.ctx.shadowColor = me.color[0];
                me.ctx.font = '25px Helvetica';
                me.ctx.fillStyle = me.fontColor;
                me.ctx.fillText(ratio, width / 2 + 15 - me.ctx.measureText(ratio).width + 10  , me.textYPos + 15);
            } else {
                //정상처리
                me.ctx.strokeStyle = me.color[me.alarmLevel];
                me.ctx.shadowColor = me.color[me.alarmLevel];
                me.ctx.font = '25px Helvetica';
                me.ctx.fillStyle = me.fontColor;
                me.ctx.fillText(ratio, width / 2 + 15 - me.ctx.measureText(ratio).width , me.textYPos + 15);

            }



            //context.arc(x,y,r,sAngle,eAngle,counterclockwise);
            me.ctx.arc(width / 2, height / 2, me.radius, 0 - 90 * Math.PI / 180, ratio * 3.6 * Math.PI / 180 - 90 * Math.PI / 180, false);
            me.ctx.stroke();

            me.ctx.font = '25px Helvetica';
            me.ctx.fillStyle = me.fontColor;

            me.ctx.restore();
            frame++;
            //console.log('CANVAS ANIMATE DRAW RATIO ####---- ', ratio);
            me.oldValue = ratio;
            me.oldLevel = me.alarmLevel;
        }

        animate();
        //console.log('CANVAS DRAW RATIO ####---- ', ratio);

    }
    canvasCpuChart.prototype.infinityDraw = function (type) {

        var me = this;

        if (this.requestAniTimerTrun) {
            cancelAnimationFrame(this.requestAniTimerTrun);
        }

        //
        if (type === 'down') {
            // 서버가 죽었을 경우 회전하는걸 멈춘다.
            this.infinityCircleTrun();
            return;
        }

        var width = this.width,
            height = this.height;

        function infinityTrun() {
            if (document.visibilityState != 'visible')
                return;

            // me.Interval = setTimeout(function() {
            //   me.requestAniTimerTrun = requestAnimationFrame(infinityTrun);
            // } , 500);


            me.ctxTrun.clearRect(0, 0, width, height);
            for (let j = 0; j < me.circleCnt; j++) {
                // 제일 밖에 있는 원 무한 회전
                me.ctxTrun.strokeStyle = common.Util.getColor("BLACK", 0.8);
                me.ctxTrun.lineWidth = 5;
                me.ctxTrun.beginPath();
                // ctx.arc(x, y, radiusTwo, startAngle, endAngle, counterClockwise);
                me.ctxTrun.arc((me.width / 2), (me.height / 2), me.radius + 10, me.startAngle + me.angle, me.endAngle + me.angle, me.counterClockwise);
                me.ctxTrun.stroke();
                me.ctxTrun.closePath();
                me.startAngle += 0.5 * Math.PI;
                me.endAngle += 0.5 * Math.PI;
                me.angle += 0.005;
            }
            // console.log(`${me.angle} : angle : ${me.startAngle}  angle : ${me.endAngle}`);
            me.requestAniTimerTrun = requestAnimationFrame(infinityTrun);
        }

        infinityTrun();

    }
    canvasCpuChart.prototype.infinityCircleTrun = function () {
        var width = this.width,
            height = this.height,
            canvas = document.createElement('canvas');

        // 제일 초기 셋팅
        canvas.width = width + 5;
        canvas.height = height + 30;
        canvas.style.position = 'absolute';
        this.ctxTrun = canvas.getContext('2d');
        //var ctxBack = canvas.getContext('2d');
        this.ctxTrun.translate(0.5, 0.5);
        document.getElementById(this.id).appendChild(canvas);


        for (let j = 0; j < this.circleCnt; j++) {

            this.ctxTrun.save();
            this.ctxTrun.strokeStyle = '#262626';
            this.ctxTrun.lineWidth = 5;
            this.ctxTrun.beginPath();
            // ctx.arc(x, y, radiusTwo, startAngle, endAngle, counterClockwise);
            this.ctxTrun.arc((width / 2), (height / 2), this.radius + 10, this.startAngle, this.endAngle, this.counterClockwise);
            this.ctxTrun.stroke();
            this.ctxTrun.closePath();
            this.startAngle += 0.5 * Math.PI;
            this.endAngle += 0.5 * Math.PI;
            this.angle += 0.0005;
        }
    }
    canvasCpuChart.prototype.animationCanvasDraw = function () {
        var width = this.width,
            height = this.height,

            canvas = document.createElement('canvas');
        canvas.width = width + 5;
        canvas.height = height + 30;
        canvas.style.position = 'absolute';
        this.ctx = canvas.getContext('2d');
        this.ctx.translate(0.5, 0.5);
        document.getElementById(this.id).appendChild(canvas);
    }
    canvasCpuChart.prototype.backgroundCanvasDraw = function (type) {
        var width = this.width,
            height = this.height,
            canvas = document.createElement('canvas');


        // 제일 초기 셋팅
        canvas.width = width + 5;
        canvas.height = height + 30;
        canvas.style.position = 'absolute';
        this.backgroundCtx = canvas.getContext('2d');
        //var ctxBack = canvas.getContext('2d');
        var ctxBack = this.backgroundCtx;
        ctxBack.translate(0.5, 0.5);
        document.getElementById(this.id).appendChild(canvas);
        // 초기 캔버스 스타일 저장
        ctxBack.save();


        // 안쪽 원
        ctxBack.beginPath();
        ctxBack.strokeStyle = this.backgroundColor;
        ctxBack.arc((width / 2), (height / 2), this.radius - 5, Math.PI * 2, false);
        ctxBack.fillStyle = 'black';
        ctxBack.fill();
        ctxBack.closePath();
        ctxBack.restore();

        ctxBack.save();
        // 더 안쪽 원
        ctxBack.beginPath();
        ctxBack.strokeStyle = this.backgroundColor;
        // ctxBack.arc((width/2), (height/2), this.radius - 5, Math.PI*2, false);
        var gradient = ctxBack.createRadialGradient(width / 2, height / 2, this.radius - 3, width / 2, height / 2, 20);
        gradient.addColorStop(0, common.Util.getColor('BLACK', 0));
        gradient.addColorStop(1, common.Util.getRGBA('#4C4C4C', 1));
        ctxBack.fillStyle = gradient;
        ctxBack.fillRect(0, 0, width, height);
        ctxBack.closePath();
        ctxBack.restore();

        // 더더안쪽 원

        ctxBack.save();
        ctxBack.beginPath();
        ctxBack.strokeStyle = this.backgroundColor;
        ctxBack.arc((width / 2), (height / 2), this.radius - 23, Math.PI * 2, false);
        ctxBack.fillStyle = '#262626';
        ctxBack.fill();
        ctxBack.closePath();
        ctxBack.restore();


        ctxBack.save();
        // 애니메이션 효과가 들어가는 원 영역
        ctxBack.strokeStyle = this.backgroundColor;
        ctxBack.beginPath();
        ctxBack.lineWidth = 10;
        ctxBack.arc(width / 2, height / 2, this.radius, Math.PI * 2, false);
        ctxBack.stroke();
        ctxBack.restore();
        //
        //
        ctxBack.save();
        ctxBack.font = '12px Roboto Condensed';

        // 안쪽 박스
        ctxBack.save();
        ctxBack.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctxBack.fillRect(10, (height) - (this.radius + 35), width - 20, height / 4);
        ctxBack.restore();

        var titleWidth = ctxBack.measureText(this.title).width;
        ctxBack.fillStyle = this.fontColor;
        ctxBack.fillText(this.title, ((width / 2) - (titleWidth / 2)) - 3, height + 15);
        ctxBack.aling = 'center';
        ctxBack.font = '10px Helvetica';
        ctxBack.fillStyle = this.fontColor;
        if(type !== -1)
        ctxBack.fillText('%', width / 2 + 15, this.textYPos + 17);
    }
    return canvasCpuChart;
}());
