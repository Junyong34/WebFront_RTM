Ext.define('RTM.EED.rtmTaskTop', {
    extend: 'Ext.container.Container',
    title: 'rtmTaskTop',
    layout: 'fit',
    width: '100%',
    height: '100%',
    interval: 3000,
    cls: 'TaskTpsLineChart',
    listeners: {
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

        this.add(this.chartArea);

    },
});
