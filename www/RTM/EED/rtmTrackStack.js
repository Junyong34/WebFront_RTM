Ext.define('RTM.EED.rtmTrackStack', {
    extend: 'Ext.container.Container',
    title: 'Transaction chart by tasks',
    layout: 'fit',
    width: '100%',
    height: '100%',
    interval: 500,
    cls: 'rtmTrackStack',
    listeners: {
        destroy: function (_this) {
            if (_this.timer) {
                clearTimeout(_this.timer);
            }
        }
    },
    init: function () {
        this.chartArea = Ext.create('Ext.container.Container', {
            layout: 'fit',
            // width: '100%',
            // height: '100%',
            margin: '0 0 0 0',
            flex: 1,
            listeners: {
                resize: function (_this) {
                    if (this.chart) {
                        this.clientWidth = 1250;
                        this.clientHeight = 590;

                        // this.chart.draw(this.chart.id, this.clientWidth, this.clientHeight, true);
                    }
                }.bind(this),
                render: function (_this) {
                    this.chart = Ext.create("RTM.EED.chart.rtmTrackStackChart", {
                        id: _this.id
                    });

                    this.chart.init();
                    this.chart.draw();
                    // this.chart.init(this.chart.id, this.chart.width, this.chart.height);
                    // this.drawFrame();
                }.bind(this)
            }
        });

        this.add(this.chartArea);

    },

    /**
     * 차트 그리기
     */
    drawFrame: function (frameRefreshed) {
        if (this.timer) {
            clearTimeout(this.timer);
        }

        var data = {};

        data.sub1 = {
            tps: Math.random() * 100,
            elapse: Math.random() * 100,
            errorCnt: Math.random() * 100
        };

        data.sub2 = {
            tps: Math.random() * 100,
            elapse: Math.random() * 100,
            errorCnt: Math.random() * 100
        };

        data.main = {
            tps: Math.random() * 10000,
            elapse: Math.random() * 1000,
            errorCnt: Math.random() * 100
        };

        //TODO - 임시
        // this.chart.draw(data);

        // this.chart.draw();
        this.timer = setTimeout(this.drawFrame.bind(this), this.interval);
    }
});
