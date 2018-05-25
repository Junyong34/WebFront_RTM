Ext.define('RTM.EED.chart.rtmTrackStackChart', {
    id: null,
    today: [],
    yester: [],
    time: 5,
    dataset: null,
    options: null,
    constructor: function (config) {
        var list = Object.keys(config || {});
        for (var ix = 0, ixLen = list.length; ix < ixLen; ix++) {
            this[list[ix]] = config[list[ix]];
        }
    },
    init: function () {
        this.totalPoints = 100;
        this.updateInterval = 5000;
        this.now = new Date().getTime();

        this.initData();
        // 샘플 데이타 추출
        this.getData();
        // 캔버스 위치 Dom 생성
        this.createDom();
        // 초기
        this.chartOption();
    },
    initData: function () {
        var ix, hours;

        hours = 0;
        this.today[0] = [new Date("2018-05-17 00:00:00"), Math.random() * 100];
        this.yester[0] = [new Date("2018-05-17 00:00:00"), Math.random() * 100];

        for (ix = 1; ix < 24; ix++) {
            if (ix < 10) {
                this.today[ix] = [new Date("2018-05-17 " + ('0' + ix) + ":00:00"), Math.random() * 100];
                this.yester[ix] = [new Date("2018-05-17 " + ('0' + ix) + ":00:00"), Math.random() * 100];
            } else {
                this.today[ix] = [new Date("2018-05-17 " + ix + ":00:00"), Math.random() * 100];
                this.yester[ix] = [new Date("2018-05-17 " + ix + ":00:00"), Math.random() * 100];
            }
        }

        this.count = 0;
    },
    getData: function () {
        var rand = Math.random() * 100;

        if (this.time > 22) {
            this.time = 0;
        } else {
            this.time++;
        }

        this.today[this.time][1] = rand;

        rand = Math.random() * 100;
        this.yester[this.time][1] = rand;
    },
    createDom: function () {
        this.barArea = document.createElement('div');
        this.barArea.style.width = '945px';
        this.barArea.style.height = '90px';
        this.barArea.style.marginLeft = '5px';
        this.barArea.style.marginTop = '0px';
        this.legendArea = document.createElement('div');
        this.legendArea.classList.add('legend-container');
        this.legendArea.id = 'cpuLintChart_' + this.id;
        document.getElementById(this.id).appendChild(this.barArea);
        document.getElementById(this.id).appendChild(this.legendArea);
        this.legendArea.style.top = '-12px';
        this.legendArea.style.left = this.barArea.getBoundingClientRect().width - 80 + 'px';
        this.barArea.id = 'cpubar_' + this.id;
        this.id = this.barArea.id;

    },
    chartOption: function () {
        this.options = {
            xaxis: {
                mode: "categories",
                tickLength: 0,
                ticks: 23,
                // tickSize: [3600, "second"],
                tickFormatter: function (v, axis) {
                    var date = new Date(v);
                    if (date.getSeconds() % 60 == 0) {
                        var hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
                        var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
                        var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();

                        return v < 10 ? '0' + v : v;
                    } else {
                        return "";
                    }

                },
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: 'Verdana, Arial',
                axisLabelPadding: 10,
                tickLength: 0,
            },
            yaxis: {
                min: 0,
                // max: 100,
                // tickSize: 5,
                tickFormatter: function (val, axis) {
                    if (val > 1000000)
                        return (val / 1000000).toFixed(axis.tickDecimals) + " MB";
                    else if (val > 1000)
                        return (val / 1000).toFixed(axis.tickDecimals) + " kB";
                    else
                        return val.toFixed(axis.tickDecimals) + " K";
                },
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: 'Verdana, Arial',
                axisLabelPadding: 6
            },
            grid: {
                borderWidth: 1,
                // markings: [ { xaxis: { from: 0, to: 100 }, yaxis: { from: 0, to: 0 }, color: "red" },
                //     { xaxis: { from: 0, to: 0 }, yaxis: { from: 0, to: 100 }, color: "red" }]
            },
            legend: {
                show: true,
                noColumns: 5,
                backgroundOpacity: 0,
                container: $('#' + this.legendArea.id),

            }
        };
    },
    draw: function (value) {
        var self = this;
        this.dataset = [
            {
                label: "오늘",
                data: this.today,
                color: "#01a9fc",
                bars: {
                    show: true,
                    barWidth: 0.2,
                    align: "left"
                }
            },
            {
                label: "어제",
                data: this.yester,
                color: "#7ecd2a",
                bars: {
                    show: true,
                    barWidth: 0.2,
                    align: "right"
                }
            }
        ];

        $.plot($("#" + this.id), this.dataset, this.options);

        function update() {
            self.getData();

            $.plot($("#" + self.id), self.dataset, self.options);

            setTimeout(update, self.updateInterval);
        }

        update();
    }
});
