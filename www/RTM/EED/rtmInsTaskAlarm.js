Ext.define('RTM.EED.rtmInsTaskAlarm', {
    extend: 'Ext.container.Container',
    title: 'rtmInsTaskAlarm',
    layout: 'fit',
    width: '100%',
    height: '100%',
    // margin: '10 10 10 10',
    interval: 5000,
    cls: 'rtm-base-panel',
    listeners: {},
    init: function () {
        var self = this;
        this.testData = [];
        // 기본뼈대 생성
        this.initLayout();
        // 그리드 생성
        this.createAlarmGrid();
        // 그리드 툴팁 생성
        this.createTooltip();


        // this.testAlarmData();

        // 데이타 처리
        this.alarmData();

        // self.testAlarmData();
        setInterval(function () {
            self.testAlarmData();
        }, interval);

    },
    initLayout: function () {
        this.gridArea = Ext.create('Ext.container.Container', {
            layout: 'fit',
            // width: '100%',
            // height: '100%',
            margin: '0 10 10 10',
            flex: 1,
        });
    },
    createAlarmGrid: function () {

        var self = this;

        this.grid = Ext.create('Exem.BaseGrid', {
            gridName: 'alarmList',
            width: '100%',
            height: '100%',
            localeType: 'H:i:s',
            usePager: false,
            borderVisible: true,
            defaultbufferSize: 0,
            defaultPageSize: 0,
            cls: 'rtm-base',
            baseGridCls: 'baseGridRTM',
            contextBaseCls: 'rtm-context-base',
            exportFileName: this.title,
            columnmove: function () {
                // this.saveLayout(this.name);
            },
            celldblclick: function (thisGrid, td, cellIndex, record) {
            }
        });

        this.grid.beginAddColumns();

        try {
            this.grid.addColumn('인스턴스명', 'A1', 80, Grid.String, true, false);
            this.grid.addColumn('출금이체', 'A2', 62, 'center', true, false);
            this.grid.addColumn('오픈API', 'A3', 62, 'center', true, false);
            this.grid.addColumn('홈페이지', 'A4', 62, 'center', true, false);
            this.grid.addColumn('PG업무', 'A5', 62, 'center', true, false);
            this.grid.addColumn('기타업무', 'A6', 62, 'center', true, false);

            // this.grid.addColumn('Elapse Time Ratio (%)'  , 'elapseratio'   ,  90, Grid.Float   , true,  false);
        } finally {
            // this.grid.setOrderAct('A8', 'desc');
            this.grid.endAddColumns();
        }

        // this.setRowClassByElapseTime();

        this.grid.loadLayout();

        this.grid.addRenderer('A2', this.gridStackRenderer.bind(this));
        this.grid.addRenderer('A3', this.gridStackRenderer.bind(this));
        this.grid.addRenderer('A4', this.gridStackRenderer.bind(this));
        this.grid.addRenderer('A5', this.gridStackRenderer.bind(this));
        this.grid.addRenderer('A6', this.gridStackRenderer.bind(this));


        this.cellEventCls = this.id + '_grid_ratio';

        // $(this.el.dom).on('mouseenter', '.' + this.cellEventCls, function() {
        //     var etime = $(this).attr('etime');
        //     var dtime = $(this).attr('dtime');
        //     var dPercent = (+etime === 0)? 0:Math.round(dtime / etime * 100);
        //     var ePercent = 100 - dPercent;
        //
        //     $(self.transactionListTooltip).css({'display': 'block'});
        //     $(self.transactionListTooltip).find('.elapsetimeValue').text(ePercent+'%');
        //     $(self.transactionListTooltip).find('.dbtimeValue').text(dPercent+'%');
        //
        //     var posY = window.event.pageY;
        //     var posX = window.event.pageX;
        //
        //     if (posY + 90 > window.innerHeight) {
        //         posY = window.innerHeight - 90;
        //     }
        //     if (posX + ($(self.transactionListTooltip).width()) + 50 > window.innerWidth) {
        //         posX = window.innerWidth - (($(self.transactionListTooltip).width()) + 50);
        //     }
        //     $(self.transactionListTooltip).css({top: posY + 10, left: posX + 10});
        //
        //     if (self.tooltipTimer) {
        //         clearTimeout(self.tooltipTimer);
        //     }
        //     self.tooltipTimer = setTimeout(function() {
        //         self.hideTooltip();
        //     }.bind(self), 2000);
        // });
        //
        // $(this.el.dom).on('mouseout', '.'+this.cellEventCls, function() {
        //     $(self.transactionListTooltip).css('display', 'none');
        // });
        //
        // this.tabpanel2 = Ext.create('Ext.container.Container', {
        //     layout : 'vbox',
        //     flex: 1,
        //     margin: '2 10 10 10',
        //     style: {
        //         'background': 'blue'
        //     },
        // });
        this.gridArea.add(this.grid);
        this.add(this.gridArea);
        //
        // this.addContextMenu();
        this.grid.drawGrid();

    },
    alarmData: function () {

    },
    createTooltip: function () {

    },
    /**
     * '수행 시간'이 설정된 임계치 값에 해당하는 경우 행의 색상을 설정.
     *
     * 색상을 강조하는 옵션이 설정된 경우 설정된 임계치 값을 기준으로 표시처리하며
     * 설정되지 않은 경우에는 색상을 표시하지 않는다.
     * 임계치 값이 설정되지 않은 경우에는 아래의 기본값으로 체크하여 표시한다.
     *
     *  [임계치 기본 값]
     *  0 ~ 3초 미만: Normal
     *  3 ~ 7초 미만: Warning
     *  7초 이상    : Critical
     */
    setRowClassByElapseTime: function () {
        this.grid.pnlExGrid.getView().getRowClass = function (record) {
            if (!this.useActiveTimeColor) {
                return;
            }

            // record.data.elapsedtime (s)
            // this.criticalTime, this.warningTime (ms)
            var cls;
            var eTime = record.data.elapsedtime * 1000;

            if (eTime >= this.criticalTime) {
                cls = 'rtm-txn-row-critical';
            } else if (eTime >= this.warningTime) {
                cls = 'rtm-txn-row-warning';
            } else {
                cls = '';
            }
            return cls;
        }.bind(this);
    },
    /**
     * '수행 시간 비율(%)' 컬럼에 보여지는 스택 바 처리
     *
     * @param {string | number} value
     * @param {object} metaData
     * @param {object} record
     *
     * @return {string}
     */
    gridStackRenderer: function (value, metaData, record) {
        var ewidth, dwidth;

        // var etime = record.get('elapsedtime');
        // var dtime = record.get('dbtime');

        var barWidth = 100;
        var alarmColor = common.Util.getColor('NORMAL');
        // 0 : noraml  1: warning 2: critical
        alarmColor = value === 0 ? common.Util.getColor('NORMAL') : (value === 1 ? common.Util.getColor('WARNING') : common.Util.getColor('CRITICAL') );
        var levelStr = value === 0 ? 'normal' : (value === 1 ? 'warning' : 'critical' );
        var alarmView = '<div id="alarm-content" class="circle-container">';
        alarmView += '<div id="outerC2" class="alarm-circle">';
        alarmView += '<div class="alarm-radius">';
        alarmView += '<span class="'+"alarm-level-place " + levelStr +'" ></span>';
        alarmView += '<span class="'+"border-animation ba1 " + levelStr +'"></span>';
        alarmView += '<span class="'+"border-animation ba2 " + levelStr +'"></span>';
        alarmView += '<span class="'+"border-animation ba3 " + levelStr +'"></span>';
        alarmView += '</div>';
        alarmView += '</div>';
        alarmView += '</div>';

        // <div id="alarm-content" class="circle-container">
        //     <div id="outerC2" class="alarm-circle">
        //     <div class="alarm-radius">
        //     <span class="alarm-level-place "></span>
        //     <span class="border-animation ba1"></span>
        //     <span class="border-animation ba2"></span>
        //     <span class="border-animation ba3"></span>
        //     </div>
        //     </div>
        //     </div>
        return alarmView;
    },

    /**
     * 액티브 트랜잭션 패킷 데이터 로드
     *
     * @param {Object} adata
     */
    onData: function (adata) {
        // 데이타 로드 된 마지막 시간
        this.lastTxnTime = new Date();

        // 새로고침이 체크되어 있는지 확인
        // if (!this.activeTxnRefreshCheck) {
        //     return;
        // }

        if (!this.tempData) {
            this.tempData = [];
        }
        this.tempData = Ext.clone(adata);

        this.drawData(adata);

        adata = null;

    },
    testAlarmData: function () {
        var sapmleData = {
            "product": "eed",
            "time": 1526882759475,
            "type": "alarm",
            "meta": {
                "service_id": "e.g. intermax_1"
            },
            "data": [
                {
                    "instance" : 'TaskTest0',
                    "A1" : Math.floor(Math.random() * 3) ,
                    "A2" : Math.floor(Math.random() * 3) ,
                    "A3" : Math.floor(Math.random() * 3) ,
                    "A4" : Math.floor(Math.random() * 3) ,
                    "A5" : Math.floor(Math.random() * 3) ,
                    "A6" : Math.floor(Math.random() * 3) ,

                },
            ]
        };

        var parserData = sapmleData.data;
        for (var ix = 0 ; ix < 20; ix++) {
            var dataIns =  {
                "instance" : 'TaskTest' + ix,
                "A1" : Math.floor(Math.random() * 3) ,
                "A2" : Math.floor(Math.random() * 3) ,
                "A3" : Math.floor(Math.random() * 3) ,
                "A4" : Math.floor(Math.random() * 3) ,
                "A5" : Math.floor(Math.random() * 3) ,
                "A6" : Math.floor(Math.random() * 3) ,
            }
            parserData.push(dataIns);
        }


        var dataKey = ['instance', 'A1','A2','A3','A4','A5'];


        for (let ix = 0; ix < parserData.length; ix++) {
            let dataObj = parserData[ix];
            let dataset = [];
            for (var key in dataObj) {
                // console.log( key + '=>' + dataObj[key] );
                dataset.push(dataObj[key]);
            }
            this.testData.push(dataset);
        }

        this.testDrawData(this.testData);
    },
    testDrawData: function (data) {

        this.grid.clearRows();
        var instance, A1, A2, A3, A4, A5;


        for (ix = 0, ixLen = data.length; ix < ixLen; ix++) {
            var rowData = data[ix];

            instance = rowData[0];
            A1 = rowData[1];
            A2 = rowData[2];
            A3 = rowData[3];
            A3 = rowData[4];
            A4 = rowData[5];
            A5 = rowData[6];

            // 알람이 들어온지 3초가 지나면 알람을 삭제 처리하는 로직 필요


            this.grid.addRow([
                instance,      // 0 Time
                A1,       // 1
                A2,       // 2
                A3,       // 3
                A4,       // 4
                A5,       // 5

            ]);
        }


        this.grid.drawGrid();
        this.testData = [];
    },
    /**
     * 액티브 트랜잭션 데이터 표시
     *
     * @param {Object} data
     */
    drawData: function (data) {

        if (data == null) {
            this.timerCount++;

            if (this.timerCount > 1 && this.activeTxnRefreshCheck) {
                this.grid.clearRows();
            }
        }

        if (this.grid.pnlExGrid.headerCt == null) {
            return;
        }

        if (!data || !data.rows || data.rows.length <= 0 || !this.activeTxnRefreshCheck) {
            return;
        }

        var d;
        var loginName;
        var browser;
        var bind;

        var ix, ixLen;

        var methodType;
        var startTime;
        var elapseTime;
        var txnCpuTime;
        var dbTime;
        var cpuTime;
        var waitTime;
        var state;
        var instance;
        var ratio, guidDest, dest, guid, splitIdx;
        var txnName, bizTxnName, txnParam;

        this.grid.clearRows();

        for (ix = 0, ixLen = data.rows.length; ix < ixLen; ix++) {
            d = data.rows[ix];

            if (this.monitorType === 'WAS' && Comm.tpIdArr.indexOf(d[1]) !== -1) {
                continue;
            }

            if (this.wasList.indexOf(d[1]) !== -1) {

                if (this.isNotDrawData(d)) {
                    continue;
                }

                loginName = '';
                browser = '';

                if (d[39] !== '') {
                    loginName = d[39].split(' ')[0];
                    browser = d[39].split(' ')[1];
                }

                this.txnInfoList = this.getSplitTxnData(d[5]);

                txnName = this.txnInfoList[0] || '';
                bizTxnName = this.txnInfoList[1] || '';
                txnParam = this.txnInfoList[2] || '';

                bind = this.getBindValue(d[55]);
                methodType = common.Util.codeBitToMethodType(d[41]);
                startTime = new Date(parseInt(d[7]));
                dbTime = (parseInt(d[10]) + parseInt(d[11])) / 1000;
                elapseTime = d[9] / 1000;
                txnCpuTime = parseInt(d[36]) / 1000;
                cpuTime = parseInt(d[10]) / 1000;
                waitTime = parseInt(d[11]) / 1000;
                state = Comm.RTComm.getActiveTxnState(d[17]);
                instance = (Comm.dbInfoObj[d[14]] != null) ? Comm.dbInfoObj[d[14]].instanceName : d[15];
                ratio = (elapseTime > 0) ? Math.round(dbTime / elapseTime * 100) : 0;
                guidDest = (d.length > 56) ? d[56] : '';

                if (guidDest.indexOf('^') !== -1) {
                    guidDest = guidDest.substring(guidDest.indexOf('^') + 1);
                }

                splitIdx = guidDest.indexOf('|');
                if (splitIdx !== -1) {
                    guid = guidDest.substring(0, splitIdx);
                    guid = guid.toLowerCase();
                    dest = guidDest.substring(splitIdx + 1);
                } else {
                    guid = '';
                    dest = guidDest;
                }

                this.grid.addRow([
                    new Date(d[0]),                         // Time
                    d[2],                                   // WAS Name
                    d[5],                                   // Transaction
                    txnName,                                // 트랜잭션 - 트랜잭션 정보
                    bizTxnName,                             // 트랜잭션 - 업무명
                    txnParam,                               // 트랜잭션- 파라미터
                    d[54],                                  // Class Method
                    methodType,                             // Method Type
                    state,                                  // State
                    elapseTime,                             // Elapse Time
                    startTime,                              // Start Time
                    dbTime,                                 // DB Time (CPU Time + Wait Time)
                    waitTime,                               // Wait Time
                    cpuTime,                                // CPU Time
                    100 - ratio,                            // Elapse Time Ration (%)
                    d[6],                                   // Client IP
                    d[13],                                  // Pool Name
                    instance,                               // Instance Name
                    d[16],                                  // SID
                    Ext.isEmpty(d[19]) ? '' : d[18],           // SQLID 1
                    d[19],                                  // SQL Text 1
                    bind,                                   // Bind List
                    d[28],                                  // SQL Exec Count
                    d[30],                                  // Prepare Count
                    d[29],                                  // Fetch Count
                    d[35],                                  // Wait Info
                    Ext.isEmpty(d[21]) ? '' : d[20],           // SQLID 2
                    d[21],                                  // SQL Text 2
                    Ext.isEmpty(d[23]) ? '' : d[22],           // SQLID 3
                    d[23],                                  // SQL Text 3
                    Ext.isEmpty(d[25]) ? '' : d[24],           // SQLID 4
                    d[25],                                  // SQL Text 4
                    Ext.isEmpty(d[27]) ? '' : d[26],           // SQLID 5
                    d[27],                                  // SQL Text 5
                    d[33],                                  // Logical Reads
                    d[34],                                  // Physical Reads
                    d[32],                                  // MEM Usage
                    loginName,                              // Login Name
                    browser,                                // Browser
                    txnCpuTime,                             // Transaction CPU Time
                    d[51],                                  // OS Code
                    d[52],                                  // Bank Code
                    d[53],                                  // Error Code
                    d[3],                                  // TID
                    d[1],                                  // WAS ID
                    dest,                                   // Dest
                    (d.length > 57) ? d[57] : '',            // Dest Hash ID
                    guid                                    // GUID
                ]);
            }
        }

        this.grid.drawGrid();
        this.timerCount = 0;

        this.hideTooltip();

        loginName = null;
        browser = null;
        bind = null;
        methodType = null;
        startTime = null;
        dbTime = null;
        cpuTime = null;
        waitTime = null;
        state = null;
        d = null;
        data = null;
    },


    /**
     * Grid 목록에 표시할 데이터인지 체크.
     *
     * @param {array} data
     * @return {boolean} true - 목록에 표시, false - 목록에 비표시
     */
    isNotDrawData: function (data) {
        var isContinue = false;

        // Check Topology View Dest Filter
        if (this.isFromToRemoteList && !this.filterTxnDest) {
            isContinue = true;
        }

        if (data.length > 57 && this.filterTxnDest && this.filterTxnDest.indexOf(data[57]) === -1) {
            isContinue = true;
        }
        return isContinue;
    },


});
