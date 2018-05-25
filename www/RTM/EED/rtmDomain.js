Ext.define('RTM.EED.rtmDomain', {
    extend: 'EXEM.rtmBasicLayout',
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
    constructor: function (config) {
        this.callParent();
        // 옵션값 설정
        var list = Object.keys(config || {});
        for (var ix = 0, ixLen = list.length; ix < ixLen; ix++) {
            this[list[ix]] = config[list[ix]];
        }
        // init 초기셋팅
        this.init();

    },
    init: function () {
        this.frameTitle.setText(this.title);
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
                        width       : 1250,
                        height      : 590,
                        id          : _this.id,
                        tasks       : ["입금내역", "출금내역", "송금내역", "계좌이체", "잔액조회", "계좌변경", "거래조회", "도메인", "뱅킹", "통장정리", "신한은행", "신고", "나가기", "종료"],
                        serverList  : ["WEB", "WAS", "DB"]
                    });

                    // this.chart.init(this.chart.id, this.chart.width, this.chart.height);
                    this.chart.draw();
                    this.drawFrame();
                }.bind(this)
            }
        });
        this.optionButton = Ext.create('Ext.container.Container', {
            width: 17,
            height: 17,
            margin: '2 8 0 0',
            html: '<div class="frame-option-icon" title="' + 'option' + '"/>',
            listeners: {
                scope: this,
                render: function (me) {
                    me.el.on('click', function () {
                        this.groupListWindow = Ext.create('RTM.EED.rtmWorkGroup', {
                            style: {'z-index': '10'},
                            useSelect: false,
                            title: '업무목록'
                        });

                        this.groupListWindow.groupName = common.Util.sort(["송금내역", "입급내역", "출금내역", "계좌이체", "통장정리"], 'asc');
                        this.groupListWindow.dataRow = common.Util.sort(["송금내역", "입급내역", "출금내역", "계좌이체", "통장정리"], 'asc');
                        this.groupListWindow.targetGroup = this;
                        this.groupListWindow.init();
                        this.groupListWindow.show();
                    }, this);
                }
            }
        });


        this.baseTopContainer.add(this.frameTitle, {
            xtype: 'tbfill',
            flex: 1
        }, {
            xtype: 'tbfill',
            flex: 1
        }, this.optionButton);
        this.baseBodyContainer.add(this.chartArea);



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
