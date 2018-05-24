Ext.define('RTM.EED.rtmTaskTop', {
    extend: 'EXEM.rtmBasicLayout',
    title: '',
    layout: 'fit',
    width: '100%',
    height: '100%',
    interval: 3000,
    cls: 'rtm-base-panel',
    listeners: {
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
                        this.clientHeight = 570;

                        // this.chart.draw(this.chart.id, this.clientWidth, this.clientHeight, true);
                    }
                }.bind(this),
                render: function (_this) {
                    this.chart = Ext.create("RTM.EED.chart.takConditionLineChart", {
                        id: _this.id
                    });

                    this.chart.init();
                    // this.chart.draw();
                    // this.chart.init(this.chart.id, this.chart.width, this.chart.height);
                    // this.drawFrame();
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
        // this.add(this.chartArea);

    },
});
