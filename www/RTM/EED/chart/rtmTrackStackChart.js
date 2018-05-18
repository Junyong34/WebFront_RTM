Ext.define('RTM.EED.chart.rtmTrackStackChart', {
    id: null,
    today: [],
    yester: [],
    time: 5,
    dataset: null,
    options:null,
    constructor: function (config) {
        var list = Object.keys(config || {});
        for (var ix = 0, ixLen = list.length; ix < ixLen; ix++) {
            this[list[ix]] = config[list[ix]];
        }
    },
    init: function () {
        this.totalPoints = 100;
        this.updateInterval = 500;
        this.now = new Date().getTime();

        this.initData();
        // 샘플 데이타 추출
        this.getData();
        // 캔버스 위치 Dom 생성
        this.createDom();
        // 초기
        this.chartOption();
    },
    initData: function() {
        var ix, hours;

        hours = 0;
        this.today[0]  = [new Date("2018-05-17 00:00:00"), Math.random() * 100];
        this.yester[0] = [new Date("2018-05-17 00:00:00"), Math.random() * 100];

        for (ix = 1; ix < 24; ix++) {
            if (ix < 10) {
                this.today[ix]  = [new Date("2018-05-17 " + ('0' + ix) + ":00:00"), Math.random() * 100];
                this.yester[ix] = [new Date("2018-05-17 " + ('0' + ix) + ":00:00"), Math.random() * 100];
            } else {
                this.today[ix]  = [new Date("2018-05-17 " + ix + ":00:00"), Math.random() * 100];
                this.yester[ix] = [new Date("2018-05-17 " + ix + ":00:00"), Math.random() * 100];
            }
        }

        this.count = 0;
    },
    getData: function() {
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
        this.barArea.style.width = '950px';
        this.barArea.style.height = '80px';
        this.barArea.style.marginLeft = '5px';
        document.getElementById(this.id).appendChild(this.barArea);
        this.barArea.id = 'cpuLine_' + this.id;
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

                        return hours;
                    } else {
                        return "";
                    }
                },
                // axisLabelUseCanvas: true,
                // axisLabelFontSizePixels: 12,
                // axisLabelFontFamily: 'Verdana, Arial',
                // axisLabelPadding: 10
            },
            yaxis: {
                min: 0,
                max: 100,
                tickSize: 5,
                tickFormatter: function (v, axis) {
                    if (v % 10 == 0) {
                        return v + "%";
                    } else {
                        return "";
                    }
                },
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: 'Verdana, Arial',
                axisLabelPadding: 6
            },
            // legend: {
            //     labelBoxBorderColor: "#fff"
            // },
            // grid: {
            //     backgroundColor: "#000000",
            //     tickColor: "#008040"
            // }
        };
    },
    draw: function (value) {
        var self = this;
        this.dataset = [
            { label: "CPU", data: this.data, color: "#2c99f0" }
        ];

        $.plot($("#"+this.id),
            [
                {
                    data: this.today,
                    bars: {
                        show: true,
                        barWidth: 0.2,
                        align: "left"
                    }
                },
                {
                    data: this.yester,
                    bars: {
                        show: true,
                        barWidth: 0.2,
                        align: "right"
                    }
                }
            ], this.options);

        function update() {
            self.getData();

            $.plot($("#"+self.id),
                [
                    {
                        data: self.today,
                        bars: {
                            show: true,
                            barWidth: 0.2,
                            align: "left"
                        }
                    },
                    {
                        data: self.yester,
                        bars: {
                            show: true,
                            barWidth: 0.2,
                            align: "right"
                        }
                    }
                ], self.options);
            setTimeout(update, self.updateInterval);
        }

        update();
    }
});
