Ext.define('RTM.EED.chart.takConditionLineChart', {
    id: null,
    constructor: function (config) {
        var list = Object.keys(config || {});
        for (var ix = 0, ixLen = list.length; ix < ixLen; ix++) {
            this[list[ix]] = config[list[ix]];
        }

    },
    init: function () {
        // console.log(this.totalPoints);

        this.totalPoints = 20;
        this.updateInterval = 30000;
        this.now = new Date().getTime();
        this.options = null;
        this.data = [];
        this.data2 = [];
        this.data3 = [];
        this.dataStorage = [
            {
                id: 'data0',
                data: []
            },
            {
                id: 'data1',
                data: []
            },
            {
                id: 'data2',
                data: []
            },
            {
                id: 'data3',
                data: []
            },
            {
                id: 'data4',
                data: []
            }];
        this.dataset = null;
        this.lineColor = ['#ff6384', '#fe9f40', '#ffcd55', '#4bc0c0', '#37a2eb']

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
        for ( let i = 0; i <this.dataStorage.length; i++) {
            let datasetting = this.dataStorage[i];
            // 초기 값 셋팅
            for (var ix = 0; ix < this.totalPoints; ix++) {
                if(this.totalPoints - 1 === ix){
                    datasetting.data[this.totalPoints - 1] = [this.now, 0];
                } else if (ix !== 0)  {
                    datasetting.data[ix] = [datasetting.data[datasetting.data.length -1][0] - this.updateInterval, null];
                } else {
                    // 초기값 0으로 셋팅
                    datasetting.data[ix] = [this.now, null];


                }
            }
        }
    },
    getData: function () {
        for ( let i = 0; i <this.dataStorage.length; i++) {
            let ranData = Math.random() * (50 * (i+1));
            let datasetting = this.dataStorage[i];
            datasetting.data.shift();
            datasetting.data.push([datasetting.data[datasetting.data.length - 1][0] + this.updateInterval,ranData]);
        }
    },
    createDom: function () {
        this.lineArea = document.createElement('div');
        this.lineArea.style.width = '940px';
        this.lineArea.style.height = '80px';
        this.lineArea.style.marginLeft = '5px';
        this.lineArea.style.marginTop = '20px';
        this.legendArea = document.createElement('div');
        this.legendArea.classList.add('legend-container');
        this.legendArea.id = 'cpuLintChart_' + this.id;
        document.getElementById(this.id).appendChild(this.lineArea);
        document.getElementById(this.id).appendChild(this.legendArea);
        this.legendArea.style.top = '-12px';
        this.legendArea.style.left = this.lineArea.getBoundingClientRect().width - 300 + 'px';
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
                points: {show: true}
            },
            xaxis: {
                mode: "time",
                tickSize: [6, "second"],
                tickFormatter: function (v, axis) {
                    var date = new Date(v);
                    if (date.getSeconds() % 60 == 0) {
                        var hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
                        var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
                        var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();

                        // return hours + ":" + minutes + ":" + seconds;
                        return hours + ":" + minutes;
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
                // tickSize: 50,
                // tickFormatter: function (v, axis) {
                //     if (v % 10 == 0) {
                //         return v + "%";
                //     } else {
                //         return "";
                //     }
                // },
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
                noColumns: 5,
                backgroundOpacity: 0,
                container: $('#' + this.legendArea.id),

            }
        };
    },
    draw: function (value) {
        var self = this;
        this.dataset = [
            {label: '송금내역', data: this.dataStorage[0].data, color: this.lineColor[0]},
            {label: '입급내역', data: this.dataStorage[1].data, color: this.lineColor[1]},
            {label: '출금내역', data: this.dataStorage[2].data, color: this.lineColor[2]},
            {label: '계좌이체', data: this.dataStorage[3].data, color: this.lineColor[3]},
            {label: '통장정리', data: this.dataStorage[4].data, color: this.lineColor[4]},
        ];


        $.plot($("#" + this.id), this.dataset, this.options);

        function update() {
            self.getData();

            $.plot($("#" + self.id), self.dataset, self.options);
            setTimeout(update, self.updateInterval);
        }
        update();
        // setTimeout(update, self.updateInterval);
    }
})
