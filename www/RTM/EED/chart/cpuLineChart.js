Ext.define('RTM.EED.chart.cpuLineChart', {
    id: null,
    options: null,
    constructor: function (config) {
        var list = Object.keys(config || {});
        for (var ix = 0, ixLen = list.length; ix < ixLen; ix++) {
            this[list[ix]] = config[list[ix]];
        }

    },
    init: function () {
        // console.log(this.totalPoints);

        this.totalPoints = 20;
        this.updateInterval = 3000;
        this.now = new Date().getTime();
        console.log(this.now);
        this.data = [];
        this.data2 = [];
        this.data3 = [];
        this.dataStorage = {'data_1': null, 'data_2': null, 'data_3': null};
        this.dataset = null;

        // 샘플 데이타 추출
        this.initData();
        // 캔버스 위치 Dom 생성
        this.createDom();
        // 초기
        this.chartOption();
        // 차트 그리기
        this.draw();
    },
    initData: function () {

        // 초기 값 셋팅
        for (var ix = 0; ix < this.totalPoints; ix++) {
            if (ix !== 0) {
                this.data[ix] = [this.data[this.data.length - 1][0] - this.updateInterval, null];
                this.data2[ix] = [this.data2[this.data2.length - 1][0] - this.updateInterval, null];
                this.data3[ix] = [this.data3[this.data3.length - 1][0] - this.updateInterval, null];
                // this.data[ix] = [null, null];
                // this.data2[ix] = [null, null];
                // this.data3[ix] = [null, null];
            } else {
                // 초기값 0으로 셋팅
                this.data[ix] = [this.now, null];
                this.data2[ix] = [this.now, null];
                this.data3[ix] = [this.now, null];

            }
        }
        this.data[this.totalPoints - 1] = [this.now, 0];
        this.data2[this.totalPoints - 1] = [this.now, 0];
        this.data3[this.totalPoints - 1] = [this.now, 0];

        // if (!this.data.length) {
        //     this.data[0] = [this.now, Math.random() * 100];
        // }


        // while (this.data.length < this.totalPoints) {
        //     var y = Math.random() * 100;
        //     // var temp = [this.now += this.updateInterval, y];
        //     var temp = [this.data[this.data.length - 1][0] + this.updateInterval, y];
        //     this.data.push(temp);
        // }
    },
    getData: function () {
        var y = Math.random() * 100;
        this.data.shift();
        this.data.push([this.data[this.data.length - 1][0] + this.updateInterval, y]);

        var x = Math.random() * 50;
        this.data2.shift();
        this.data2.push([this.data2[this.data2.length - 1][0] + this.updateInterval, x]);

        var x = Math.random() * 30;
        this.data3.shift();
        this.data3.push([this.data3[this.data3.length - 1][0] + this.updateInterval, x]);

        // if (!this.data.length) {
        //     this.data[0] = [this.now, Math.random() * 100];
        // }
        //
        //
        // while (this.data.length < this.totalPoints) {
        //     var y = Math.random() * 100;
        //     // var temp = [this.now += this.updateInterval, y];
        //     var temp = [this.data[this.data.length - 1][0] + this.updateInterval, y];
        //     this.data.push(temp);
        // }


    },
    createDom: function () {
        this.lineArea = document.createElement('div');
        this.lineArea.style.width = '290px';
        this.lineArea.style.height = '130px';
        this.lineArea.style.marginLeft = '5px';
        this.legendArea = document.createElement('div');
        this.legendArea.classList.add('legend-container');
        this.legendArea.id = 'cpuLintChart'+ this.id;
        document.getElementById(this.id).appendChild(this.lineArea);
        document.getElementById(this.id).appendChild(this.legendArea);
        this.legendArea.style.top = '-12px';
        this.legendArea.style.left = this.lineArea.getBoundingClientRect().width - 140 + 'px';
        this.lineArea.id = 'cpuLine_' + this.id;
        this.id = this.lineArea.id;

    },
    chartOption: function () {
        this.options = {
            series: {
                lines: {
                    show: true,
                    lineWidth: 1.2,
                    fill: false
                },
                points: {show: false}
            },
            xaxis: {
                mode: "time",
                tickSize: [6, "second"],
                tickFormatter: function (v, axis) {
                    var date = new Date(v);
                    if (date.getSeconds() % 30 == 0) {
                        var hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
                        var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
                        var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();

                        // return hours + ":" + minutes + ":" + seconds;
                        return hours + ":" + minutes + ":" + seconds;;
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
                max: 100,
                // tickSize: 30,
                tickFormatter: function (v, axis) {
                    if (v % 10 == 0) {
                        return v + "%";
                    } else {
                        return "";
                    }
                },
                // tickLength: 1,
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
                noColumns: 3,
                backgroundOpacity: 0,
                container: $('#'+this.legendArea.id),

            }
        };
    },
    draw: function (value) {
        var self = this;
        this.dataset = [
            {label: 'CPU', data: this.data, color: "#2c99f0"},
            {label: 'CPU2', data: this.data2, color: "#fec64e"},
            {label: 'CPU3', data: this.data3, color: "#05ffc4"}
        ];

        $.plot($("#" + this.id), this.dataset, this.options);

        function update() {
            self.getData();

            $.plot($("#" + self.id), self.dataset, self.options);
            setTimeout(update, self.updateInterval);
        }

        setTimeout(update, self.updateInterval);
    }
})
