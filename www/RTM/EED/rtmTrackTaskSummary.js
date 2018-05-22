Ext.define('RTM.EED.rtmTrackTaskSummary', {
    // extend   : 'Exem.DockForm',
    extend   : 'Ext.container.Container',
    title    : common.Util.TR('Task Information'),
    layout   : 'fit',
    width    : '100%',
    // flex     : 1,
    // width    : 1920,
    height   : 50,
    minHeight: 50,
    maxHeight: 50,
    componentCls : 'rtmTrackTaskSummary',

    interval : 1000 ,

    listeners: {
        destroy  : function(_this){
            // _this.chart.cancelAnimation();

            if(_this.timer) {
                clearTimeout(_this.timer);
            }
        },
        resize: function(){
            if(! this.$target) {
                return;
            }

            var pOffSet = this.$target.offset();

            this.$direct.css({
                top: pOffSet.top + (this.$target.height() / 2) - (this.$direct.height() / 2),
                left: pOffSet.left  + (this.$target.width() / 2) - (this.$direct.width() / 2)
            });

            pOffSet = null;
        }
    },

    init: function(){
        this.chartArea = Ext.create('Ext.container.Container', {
            layout: 'fit',
            width: '100%',
            height: '100%',
            margin: '0 0 0 0',
            // flex: 1,
            listeners: {
                resize: function (_this) {
                    if (this.chart) {
                        // this.clientWidth = 1250;
                        // this.clientHeight = 590;

                        // this.chart.draw(this.chart.id, this.clientWidth, this.clientHeight, true);
                    }
                }.bind(this),
                render: function (_this) {
                    this.eedSummary = new EEDSummary({
                        width  : 1920,
                        height : 50,
                        id     : _this.id
                    });

                    this.eedSummary.init();
                    this.drawFrame();
                }.bind(this)
            }
        });

        this.add(this.chartArea);
    },

    initProperty: function(){
        // this.monitorType  = 'WAS';
        // this.openViewType =  Comm.RTComm.getCurrentMonitorType();
        // this.downAlarms   = this.setDownAlarms();

        this.minWidth = 1480;
        this.minHeight = 50;

        this.background = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            width : '100%',
            height: 50,
            listener: {
                resize: function(_this){
                    if(!_this.firstLoad) {
                        _this.initCanvas(this, this.getWidth(), this.getHeight());
                        _this.drawManager();
                    }
                }
            }
        });

        this.firstLoad = true;
    },

    /**
     * 차트 그리기
     */
    drawFrame: function() {
        if (this.timer) {
            clearTimeout(this.timer);
        }

        //TODO - data 임시로 받고 있음
        var data = {};

        data.txnToday = Math.floor(Math.random() * 1000000);
        data.txnYester = Math.floor(Math.random() * 1000000);

        data.visitorCnt = Math.floor(Math.random() * 200000);

        data.elapseAVG = Math.random() * 250000;

        data.runningCnt = Math.floor((Math.random() * 100 - 0 + 1)) + 1;

        data.errorCnt = Math.floor((Math.random() * 100 - 0 + 1)) + 1;

        this.eedSummary.draw(data);

        this.timer = setTimeout(this.drawFrame.bind(this), this.interval);
    },

    frameStopDraw: function() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    },

    frameRefresh: function(){
        this.drawFrame();
    }
});
