Ext.define('RTM.EED.rtmDomain', {
    extend: 'Ext.container.Container',
    title: 'rtmEED',
    layout: 'fit',
    width: '100%',
    height: '100%',
    interval: 1000 * 3,
    cls: 'rtm-base-panel',
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
                    this.chart = new DomainChart({
                        width: 1250,
                        height: 590,
                        id: _this.id,
                        tasks: ["입금내역", "출금내역", "송금내역", "계좌이체", "잔액조회", "계좌변경", "거래조회", "도메인", "뱅킹", "통장정리", "신한은행", "신고", "나가기", "종료"]
                    });

                    // this.chart.init(this.chart.id, this.chart.width, this.chart.height);
                    this.chart.draw();
                    this.drawFrame();
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
            tps: Math.random() * 3000,
            elapse: Math.random() * 100,
            errorCnt: Math.random() * 100
        };

        data.sub2 = {
            tps: Math.random() * 3000,
            elapse: Math.random() * 100,
            errorCnt: Math.random() * 100
        };

        data.main = {
            tps: Math.random() * 200000,
            elapse: Math.random() * 1000,
            errorCnt: Math.random() * 100
        };

        //TODO - 임시
        this.chart.drawPacketData(data);
        this.chart.startAnimation();

        this.timer = setTimeout(this.drawFrame.bind(this), this.interval);
    },

// frameStopDraw: function() {
//     if (this.timer) {
//         clearTimeout(this.timer);
//     }
// },
//
// frameRefresh: function(){
//
//     if(this.bizExceptionCheck()) {
//         this.drawFrame(true);
//         this.chart.draw(this.chart.id, this.clientWidth, this.clientHeight + 60, true);
//     }
// }
});
