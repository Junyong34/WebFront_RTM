Ext.define('RTM.EED.rtmCpuMonitor', {
    extend: 'Ext.container.Container',
    title: 'CPU, Memory (Single)',
    padding: 1,
    layout: 'fit',
    width: '100%',
    height: '100%',
    border: true,
    monitorType: null,
    // cls    	: 'Exem-DockForm Auto-OS',
    style: {
        'background': '#393c43',
    },
    webCpu: {},
    wasCpu: {},
    dbCpu: {},
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
    listeners: {
        // resize: function(me, width) {
        // 	this.resizeCombo(width)
        // }
    },

    beforeDestroyEvent: function (me) {
        this.osData = null;
        // common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.ALARM, me);
    },
    init: function () {


        // this.instanceList = window.rtmViewManager.getActivityTabInstance();
        // this.businessFlag = common.WebEnv.getGroupNameType();

        // var levelColors = common.WebEnv.getLevelColor();

        // this.initFrameOption();

        // this.osData    = {};
        this.osWinFlag = false;
        var levelColors = this.getLevelColor();
        this.cpuColorList = [levelColors.cpu, levelColors.warning, levelColors.critical];
        this.memoryColorList = [levelColors.memory, levelColors.warning, levelColors.critical];
        this.activeCpuStatName = 'active_cpu_num';
        this.isHPServer = false;
        this.hpStatIdx = null;

        this.baseContainer = Ext.create('Ext.container.Container', {
            // cls   : 'frame-OS-Label',
            layout: {type: 'vbox', align: 'middle', pack: 'center'},
            flex: 1,
            // style:{
            // 	'background':'red',
            // }
        });

        this.baseBodyContainer = Ext.create('Ext.container.Container', {
            // cls   : 'frame-OS-Label',
            layout: 'fit',
            width: '100%',
            height: '100%',
            flex:8,
            // style:{
            // 	'background':'red',
            // }
        });

        // Arc 차트 영역
        this.chartContainerArea = Ext.create('Ext.container.Container', {
            // layout:'fit',
            layout: {type: 'hbox', align: 'middle', pack: 'center'},
            width: '100%',
            flex: 8,
            // cls   : 'frame-OS-Label',
        });


        var webCpuChart = Ext.create('Ext.container.Container', {
            layout: 'fit',
            height: '100%',
            flex: 1,
            style: {
                'background': '#393c43',
            },
            listeners: {
                render: function (me) {
                    me.getEl().on('click', function () {
                        console.log('차트 클릭');
                    }, this);
                }.bind(this),
                afterrender: function (me) {
                    this.webCpu = new canvasCpuChart(me.id, 1, 0, 0, 100, 110, 35, 48, 0, this.cpuColorList);
                    this.webCpu._gs().setTitle(this.monitorType);
                    this.webCpu.init();
                    this.webCpu.draw(0);
                    this.webCpu.infinityDraw();

                    // this.webCpu = Ext.create('RTM.EED.chart.canvasCpuArc', {
                    //     title: 'CPU',
                    //     fps: 1,
                    //     oldValue: null,
                    //     target: me,
                    //     color: this.cpuColorList
                    //     //color: ['#2b99f0', '#FF9803', '#D7000F']
                    // });

                    this.webCpu.draw(0); // 초기화
                    this.webCpu.infinityDraw(); // 무한동작
                    //me.cpu.oldValue = 0;
                }.bind(this)
            }
        });

        var wasCpuChart = Ext.create('Ext.container.Container', {
            layout: 'fit',
            height: '100%',
            flex: 1,
            style: {
                'background': '#393c43',
            },
            listeners: {
                render: function (me) {
                    me.getEl().on('click', function () {
                        console.log('차트 클릭');
                    }, this);
                }.bind(this),
                afterrender: function (me) {
                    this.wasCpu = new canvasCpuChart(me.id, 1, 0, 0, 100, 110, 35, 48, 0, this.cpuColorList);
                    this.wasCpu._gs().setTitle(this.monitorType);
                    this.wasCpu.init();
                    this.wasCpu.draw(0);
                    this.wasCpu.infinityDraw();
                    // this.wasCpu = Ext.create('RTM.EED.chart.canvasCpuArc', {
                    //     title: 'CPU',
                    //     fps: 1,
                    //     oldValue: null,
                    //     target: me,
                    //     color: this.cpuColorList
                    //     //color: ['#2b99f0', '#FF9803', '#D7000F']
                    // });
                    //
                    // this.wasCpu.draw(0); // 초기화
                    // this.wasCpu.infinityDraw(); // 무한동작
                    //me.cpu.oldValue = 0;
                }.bind(this)
            }
        });

        var dbCpuChart = Ext.create('Ext.container.Container', {
            layout: 'fit',
            height: '100%',
            flex: 1,
            style: {
                'background': '#393c43',
            },
            listeners: {
                render: function (me) {
                    me.getEl().on('click', function () {
                        console.log('차트 클릭');
                    }, this);
                }.bind(this),
                afterrender: function (me) {
                    this.dbCpu = new canvasCpuChart(me.id, 1, 0, 0, 100, 110, 35, 48, 0, this.cpuColorList);
                    this.dbCpu._gs().setTitle(this.monitorType);
                    this.dbCpu.init();
                    this.dbCpu.draw(0);
                    this.dbCpu.infinityDraw();
                    // this.dbCpu = Ext.create('RTM.EED.chart.canvasCpuArc', {
                    //     title: 'CPU',
                    //     fps: 1,
                    //     oldValue: null,
                    //     target: me,
                    //     color: this.cpuColorList
                    //     //color: ['#2b99f0', '#FF9803', '#D7000F']
                    // });
                    //
                    // this.dbCpu.draw(0); // 초기화
                    // this.dbCpu.infinityDraw(); // 무한동작
                    this.frameRefresh();
                    //me.cpu.oldValue = 0;
                }.bind(this)
            }
        });

        /* title 영역 시작  */
        this.topOptionContainer = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            width: '100%',
            flex: 1.5,
            cls: 'xm-container-base',
            style: {
                'background': '#393c43',
            },
        });

        this.frameTitle = Ext.create('Ext.form.Label', {
            height: '100%',
            margin: '0 0 0 10',
            cls: 'header-title',
            // text: '제목입니다.'
        });
        // 라인차트 영역
        this.lineChartArea = Ext.create('Ext.container.Container', {
            layout: 'fit',
            flex: 8,
            style: {
                'margin-top' : '10px'
            },
            listeners: {
                render: function (me) {
                    me.getEl().on('click', function () {
                        console.log('차트 클릭');
                    }, this);
                }.bind(this),
                afterrender: function (me) {
                    this.linCpuChart = Ext.create('RTM.EED.chart.cpuLineChart', {
                        target: me,
                        id: me.id,
                        //color: ['#2b99f0', '#FF9803', '#D7000F']
                    });

                    this.linCpuChart.init(); // 초기화

                }.bind(this)
            }
        });


        this.toggle = Ext.create('Ext.ux.toggleslide.ToggleSlide', {
            width: 100,
            height: 20,
            margin: '1 10 0 1',
            onText: 'Arc',
            offText: 'Line',
            state: true,
            listeners: {
                scope: this,
                change: function (toggle, state) {
                    if (state) {
                        this.chartContainerArea.setVisible(true);
                        this.lineChartArea.setVisible(false);
                        // this.mode = this.DISPLAYTYPE.CHART;
                        //
                        // if (this.alarmIcon) {
                        //     this.alarmIcon.startAnimationFrame();
                        // }
                    } else {
                        this.chartContainerArea.setVisible(false);
                        this.lineChartArea.setVisible(true);
                        // this.mode = this.DISPLAYTYPE.GRID;
                        //
                        // this.drawAlarm();
                        //
                        // if (this.alarmIcon) {
                        //     this.alarmIcon.stopAnimationFrame();
                        // }
                    }
                }
            }
        });

        this.optionButton = Ext.create('Ext.container.Container', {
            width: 17,
            height: 17,
            margin: '2 10 0 0',
            html: '<div class="frame-option-icon" title="' + 'option' + '"/>',
            listeners: {
                scope: this,
                render: function (me) {
                    me.el.on('click', function () {
                        this.groupListWindow = Ext.create('RTM.EED.rtmWorkGroup', {
                            style: {'z-index': '10'},
                            useSelect: false
                        });

                        this.groupListWindow.groupName     = common.Util.sort(["단말", "거래", "업무", "처리량", "실행시간"], 'asc');
                        this.groupListWindow.dataRow       = common.Util.sort(["단말", "거래", "업무", "처리량", "실행시간"], 'asc');
                        this.groupListWindow.targetGroup   = this;
                        this.groupListWindow.init();
                        this.groupListWindow.show();
                    }, this);
                }
            }
        });
        /* title 영역 끝 */


        this.topOptionContainer.add(this.frameTitle, {
            xtype: 'tbfill',
            flex: 1
        }, this.toggle, this.optionButton);
        this.chartContainerArea.add(webCpuChart, wasCpuChart, dbCpuChart);
        this.baseBodyContainer.add(this.chartContainerArea, this.lineChartArea)
        this.baseContainer.add(this.topOptionContainer, this.baseBodyContainer);
        this.add(this.baseContainer);


    },
    changeGroup : function(pGroupName) {
        // pGroupName: 팝업에서 선택했던 값
        console.dir(pGroupName);
    },
    setRandomData: function () {
        var insOneChart = this.webCpu;
        var insTwoChart = this.wasCpu;
        var insThreeChart = this.dbCpu;
        var generateRandom = function (min, max) {
            var ranNum = Math.floor(Math.random() * (max - min + 1)) + min;
            return ranNum;
        }
        var cpuRandom = generateRandom(1, 100);
        this.wasCpu.alarmLevel = generateRandom(0, 2);
        this.wasCpu.draw(cpuRandom);
        this.wasCpu.oldValue = cpuRandom;
        // this.wasCpu.draw_In_Out();

        var cpuRandom = generateRandom(1, 100);
        this.dbCpu.alarmLevel = generateRandom(0, 2);
        this.dbCpu.draw(cpuRandom);
        this.dbCpu.oldValue = cpuRandom;
        // this.dbCpu.draw_In_Out();

        var cpuRandom = generateRandom(1, 100);
        this.webCpu.alarmLevel = generateRandom(0, 2);
        this.webCpu.draw(-1);
        this.webCpu.oldValue = cpuRandom;

        // this.webCpu.draw_In_Out();
        setInterval(function () {
            var reDataValue = generateRandom(1, 100);
            insOneChart.alarmLevel = generateRandom(0, 2);
            insOneChart.draw(reDataValue);
            insOneChart.oldValue = reDataValue;

            var reDataValue = generateRandom(1, 100);
            insTwoChart.alarmLevel = generateRandom(0, 2);
            insTwoChart.draw(reDataValue);
            insTwoChart.oldValue = reDataValue;

            var reDataValue = generateRandom(1, 100);
            insThreeChart.alarmLevel = generateRandom(0, 2);
            insThreeChart.draw(reDataValue);
            insThreeChart.oldValue = reDataValue;
            // console.log(`insOneChart : ${insOneChart}insTwoChart : ${insTwoChart} insThreeChart : ${insThreeChart}`);
        }, 3000);
    },
    frameRefresh: function () {
        if (this.isVisible()) {
            this.setRandomData();
        }
    },
    getLevelColor: function () {
        var levelColor = {};

        levelColor = {
            normal: '#42A5F6',
            warning: '#FF9803',
            critical: '#D7000F',
            cpu: '#42A5F6',
            memory: '#8ac449'
        };

        return levelColor;
    },

    _getHPStatIdx: function () {
        this.hpStatIdx = null;
        this.isHPServer = false;

        var ix, ixLen, dbInfoObj, osName, osStatList;

        dbInfoObj = Object.keys(Comm.dbInfoObj || {});
        for (ix = 0, ixLen = dbInfoObj.length; ix < ixLen; ix++) {
            if (this.frameOption.instanceName == Comm.dbInfoObj[dbInfoObj[ix]].instanceName) {
                osName = Comm.dbInfoObj[dbInfoObj[ix]].osName;
                if (this.hpOSList.indexOf(osName) > -1) {
                    this.isHPServer = true;
                    break;
                }
            }
        }

        if (!this.isHPServer) {
            return;
        }

        if (Repository.statList && Repository.statList[this.frameOption.instanceName] && Repository.statList[this.frameOption.instanceName].os) {
            osStatList = Repository.statList[this.frameOption.instanceName].os;

            for (ix = 0, ixLen = osStatList.length; ix < ixLen; ix++) {
                if (osStatList[ix][1] == this.activeCpuStatName) {
                    this.hpStatIdx = osStatList[ix][0];
                    break;
                }
            }
        }
    },

    _createLabel: function (text, width, style, margin) {
        return Ext.create('Ext.form.Label', {
            width: width,
            margin: margin,
            style: style,
            text: text
        });
    },

    _initData: function () {
        this.cpuUserValue.setText('0%');
        this.cpuSysValue.setText('0%');
        this.cpuIOValue.setText('0%');
        this.memoryTotalValue.setText('0');
        this.memoryFreeValue.setText('0');

        this.cpu.draw(0);
        //this.cpu.oldValue = 0;
        this.memory.draw(0);
        //this.memory.oldValue = 0;
    },

    frameStyleChange: function () {
        if (!this.is_init || !this.cpuColorList || !this.memoryColorList) {
            return;
        }

        var levelColors = common.WebEnv.getLevelColor();

        this.cpuColorList.length = 0;
        this.cpuColorList.push(levelColors.cpu, levelColors.warning, levelColors.critical);

        this.memoryColorList.length = 0;
        this.memoryColorList.push(levelColors.memory, levelColors.warning, levelColors.critical);

        this.cpu.color = this.cpuColorList;
        this.memory.color = this.memoryColorList;

        this.cpu.changeDraw();
        this.memory.changeDraw();

        this._inputData();
    },


    _inputData: function () {
        /*
         Repository['QA163'].statList.os[index]
         [0, "user cpu",     "", 0]
         [1, "sys cpu",      "", 0]
         [2, "iowait cpu",   "", 0]
         [3, "idle cpu",     "", 0]
         [4, "free memory",  "", 0]
         [5, "total memory", "", 0]
         [6, "CPU",          "", 0]
         [7, "free swap",    "", 0]
         [8, "total swap",   "", 0]
         [9, "active memory","", 0]
         */
//        var osStatList = Repository.sgaStatusStat[this.instanceName].Sigma.sys_os;

        var bufferRepo = this.getRepositoryData();

        if (!this.cpu || !this.cpu.draw || !this.memory || !this.memory.draw || !this.frameOption.instanceName || !bufferRepo) {
            return;
        }

        var osStatList = bufferRepo.data[this.frameOption.instanceName];

        if (!osStatList) {
            return;
        }

        if (this.isHPServer) {
            if (this.hpStatIdx == null) {
                this._getHPStatIdx();
            }

            var sgaData = bufferRepo.sgaStatusStat[this.frameOption.instanceName];

            if (this.hpStatIdx > 0 && sgaData && sgaData.Delta && sgaData.Delta.sys_os && sgaData.Delta.sys_os[this.hpStatIdx] != null && sgaData.Delta.sys_os[this.hpStatIdx] > -1) {
                this.hpCurrentValue.setText(sgaData.Delta.sys_os[this.hpStatIdx]);
                if (!this.hpValueArea.isVisible()) {
                    this.hpValueArea.show();
                }
            } else {
                if (this.hpValueArea.isVisible()) {
                    this.hpValueArea.hide();
                }
            }

        } else {
            if (this.hpValueArea.isVisible()) {
                this.hpValueArea.hide();
            }
        }

        var cpuUser = osStatList.cpuUser;
        var cpuSys = osStatList.cpuSys;
        var cpuIO = osStatList.cpuIO;

        // 리눅스 버전에서는 I/O wait 가 포함되어야 한다.
        var cpuRatio = cpuUser + cpuSys + ( this.ioWaitCheck.getValue() ? 0 : cpuIO );

        this.cpu.draw(cpuRatio);
//        this.cpu.draw(Math.random()*100);

        var memoryTotal = osStatList.memoryTotal;
        var memoryFree = osStatList.memoryFree;
        var memoryUsage = osStatList.memoryUsage;

        this.memory.draw(memoryUsage);
//        this.memory.draw(Math.random()*100);

        // Memory 계산
        memoryFree = (memoryFree / 1024).toFixed(1);
        memoryTotal = (memoryTotal / 1024).toFixed(1);

        if (memoryFree > 1000) {
            memoryFree = ( (memoryFree / 1024).toFixed(1) ) + 'G';
        } else {
            memoryFree = memoryFree + 'M';
        }

        if (memoryTotal > 1000) {
            memoryTotal = ( (memoryTotal / 1024).toFixed(1) ) + 'G';
        } else {
            memoryTotal = memoryTotal + 'M';
        }

        cpuUser += '%';
        cpuSys += '%';
        cpuIO += '%';

        if (this.cpuUserValue.text != cpuUser) this.cpuUserValue.setText(cpuUser);
        if (this.cpuSysValue.text != cpuSys) this.cpuSysValue.setText(cpuSys);
        if (this.cpuIOValue.text != cpuIO) this.cpuIOValue.setText(cpuIO);

        if (this.memoryTotalValue.text != memoryTotal) this.memoryTotalValue.setText(memoryTotal);
        if (this.memoryFreeValue.text != memoryFree) this.memoryFreeValue.setText(memoryFree);

        cpuUser = null, cpuSys = null, cpuIO = null, cpuRatio = null;
        memoryTotal = null, memoryFree = null, memoryUsage = null;
    },


});
