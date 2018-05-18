Ext.define('common.DataModule', {
    singleton : true,

    init: function() {

        // 어제, 오늘, 내일 일자 공통 변수 설정
        Comm.today = common.Util.getDateFormat(new Date());
        var tmpDate = new Date(Comm.today);
        tmpDate.setDate(tmpDate.getDate()+1);
        tmpDate.setHours(tmpDate.getHours()-9);  // 한국시간대 +9시간에 대한 보정값
        Comm.tomorrow = Number(tmpDate);
        tmpDate.setDate(tmpDate.getDate()-2);
        Comm.yesterday = common.Util.getDateFormat(tmpDate);

        if (!Comm.isRandomMode) {
            Comm.isRandomMode = false;
        }

        Comm.isFirstSelectService = true;
        Comm.callbackAfterSelectService = null;

        Comm.totalTxnCount = [0, 0];
        Comm.totalTxnCountTenMin = 0;
        Comm.currentActiveCount = [0, 0, 0];
        Comm.currentReqRes = [0, 0];

        Comm.onActivityTarget = [];
        Comm.onBizGroupTargets = [];
        Comm.onDayChangeTargets = [];
        Comm.onServiceSelectedTargets = [];
        Comm.onSummaryUpdatedTarget = [];

        Comm.wasStore = common.DataModule.wasStore;
        Comm.wasStoreWithAll = common.DataModule.wasStoreWithAll;

        Comm.wasIdArr   = [];
        Comm.wasNameArr = [];
        Comm.wasInfoObj = {};
        Comm.wasAppType = {};

        Comm.serverInfoObj = {};
        Comm.serverInfoObj.WAS = {};
        Comm.serverInfoObj.TP  = {};
        Comm.serverInfoObj.WEB = {};
        Comm.serverInfoObj.CD = {};

        Comm.tpIdArr   = [];
        Comm.tpNameArr = [];
        Comm.tpInfoObj = {};

        Comm.webIdArr   = [];
        Comm.webNameArr = [];
        Comm.webServersInfo = {};

        Comm.cdIdArr   = [];
        Comm.cdNameArr = [];
        Comm.cdInfoObj = {};

        Comm.tierList = [];
        Comm.tierInfo = {};

        Comm.dbInfoObj   = {};
        Comm.allDBInfo   = {};
        Comm.bizGroups   = [];
        Comm.tpBizGroups = [];              // TP Biz Groups
        Comm.webBizGroups= [];              // Web Biz Groups
        Comm.cdBizGroups = [];              // C Daemon Biz Groups
        Comm.gatherArr   = [];
        Comm.bizGroupWasIdPairObj = {};
        Comm.bizGroupWasNamePairObj = {};   // RT USE
        Comm.topWas = [];
        Comm.hosts = [];
        Comm.webHosts = [];

        Comm.autoScaleHostInfo = {};
        Comm.wasAppTypeFlag = {
            isDotNet: false,
            isJava  : false
        };

        Comm.etoeBizInfos = {};
        Comm.etoeBizMaps  = {};

        Comm.businessRegisterInfo = [];
        Comm.sortTierInfo = [];
        Comm.exclusionInfo = [];
        Comm.metaTreeKey = [];

        Comm.monitoringHosts = [];
        Comm.activateDB = [];
        Comm.selectedServiceInfo = {};
        Comm.serverTimeByWasId = {};

        Comm.RTComm = Ext.create('rtm.src.rtmCommon');
        window.realtime = Comm.RTComm.realtime;

        Comm.selectedWasArr = [];
        Comm.selectedTpArr  = [];
        Comm.selectedWebArr = [];
        Comm.selectedCdArr  = [];

        Comm.txnFilterClientIPArr = [];    // Transaction Monitor Filter IP
        Comm.txnFilterWasIDArr    = [];    // Transaction Monitor Filter WAS ID

        //1501.14 add(min)
        Comm.web_env_info = {} ;
        //1503.12 add(min)
        Comm.sap = {} ;
        Comm.time_zone = {} ;
        //1508.6 add(min)
        Comm.service_type = '' ;

        Comm.poolInfoArr = [];

        Comm.clipboard = document.createElement('input');
        Comm.clipboard.type = 'text';
        Comm.clipboard.style.position = 'absolute';
        Comm.clipboard.style.top = '-40px';
        document.body.appendChild(Comm.clipboard);

        Comm.sqlExecHistory = {
            put: function(sqlJSON, scope) {
                var formId;

                if(scope && scope.scope){
                    scope = scope.scope;
                }

                if (typeof scope === 'undefined') {
                    return;
                }

                if (typeof scope.is === 'undefined' || typeof scope.up === 'undefined') {
                    return;
                }

                if (scope.is('baseform') || scope.is('basewindow') || scope.is('xmbasewindow')) {
                    formId = scope.getId();
                } else if(scope.up('baseform') || scope.up('basewindow') || scope.up('xmbasewindow')) {
                    formId = (scope.up('baseform') || scope.up('basewindow') || scope.up('xmbasewindow')).getId();
                }

                if (typeof this[formId] === 'undefined') {
                    this[formId] = {};
                }

                this[formId][sqlJSON.sql_file] = sqlJSON;

                sqlJSON = null;
            },
            'delete': function(formId) {
                delete this[formId];
            },
            elapsedTime: {}
        };

        // 쿼리, 프로시저 수행 시 복호화 대상이 되는 컬럼명을 설정한다.
        // 지정된 컬럼명이 쿼리에 있는 컬럼명과 다른 경우 추가/변경 하도록 한다.
        // 컬럼데이터가 hex 데이터인 경우 return2hexstring 을 true 설정하고 그렇지 않은 경우 false로 설정.
        Comm.sqlDecrypt = [{
            column_name : 'bind_list',        encrypt_type : 'm-d',    return2hexstring: 'true'
        },{
            column_name : 'bind_list2',       encrypt_type : 'm-d',    return2hexstring: 'true'
        },{
            column_name : 'bind_list3',       encrypt_type : 'm-d',    return2hexstring: 'true'
        },{
            column_name : 'bind_list4',       encrypt_type : 'm-d',    return2hexstring: 'true'
        },{
            column_name : 'bind_list5',       encrypt_type : 'm-d',    return2hexstring: 'true'
        },{
            column_name : 'login_name',       encrypt_type : 'm-d',    return2hexstring: 'false'
        }];

        Comm.dateFormat = {
            HMS     : common.Util.getLocaleType(DisplayTimeMode.HMS),
            HMSMS   : common.Util.getLocaleType(DisplayTimeMode.HMSMS),
            HM      : common.Util.getLocaleType(DisplayTimeMode.HM),
            H       : common.Util.getLocaleType(DisplayTimeMode.H),
            NONE    : common.Util.getLocaleType(DisplayTimeMode.None),
            YM      : common.Util.getLocaleType(DisplayTimeMode.YM),
            HIS     : 'H:i:s',
            HISMS   : 'H:i:s.u'
        };

        if (!Comm.web_env_info['user_id']) {
            Comm.web_env_info['user_id'] = [];
        }

        Comm.web_env_info['user_id'      ] = cfg.login.user_id;        // 47 (unique number)
        Comm.web_env_info['login_id'     ] = cfg.login.login_id;       // id
        Comm.web_env_info['user_name'    ] = cfg.login.user_name;      // name
        Comm.web_env_info['admin_check'  ] = cfg.login.admin_check;    // admin
        Comm.web_env_info['user_services'] = cfg.login.user_services;

        Comm.web_env_info['kill_thread'  ] = cfg.login.permission.kill_thread   ;
        Comm.web_env_info['system_dump'  ] = cfg.login.permission.system_dump   ;
        Comm.web_env_info['memory_leak'  ] = cfg.login.permission.memory_leak   ;
        Comm.web_env_info['property_load'] = cfg.login.permission.property_load ;
        Comm.web_env_info['bind']          = cfg.login.permission.bind ;

        // if(!Comm.isWooriDash){
        //     common.WebEnv.init();
        // }
    },

    afterSelectService: function(serviceIds, callback) {
        var me = this;

        console.debug('%c [DataModule]  Loading WAS Info...', 'color:#63A5E0;');

        Comm.serviceid = serviceIds;

        var useWasSQL = (common.Menu.isAutoIDScaleVersion)? 'IMXRT_UserWas_AutoID.sql' : 'IMXPA_UserWas.sql';

        WS.SQLExec({
            //sql_file: 'IMXPA_UserWas.sql',
            sql_file: useWasSQL,
            replace_string: [{
                name: 'user_id', value: Comm.web_env_info.user_id
            },{
                name: 'service_id', value: serviceIds.join(',')
            }]
        }, function(header, data) {
            var ix, ixLen;
            var hostData,
                serverId, serverName,
                appType, type;

            if (callback) {
                callback();
            }

            if (header && header.success === false && !data) {
                console.debug('%c [DataModule] [ERROR] Failed to retrieve the data of WAS.', 'color:white;background-color:red;font-weight:bold;', header.message);
                return;
            }

            if (data[0].rows.length <= 0) {
                console.debug('%c [DataModule] [ERROR] Agent is not set to the selected service.', 'color:white;background-color:red;font-weight:bold;');
                common.Util.showMessage(
                    common.Util.TR('ERROR'),
                    common.Util.TR('Agent is not set to the selected service.'),
                    Ext.Msg.OK, Ext.MessageBox.ERROR,
                    function() {
                        localStorage.setItem('Intermax_login', false);
                        parent.location.href = location.origin + '/'+location.pathname.split('/')[1];
                    });
                return;
            }

            console.debug('%c [DataModule]  Loading WAS Info... Complete', 'color:blue;');

            Comm.wasStore.fireEvent('ondata', data[0]);

            for (ix in data[0].rows) {
                if (data[0].rows.hasOwnProperty(ix)) {
                    serverId   = data[0].rows[ix][0];
                    serverName = data[0].rows[ix][1];
                    appType    = data[0].rows[ix][2];
                    type       = data[0].rows[ix][3];

                    realtime.WasNames.push(serverName);
                    Comm.wasInfoObj[serverId] = {wasName: serverName};
                    Comm.wasIdArr[Comm.wasIdArr.length] = serverId;
                    Comm.wasNameArr[Comm.wasNameArr.length] = serverName;
                    Comm.selectedWasArr[Comm.selectedWasArr.length] = serverId;

                    Comm.serverInfoObj.WAS[serverId] = Comm.wasInfoObj[serverId];

                    Comm.wasAppType[serverId] = appType;
                    Comm.wasInfoObj[serverId].isDotNet = (appType === 'NET');

                    // C API Data
                    if (type === 'APIM') {
                        Comm.wasInfoObj[serverId].type = 'CD';
                        Comm.serverInfoObj.CD[serverId] = Comm.cdInfoObj[serverId];

                        Comm.cdIdArr.push(serverId);
                        Comm.cdNameArr.push(serverName);
                        Comm.selectedCdArr.push(serverId);

                        Comm.cdInfoObj[serverId] = {
                            id  : serverId,
                            name: serverName,
                            type: 'CD'
                        };
                        Comm.serverInfoObj.CD[serverId] = Comm.cdInfoObj[serverId];
                    }
                }
            }

            // 160704 LSM
            if (realTimeWS != null) {
                realTimeWS.send({
                    command: COMMAND.TIMEZONE,
                    data: {
                        wasIdAddr: Comm.wasIdArr.join(','),
                        repository: Comm.currentRepositoryInfo.database_name
                    }
                });
            }

            //1506.8 add (min)
            for (ix in data[1].rows) {
                if(data[1].rows.hasOwnProperty(ix)){
                    Comm.config.login.wasInfoObj[data[1].rows[ix][0]] = {wasName: data[1].rows[ix][1]};
                }
            }
            ix = null;

            // 160426 KJY : Monitoring Process Host
            if (data.length > 2) {
                hostData = data[2].rows;
                for (ix = 0, ixLen = hostData.length; ix < ixLen; ix++) {
                    if(hostData[ix][2] != -1){
                        Comm.monitoringHosts[Comm.monitoringHosts.length] = [hostData[ix][0], hostData[ix][1], hostData[ix][2]];
                    }
                }

                if (realTimeWS != null) {
                    realTimeWS.send({
                        command: COMMAND.ADD_HOST,
                        data: {
                            hostInfos: Comm.monitoringHosts
                        }
                    });
                }
            }

            if (data.length > 3) {
                hostData = data[3].rows;
                for (ix = 0, ixLen = hostData.length; ix < ixLen; ix++) {
                    if (!Comm.autoScaleHostInfo[hostData[ix][0]]) {
                        Comm.autoScaleHostInfo[hostData[ix][0]] = [];
                    }

                    if (Comm.autoScaleHostInfo[hostData[ix][0]].indexOf(hostData[ix][1]) === -1) {
                        Comm.autoScaleHostInfo[hostData[ix][0]].push(hostData[ix][1]);
                    }
                }
            }

            for (var jx = 0, jxLen = realtime.flags.length; jx < jxLen; jx++) {
                realtime.flags[jx] = false;
            }

            for (ix in Comm.wasInfoObj) {
                if (Comm.wasInfoObj[ix].isDotNet) {
                    Comm.wasAppTypeFlag.isDotNet = true;
                }

                if (!Comm.wasInfoObj[ix].isDotNet) {
                    Comm.wasAppTypeFlag.isJava = true;
                }
            }

            setJVMName();

            getLoadData();

            if(common.Menu.isBusinessPerspectiveMonitoring){
                getBizPerspectiveInfo();
            }
        });

        function getLoadData() {
            var wasid_temp = '';
            for (var ix = 0; ix < Comm.wasIdArr.length; ix++) {
                if (wasid_temp == '') {
                    wasid_temp = '\'' + Comm.wasIdArr[ix].toString() + '\'';
                } else {
                    wasid_temp += ', \'' + Comm.wasIdArr[ix].toString() + '\'';
                }
            }

            console.debug('%c [DataModule]  Loading Base Info...', 'color:#63A5E0;');

            if (Comm.callbackAfterSelectService !== null) {
                Comm.callbackAfterSelectService.call();
            }

            var result = null;
            var baseInfoSQL = (common.Menu.isAutoIDScaleVersion)? 'IMXRT_BaseInfo_AutoID.sql' : 'IMXRT_BaseInfo.sql';

            WS.SQLExec({
                replace_string: [{
                    name: 'serviceid', value: String(serviceIds.join(','))
                }, {
                    name: 'wasid', value: Comm.wasIdArr.join(',')
                }, {
                    name: 'wasid_str', value: wasid_temp
                }, {
                    name: 'user_id', value: Comm.web_env_info.user_id
                }],
                bind: [{
                    name: 'loginid', value: cfg.login.login_id
                }],
                //sql_file: 'IMXRT_BaseInfo.sql'
                sql_file: baseInfoSQL
            }, function(header, data) {
                var temp;
                var i, jx, jxLen;
                var serverId, serverName, serverHost, serverType, hostName;

                if (header && header.success === false && !data) {
                    console.debug('%c [DataModule] [ERROR] Failed to retrieve the data of Base Configuration.', 'color:white;background-color:red;font-weight:bold;', header.message);
                    return;
                }

                console.debug('%c [DataModule]  Loading Base Info... Complete', 'color:blue;');

                for (var ix = 0; ix < data.length; ix++) {
                    switch (ix) {
                        case 0 :
                            result = data[ix].rows;
                            for (i in result) {
                                if(result.hasOwnProperty(i)){
                                    temp = result[i][0];
                                    !Array.isArray( Comm.bizGroupWasIdPairObj[temp] )
                                        ? Comm.bizGroupWasIdPairObj[temp] = ([]) : ({});

                                    !Array.isArray(Comm.bizGroupWasNamePairObj[temp])
                                        ? Comm.bizGroupWasNamePairObj[temp] = ([]) : ({});
                                    Comm.bizGroupWasNamePairObj[temp].push([result[i][1], result[i][2]]);

                                    Comm.bizGroupWasIdPairObj[temp].push(result[i][1]);

                                    if (result[i][3] === 'TP' && Comm.tpBizGroups.indexOf(temp) === -1) {
                                        Comm.tpBizGroups.push(temp);

                                    } else if (result[i][3] === 'APIM' && Comm.cdBizGroups.indexOf(temp) === -1) {
                                        Comm.cdBizGroups.push(temp);
                                    }
                                }
                            }
                            i = null  ;

                            for (i in Comm.bizGroupWasIdPairObj) {
                                if(Comm.bizGroupWasIdPairObj.hasOwnProperty(i)){
                                    Comm.bizGroups.push(i);
                                }
                            }
                            i = null  ;

                            for (i in Comm.onBizGroupTargets) {
                                if(Comm.onBizGroupTargets.hasOwnProperty(i)){
                                    Comm.onBizGroupTargets[i].fireEvent('onBizGroup');
                                }
                            }
                            i = null  ;

                            realtime.flags[0] = true;
                            break;
                        case 1 :
                            result = data[ix].rows;
                            for (i in result) {
                                if(result.hasOwnProperty(i)){
                                    if ( Comm.hosts.indexOf( result[i][0] ) > -1 ) {
                                        continue ;
                                    }
                                    Comm.hosts.push(result[i][0]);
                                }
                            }
                            realtime.flags[1] = true;
                            i = null  ;
                            break;
                        case 2 :
                            result = data[ix].rows;
                            for (jx = 0, jxLen = result.length; jx < jxLen; jx++) {
                                Comm.activateDB.push([result[jx][0], result[jx][1]]);
                            }
                            realtime.flags[2] = true;
                            break;
                        case 3 :
                            for (i in data[ix].rows) {
                                if(data[ix].rows.hasOwnProperty(i)){
                                    if (+data[ix].rows[i][4] === 1) {
                                        Comm.dbInfoObj[data[ix].rows[i][0]] = {
                                            instanceName: data[ix].rows[i][1],
                                            db_type : data[ix].rows[i][2],
                                            db_id   : data[ix].rows[i][0],
                                            dbAddr  : data[ix].rows[i][3],
                                            host_ip : data[ix].rows[i][5] || '',
                                            sid     : data[ix].rows[i][6] || '',
                                            port    : data[ix].rows[i][7] || ''
                                        };
                                    }
                                    Comm.allDBInfo[data[ix].rows[i][0]] = {
                                        instanceName: data[ix].rows[i][1],
                                        db_type : data[ix].rows[i][2],
                                        db_id   : data[ix].rows[i][0],
                                        dbAddr  : data[ix].rows[i][3],
                                        host_ip : data[ix].rows[i][5] || '',
                                        sid     : data[ix].rows[i][6] || '',
                                        port    : data[ix].rows[i][7] || ''
                                    };
                                }
                            }
                            i = null  ;

                            me.isLoadedDbList = true;
                            for (var store in me.deferredLoadDbStores) {
                                if(me.deferredLoadDbStores.hasOwnProperty(store)){
                                    me.deferredLoadDbStores[store].fireEvent('ondata', Comm.dbInfoObj);
                                }
                            }

                            realtime.flags[3] = true;
                            store = null;
                            break;
                        case 4 :
                            result = data[ix].rows;
                            for (jx = 0, jxLen = result.length; jx < jxLen; jx++) {
                                Comm.topWas.push([result[jx][0], result[jx][1]]);
                            }
                            realtime.flags[4] = true;
                            break;
                        case 5 :
                            result = data[ix].rows;
                            for (jx = 0, jxLen = result.length; jx < jxLen; jx++) {
                                Comm.gatherArr.push([result[jx][0], result[jx][1], result[jx][2], result[jx][3]]);
                            }
                            realtime.flags[5] = true;
                            break;
                        case 6 :
                            realtime.RemoteDiff = data[ix].rows[0][0];
                            realtime.flags[6] = true;
                            break;
                        case 7 :
                            result = data[ix].rows;
                            realtime.ActiveTxnStateArr.length = 0;
                            for (jx = 0, jxLen = result.length; jx < jxLen; jx++) {
                                realtime.ActiveTxnStateArr.push([result[jx][0], result[jx][1]]);
                            }
                            realtime.flags[7] = true;
                            break;
                        case 8 :
                            realtime.lastestTime = data[ix].rows[0][0];
                            realtime.serverLoggingTime = data[ix].rows[0][0];
                            realtime.flags[8] = true;
                            break;
                        case 9 :
                            result = data[ix].rows;
                            Comm.bizGroups.length = 0;
                            realtime.WasMode = true;
                            for (jx = 0, jxLen = result.length; jx < jxLen; jx++) {
                                if (Comm.bizGroups.indexOf(result[jx][0]) === -1) {
                                    Comm.bizGroups.push(result[jx][0]);
                                }
                            }
                            if (Comm.bizGroups.length > 0) {
                                realtime.WasMode = false;
                            }
                            realtime.flags[9] = true;
                            jx = null;
                            break;
                        case 10 :
                            // Wev Env
                            realtime.flags[10] = true;
                            break;
                        case 11 :
                            result = data[ix].rows;
                            realtime.HostRelWAS.length    = 0;
                            realtime.HostRelServer.length = 0;

                            realtime.CDHostList.length = 0;

                            var license;
                            for (jx = 0, jxLen = result.length; jx < jxLen; jx++) {
                                hostName = result[jx][0];
                                serverId = result[jx][1];
                                license  = result[jx][2];

                                realtime.HostRelWAS.push([hostName, serverId, license]);
                                realtime.HostRelServer.push([hostName, serverId, license]);

                                // C API Host Data
                                if (Comm.cdIdArr.indexOf(serverId) !== -1 && realtime.CDHostList.indexOf(hostName) === -1) {
                                    realtime.CDHostList.push(hostName);
                                    Comm.cdInfoObj[serverId].host = hostName;
                                }

                            }
                            realtime.flags[11] = true;
                            break;

                        case 12 :
                            result = data[ix].rows;
                            realtime.TPHostList.length = 0;
                            realtime.TPWasList.length = 0;
                            realtime.TPList.length = 0;

                            for (jx = 0, jxLen = result.length; jx < jxLen; jx++) {
                                realtime.TPList.push([result[jx][0], result[jx][1]]);
                                realtime.TPWasList.push(result[jx][1]);

                                if (realtime.TPHostList.indexOf(result[jx][0]) === -1) {
                                    realtime.TPHostList.push(result[jx][0]);
                                }

                                Comm.tpIdArr.push(result[jx][1]);
                                Comm.tpNameArr.push(result[jx][2]);
                                Comm.selectedTpArr.push(result[jx][1]);
                                Comm.tpInfoObj[result[jx][1]] = {
                                    id  : result[jx][1],
                                    name: result[jx][2],
                                    host: result[jx][0]
                                };

                                if (Comm.wasInfoObj[result[jx][1]]) {
                                    Comm.wasInfoObj[result[jx][1]].type = 'TP';
                                }

                                Comm.serverInfoObj.TP[[result[jx][1]]] = Comm.tpInfoObj[result[jx][1]];
                            }

                            var keys = Object.keys(Comm.wasInfoObj);
                            for (jx=0, jxLen=keys.length; jx<jxLen; jx++) {
                               if(!Comm.wasInfoObj[keys[jx]].type) {
                                   Comm.wasInfoObj[keys[jx]].type = 'WAS';
                               }
                            }

                            realtime.flags[12] = true;
                            break;

                        case 13 :
                            result = data[ix].rows;
                            if ( result.length > 0 ){

                                Comm.sap['top'] = false ;
                                for (jx = 0, jxLen = result.length; jx < jxLen; jx++ ){
                                    temp = result[jx][0];

                                    !Array.isArray(Comm.sap[temp]) ? Comm.sap[temp] = ([]) : ({});
                                    if ( result[jx][3] == 'WP' ) {
                                        Comm.sap['top'] = true ;
                                    }
                                    Comm.sap[temp].push([result[jx][1], result[jx][2], result[jx][3]]);
                                }
                                jx = null ;

                            }
                            realtime.flags[13] = true;
                            break ;

                        case 14 :
                            result = data[ix].rows;
                            for (i in result) {
                                if(result.hasOwnProperty(i)){
                                    Comm.poolInfoArr[Comm.poolInfoArr.length] = {
                                        was_id   : result[i][0],
                                        pool_id  : result[i][1],
                                        pool_name: result[i][2]
                                    };
                                }
                            }
                            realtime.flags[14] = true;
                            break ;

                        case 15 : //timezone(was)
                        case 16 : //timezone(db)
                        case 17 : //timezone(ws)
                            result = data[ix].rows ;

                            for (jx = 0, jxLen = result.length; jx < jxLen; jx++ ){
                                if ( Comm.time_zone[result[jx][0]] == undefined ) {
                                    Comm.time_zone[result[jx][0]] = [] ;
                                }
                                if ( result[jx][2] == null || result[jx][2] == '' ) {
                                    result[jx][2] = 0 ;
                                }
                                Comm.time_zone[result[jx][0]] = result[jx][2] ;
                            }
                            jx = null ;
                            realtime.flags[15] = true;
                            break ;

                        case 18: //service_info(sap or not)
                            result = data[ix].rows ;

                            for (jx = 0, jxLen = result.length; jx < jxLen; jx++ ) {
                                Comm.service_type = result[jx][2] ;
                            }
                            realtime.flags[16] = true;
                            break;

                        case 20:
                            result = data[ix].rows ;
                            realtime.WebHostList.length = 0;
                            var isWebToB;

                            for (jx = 0, jxLen = result.length; jx < jxLen; jx++ ) {
                                // id, name, host, ip
                                serverId   = result[jx][0];
                                serverName = result[jx][1];
                                serverHost = result[jx][2];
                                serverType = result[jx][4];

                                isWebToB = false;

                                if (serverType === 'WEBTOB') {
                                    window.isWebToB = true;
                                    isWebToB        = true;
                                }

                                Comm.webServersInfo[serverId] = {
                                    id    : serverId,
                                    name  : serverName,
                                    host  : serverHost,
                                    ip    : result[jx][3],
                                    isWTB : isWebToB
                                };

                                realtime.HostRelWeb.push([serverHost, serverId, '']);
                                realtime.HostRelServer.push([serverHost, serverId, '']);

                                if (Comm.webIdArr.indexOf(serverId) === -1) {
                                    Comm.webIdArr.push(serverId);
                                    Comm.selectedWebArr.push(serverId);
                                }
                                if (Comm.webNameArr.indexOf(serverName) === -1) {
                                    Comm.webNameArr.push(serverName);
                                }
                                if (realtime.WebHostList.indexOf(serverHost) === -1) {
                                    realtime.WebHostList.push(serverHost);
                                    Comm.webHosts.push(serverHost);
                                }

                                Comm.serverInfoObj.WEB[serverId] = Comm.webServersInfo[serverId];
                            }
                            realtime.flags[17] = true;
                            break;

                        default:
                            break;
                    }
                }
                temp = null;
                result = null;
            });
        }

        /**
         * IMXRT_BaseInfo.sql의 멀티 sql의 수가 많아서 별로도 분기를 해서 업무 관점 모니터링 관련 데이터를 받도록 추가.
         */
        function getBizPerspectiveInfo(){
            var dataSet = {};

            dataSet.sql_file = 'IMXRT_GetBizPerspectiveInfo.sql';

            dataSet.replace_string = [{
                name: 'serviceid',
                value: String(serviceIds.join(','))
            },{
                name: 'user_id',
                value: Comm.web_env_info.user_id
            }];

            if(common.Util.isMultiRepository()){
                dataSet.database = cfg.repositoryInfo.currentRepoName;
            }
            WS.SQLExec(dataSet, function(aheader, adata){
                var bizRegisterInfo = adata[0].rows;
                var bizId, bizName, parentId, level, parentBizId,
                    ix, ixLen, jx, jxLen,
                    parentInfo = [], childInfo = [], childList = [];

                for (ix = 0, ixLen = bizRegisterInfo.length; ix < ixLen; ix++) {
                    bizId     = bizRegisterInfo[ix][0];
                    bizName   = bizRegisterInfo[ix][1];
                    parentId  = bizRegisterInfo[ix][2];
                    level     = bizRegisterInfo[ix][3];

                    Comm.etoeBizInfos[bizId] = {id: bizId, name: bizName};

                    if (level === 1) {
                        parentInfo.push({ bizId : bizId, bizName : bizName });

                        if (!Comm.etoeBizMaps[bizId]) {
                            Comm.etoeBizMaps[bizId] = [];
                        }

                    } else if (level === 2) {
                        for( jx = 0, jxLen = parentInfo.length; jx < jxLen; jx++ ){
                            parentBizId = parentInfo[jx].bizId;

                            if(parentBizId === parentId){
                                childInfo.push({parentBizId: parentBizId, bizId: bizId, bizName : bizName});
                            }
                        }

                        if (Comm.etoeBizMaps[parentId] && Comm.etoeBizMaps[parentId].indexOf(bizId) === -1) {
                            Comm.etoeBizMaps[parentId].push(bizId);
                        }

                    } else if (level === 3) {
                        var subBizIdList;
                        var topBizIdArr = Object.keys(Comm.etoeBizMaps);

                        for( jx = 0, jxLen = topBizIdArr.length; jx < jxLen; jx++ ) {
                            subBizIdList = Comm.etoeBizMaps[topBizIdArr[jx]];

                            if (subBizIdList && subBizIdList.length > 0 && subBizIdList.indexOf(parentId) !== -1 &&
                                subBizIdList.indexOf(bizId) === -1) {
                                subBizIdList.push(bizId);
                            }
                        }
                    }
                }

                for(ix = 0, ixLen = parentInfo.length; ix < ixLen; ix++){
                    for(jx = 0, jxLen = childInfo.length; jx < jxLen; jx++){
                        if( parentInfo[ix].bizId === childInfo[jx].parentBizId ){
                            childList.push(childInfo[jx]);
                        }
                    }
                    Comm.businessRegisterInfo.push({parent : parentInfo[ix], child: childList});
                    childList = [];
                }

                /////////////////////////////////////////////////////////////////////////////////
                var tierSortInfo = adata[1].rows;
                var tierId, tierName;
                for(ix = 0, ixLen = tierSortInfo.length; ix < ixLen; ix++){
                    tierId     = tierSortInfo[ix][0];
                    tierName   = tierSortInfo[ix][1];

                    Comm.sortTierInfo.push({tierId : tierId, tierName: tierName});
                }
                /////////////////////////////////////////////////////////////////////////////////
                var exclusionData = adata[2].rows;
                var nextBizId, beforeBizId;
                var tierList = [];
                var obj = {};
                obj.bizId = [];
                obj.tierList = [];

                for(ix = 0, ixLen = exclusionData.length; ix < ixLen; ix++){
                    bizId       = exclusionData[ix][0];
                    tierId      = exclusionData[ix][1];
                    if(exclusionData.length === 1){
                        tierList.push(exclusionData[ix][1]);
                        obj.bizId.push(bizId);
                        obj.tierList.push(tierList);
                    } else if(exclusionData[ix+1]){
                        nextBizId   = exclusionData[ix+1][0];

                        tierList.push(exclusionData[ix][1]);

                        if(bizId === nextBizId){
                            continue;
                        }

                        if(bizId !== nextBizId){
                            obj.bizId.push(bizId);
                            obj.tierList.push(tierList);
                            tierList = [];
                        }
                    } else{
                        beforeBizId = exclusionData[ix-1][0];
                        if(bizId === beforeBizId){
                            tierList.push(exclusionData[ix][1]);
                            obj.bizId.push(bizId);
                            obj.tierList.push(tierList);
                        } else {
                            obj.bizId.push(bizId);
                            obj.tierList.push(tierList);
                        }
                    }
                }

                for( ix = 0, ixLen = obj.bizId.length; ix < ixLen; ix++ ){
                    Comm.exclusionInfo.push({businessId : obj.bizId[ix], tierId: obj.tierList[ix]});
                }

                ////////////////////////////////////////////////////////////////////////////////////////////////////////
                var metaTreeKey = adata[3].rows;
                var treeKey;

                for(ix = 0, ixLen = metaTreeKey.length; ix < ixLen; ix++){
                    treeKey     = metaTreeKey[ix][0];

                    Comm.metaTreeKey.push(treeKey);
                }
            });
        }

        /**
         * JVM의 지표의 경우는 Comm.wasAppTypeFlag.isDotNet, Comm.wasAppTypeFlag.isJava 이용해 네임이 세팅되어야 함으로 추후에 따로 세팅하는 함수
         * M_rtmUsageJVMCpu 텍스트도 마찬가지.
         */
        function setJVMName(){
            var jvmStatNameObj = {
                'JVM_CPU_USAGE'    : common.Util.CTR('JVM CPU Usage (%)'),
                'JVM_FREE_HEAP'    : common.Util.CTR('JVM Free Heap (MB)'),
                'JVM_HEAP_SIZE'    : common.Util.CTR('JVM Heap Size (MB)'),
                'JVM_USED_HEAP'    : common.Util.CTR('JVM Used Heap (MB)'),
                'JVM_MEM_SIZE'     : common.Util.CTR('JVM Memory Size (MB)'),
                'JVM_HEAP_USAGE'   : common.Util.CTR('JVM Heap Usage (%)'),
                'JVM_THREAD_COUNT' : common.Util.CTR('JVM Thread Count'),
                'JVM_GC_COUNT'     : common.Util.CTR('JVM GC Count'),
                'JVM_GC_TIME'      : common.Util.CTR('JVM GC Time (Sec)')
            };

            var ix, ixLen;

            for (ix = 0, ixLen = realtime.defaultWasStatName.length; ix < ixLen; ix++) {
                if (jvmStatNameObj[realtime.defaultWasStatName[ix].id]) {
                    realtime.defaultWasStatName[ix].name = jvmStatNameObj[realtime.defaultWasStatName[ix].id];
                }
            }

            for (ix = 0, ixLen = realtime.InfoWasStatName.length; ix < ixLen; ix++) {
                if (jvmStatNameObj[realtime.InfoWasStatName[ix].id]) {
                    realtime.InfoWasStatName[ix].name = jvmStatNameObj[realtime.InfoWasStatName[ix].id];
                }
            }

            $("#M_rtmUsageJVMCpu span").text(common.Util.TR('JVM CPU Usage'));
        }
    },

    // 최초 설치시 서비스가 등록되지 않은 상태에서 게더 리스트를 가져올 수 있는
    // 방법이 없으므로 afterSelectService 내부에 있는 게더 리스트를 가져오는
    // 함수 하나만 밖으로 꺼내온다.
    getGatherList: function(databaseName) {
        Comm.gatherArr.length = 0;
        WS.SQLExec({
            sql_file: 'IMXCFG_GatherInfo.sql',
            database: databaseName
        }, function(aheader, adata) {

            if (aheader && aheader.success === false && !adata) {
                console.debug('%c [DataModule] [ERROR] Failed to retrieve the gather list.', 'color:white;background-color:red;font-weight:bold;', aheader.message);
                return;
            }

            var result;
            for (var ix = 0, ixLen = adata.rows.length; ix < ixLen; ix++) {
                result = adata.rows[ix];
                Comm.gatherArr.push([result[0], result[1], result[2], result[3]]);
            }

        });
    },

    /**
     * 테이블스페이스 정보를 보여줄 DB 목록
     */
    getTablespaceDBList: function(callback) {
        Comm.tablespaceDB = [];
        WS.SQLExec({
            sql_file : 'IMXRT_Tablespace_DBList.sql',
            replace_string: [{
                name: 'wasid', value: Comm.wasIdArr.join(',')
            }]
        }, function(aheader, adata) {

            if (aheader && aheader.success === false && !adata) {
                console.debug('%c [DataModule] [ERROR] Failed to retrieve the data of Tablespace.', 'color:white;background-color:red;font-weight:bold;', aheader.message);
                return;
            }

            for (var ix = 0; ix < adata.rows.length; ix++) {
                Comm.tablespaceDB[Comm.tablespaceDB.length] = [adata.rows[ix][0], adata.rows[ix][1]];
            }
            if (callback) {
                callback();
            }
        });
    },

    wasStore: Ext.create('Exem.Store', {
        storeId  : 'wasStore',
        listeners: {
            ondata : function(data) {
                this.loadData(data.rows);
                Comm.wasStoreWithAll.loadData(data.rows);
                Comm.wasStoreWithAll.insert(0, {'1' : '(All)', '2' : '(All)'});
            }
        }
    }),

    wasStoreWithAll: Ext.create('Exem.Store', {
        storeId : 'wasStoreWithAll'
    }),

    isLoadedDbList: false,
    deferredLoadDbStores: [],
    getDbStore: function(afterLoadCallback, scope, isDeferred) {
        var store = Ext.create('Exem.Store', {
            listeners: {
                ondata: function(dbInfoObj) {
                    for (var i in dbInfoObj) {
                        if(dbInfoObj.hasOwnProperty(i)){
                            this.add({'1': i, '2': dbInfoObj[i].instanceName});
                        }
                    }

                    if (afterLoadCallback && isDeferred) {
                        setTimeout(function() { afterLoadCallback.call(scope); }, 10);
                    } else if (afterLoadCallback) {
                        afterLoadCallback.call(scope);
                    }
                }
            }
        });

        if (this.isLoadedDbList) {
            store.fireEvent('ondata', Comm.dbInfoObj);
        } else {
            this.deferredLoadDbStores.push(store);
        }

        return store;
    },

    referenceToDB: {
        eventName: '\'' + 'pmon timer' + '\'' +',' +
        '\'' +'rdbms ipc message'+ '\'' +',' +
        '\'' +'SQL*Net more data from client'+ '\'' +',' +
        '\'' +'SQL*Net more data to client'+ '\'' +',' +
        '\'' +'SQL*Net break/reset to client'+ '\'' +',' +
        '\'' +'wait for unread message on broadcast channel'+ '\'' +',' +
        '\'' +'wait for unread message on multiple broadcast channels'+ '\'' +',' +
        '\'' +'ges remote message'+ '\'' +',' +
        '\'' +'ges reconfiguration to start'+ '\'' +',' +
        '\'' +'gcs remote message'+ '\'' +',' +
        '\'' +'PX Deq: Par Recov Reply'+ '\'' +',' +
        '\'' +'PX Deq: Par Recov Execute'+ '\'' +',' +
        '\'' +'PX Deq: Par Recov Change Vector'+ '\'' +',' +
        '\'' +'wait for activate message'+ '\'' +',' +
        '\'' +'wakeup event for builder'+ '\'' +',' +
        '\'' +'wakeup event for preparer'+ '\'' +',' +
        '\'' +'wakeup event for reader'+ '\'' +',' +
        '\'' +'wait for transaction'+ '\'' +',' +
        '\'' +'parallel recovery coordinator waits for cleanup of slaves'+ '\'' +',' +
        '\'' +'smon timer'+ '\'' +',' +
        '\'' +'PX Deq: Txn Recovery Start'+ '\'' +',' +
        '\'' +'PX Deq: Txn Recovery Reply'+ '\'' +',' +
        '\'' +'statement suspended, wait error to be cleared'+ '\'' +',' +
        '\'' +'PX Deq: Index Merge Reply'+ '\'' +',' +
        '\'' +'PX Deq: Index Merge Execute'+ '\'' +',' +
        '\'' +'PX Deq: Index Merge Close'+ '\'' +',' +
        '\'' +'PX Deq: kdcph_mai'+ '\'' +',' +
        '\'' +'PX Deq: kdcphc_ack'+ '\'' +',' +
        '\'' +'PX Deq: Signal ACK'+ '\'' +',' +
        '\'' +'PX Deq Credit: send blkd'+ '\'' +',' +
        '\'' +'virtual circuit status'+ '\'' +',' +
        '\'' +'dispatcher timer'+ '\'' +',' +
        '\'' +'jobq slave wait'+ '\'' +',' +
        '\'' +'pipe get'+ '\'' +',' +
        '\'' +'PX Deque wait'+ '\'' +',' +
        '\'' +'PX Idle Wait'+ '\'' +',' +
        '\'' +'PX Deq Credit: need buffer'+ '\'' +',' +
        '\'' +'PX Deq: Msg Fragment'+ '\'' +',' +
        '\'' +'PX Deq: Parse Reply'+ '\'' +',' +
        '\'' +'PX Deq: Execute Reply'+ '\'' +',' +
        '\'' +'PX Deq: Execution Msg'+ '\'' +',' +
        '\'' +'PX Deq: Table Q Normal'+ '\'' +',' +
        '\'' +'PX Deq: Table Q Sample'+ '\'' +',' +
        '\'' +'single-task message'+ '\'' +',' +
        '\'' +'SQL*Net message from client'+ '\'' +',' +
        '\'' +'PL/SQL lock timer'+ '\'' +',' +
        '\'' +'queue messages'+ '\'' +',' +
        '\'' +'wakeup time manager'+ '\'' +',' +
        '\'' +'AQ Proxy Cleanup Wait'+ '\'' +',' +
        '\'' +'Queue Monitor Wait'+ '\'' +',' +
        '\'' +'Queue Monitor Slave Wait'+ '\'' +',' +
        '\'' +'Queue Monitor Shutdown Wait'+ '\'' +',' +
        '\'' +'Queue Monitor IPC wait'+ '\'' +',' +
        '\'' +'STREAMS apply coord waiting for slave message'+ '\'' +',' +
        '\'' +'STREAMS fetch slave waiting for txns'+ '\'' +',' +
        '\'' +'STREAMS apply slave idle wait'+ '\'' +',' +
        '\'' +'STREAMS capture process filter callback wait for ruleset'+ '\'' +',' +
        '\'' +'waiting for subscribers to catch up'+ '\'' +',' +
        '\'' +'waiting for low memory condition to be resolved'+ '\'' +',' +
        '\'' +'HS message to agent'+ '\'' +',' +
        '\'' +'JS external job'+ '\'' +',' +
        '\'' +'pipe get'+ '\'' +',' +
        '\'' +'queue messages'+ '\'' +',' +
        '\'' +'client message'+ '\'' +',' +
        '\'' +'dispatcher listen timer'+ '\'' +',' +
        '\'' +'gcs for action'+ '\'' +',' +
        '\'' +'i/o slave wait'+ '\'' +',' +
        '\'' +'lock manager wait for remote message'+ '\'' +',' +
        '\'' +'null event'+ '\'' +',' +
        '\'' +'parallel dequeue wait'+ '\'' +',' +
        '\'' +'PX Deq Execution Msg'+ '\'' +',' +
        '\'' +'PX Deq Table Q Normal'+ '\'' +',' +
        '\'' +'Parallel Query Idle Wait Slaves'+ '\'' +',' +
        '\'' +'queue messages'+ '\'' +',' +
        '\'' +'slave wait'+ '\'' +',' +
        '\'' +'DIAG idle wait'+ '\'' +',' +
        '\'' +'SQL*Net message from client'+ '\'' +',' +
        '\'' +'SQL*Net message to client'+ '\'' +',' +
        '\'' +'Streams AQ: qmn coordinator idle wait'+ '\'' +',' +
        '\'' +'Streams AQ: qmn slave idle wait'+ '\'' +',' +
        '\'' +'Streams AQ: waiting for time management or cleanup tasks'+ '\'' +',' +
        '\'' +'Streams AQ: waiting for messages in the queue'+ '\'' +',' +
        '\'' +'Streams AQ: waiting for time management or cleanup tasks'+ '\'' +',' +
        '\'' +'Streams AQ: delete acknowledged messages'+ '\'' +',' +
        '\'' +'Streams AQ: deallocate messages from Streams Pool'+ '\'' +',' +
        '\'' +'Streams AQ: qmn coordinator idle wait'+ '\'' +',' +
        '\'' +'Streams AQ: qmn slave idle wait'+ '\'' +',' +
        '\'' +'Streams AQ: RAC qmn coordinator idle wait'+ '\'' +',' +
        '\'' +'virtual circuit status'+ '\'' ,

        ratioName: [
            'Buffer Cache Hit Ratio'  ,
            'Buffer Busy Wait Ratio'          ,
            'Free Buffer Wait Ratio'          ,
            'Disk Sort Ratio'                 ,
            'Rows per Sort'                   ,
            'Cursors Opened per Transaction'  ,
            'Recursive to User Call Ratio'    ,
            'Parse Count per User Calls'      ,
            'Hard Parsing Ratio'              ,
            'Average Reusable Buffers in LRU' ,
            'Average LRU Buffer Scan'         ,
            'Free Buffer Scan Ratio'          ,
            'Log Space Request Ratio'         ,
            'Log Buffer Retry Ratio'          ,
            'Rows by Index Scan Ratio'        ,
            'Chained Row Ratio'
        ],

        lockType: ['None', 'Null', 'SS', 'SX', 'Share', 'SSX', 'Exclusive'] ,

        //1406.13 추가(min)
        OracleCommandType : [   '',                            'CREATE TABLE',
            'INSERT',                      'SELECT',
            'CREATE CLUSTER',              'ALTER CLUSTER',
            'UPDATE',                      'DELETE',
            'DROP CLUSTER',                'CREATE INDEX',
            'DROP INDEX',                  'ALTER INDEX',
            'DROP TABLE',                  'CREATE SEQUENCE',
            'ALTER SEQUENCE',              'ALTER TABLE',
            'DROP SEQUENCE',               'GRANT OBJECT',
            'REVOKE OBJECT',               'CREATE SYNONYM',
            'DROP SYNONYM',                'CREATE VIEW',
            'DROP VIEW',                   'VALIDATE INDEX',
            'CREATE PROCEDURE',            'ALTER PROCEDURE',
            'LOCK',                        'NO-OP',
            'RENAME',                      'COMMENT',
            'AUDIT OBJECT',                'NOAUDIT OBJECT',
            'CREATE DATABASE LINK',        'DROP DATABASE LINK',
            'CREATE DATABASE',             'ALTER DATABASE',
            'CREATE ROLLBACK SEG',         'ALTER ROLLBACK SEG',
            'DROP ROLLBACK SEG',           'CREATE TABLESPACE',
            'ALTER TABLESPACE',            'DROP TABLESPACE',
            'ALTER SESSION',               'ALTER USER',
            'COMMIT',                      'ROLLBACK',
            'SAVEPOINT',                   'PL/SQL EXECUTE',
            'SET TRANSACTION',             'ALTER SYSTEM',
            'EXPLAIN',                     'CREATE USER',
            'CREATE ROLE',                 'DROP USER',
            'DROP ROLE',                   'SET ROLE',
            'CREATE SCHEMA',               'CREATE CONTROL FILE',
            'ALTER TRACING',               'CREATE TRIGGER',
            'ALTER TRIGGER',               'DROP TRIGGER',
            'ANALYZE TABLE',               'ANALYZE INDEX',
            'ANALYZE CLUSTER',             'CREATE PROFILE',
            'DROP PROFILE',                'ALTER PROFILE',
            'DROP PROCEDURE',              'DROP PROCEDURE',
            'ALTER RESOURCE COST',         'CREATE M-VIEW/SNAPSHOT LOG',
            'ALTER M-VIEW/SNAPSHOT LOG',   'DROP M-VIEW/SNAPSHOT LOG',
            'CREATE M-VIEW/SNAPSHOT VIEW', 'ALTER M-VIEW/SNAPSHOT VIEW',
            'DROP M-VIEW/SNAPSHOT VIEW',   'CREATE TYPE',
            'DROP TYPE',                   'ALTER ROLE',
            'ALTER TYPE',                  'CREATE TYPE BODY',
            'ALTER TYPE BODY',             'DROP TYPE BODY',
            'DROP LIBRARY',                'TRUNCATE TABLE',
            'TRUNCATE CLUSTER',            '',
            'ALTER VIEW',                  '',
            '',                            'CREATE FUNCTION',
            'ALTER FUNCTION',              'DROP FUNCTION',
            'CREATE PACKAGE',              'ALTER PACKAGE',
            'DROP PACKAGE',                'CREATE PACKAGE BODY',
            'ALTER PACKAGE BODY',          'DROP PACKAGE BODY',
            'LOGON',                       'LOGOFF',
            'LOGOFF BY CLEANUP',           'SESSION REC',
            'SYSTEM AUDIT',                'SYSTEM NOAUDIT',
            'AUDIT DEFAULT',               'NOAUDIT DEFAULT',
            'SYSTEM GRANT',                'SYSTEM REVOKE',
            'CREATE PUBLIC SYNONYM',       'DROP PUBLIC SYNONYM',
            'CREATE PUBLIC DATABASE LINK', 'DROP PUBLIC DATABASE LINK',
            'GRANT ROLE',                  'REVOKE ROLE',
            'EXECUTE PROCEDURE',           'USER COMMENT',
            'ENABLE TRIGGER',              'DISABLE TRIGGER',
            'ENABLE ALL TRIGGERS',         'DISABLE ALL TRIGGERS',
            'NETWORK ERROR',               'EXECUTE TYPE',
            '',                            '',
            '',                            '',
            '',                            '',
            '',                            '',
            '',                            '',
            '',                            '',
            '',                            '',
            '',                            '',
            '',                            '',
            '',                            '',
            '',                            '',
            '',                            '',
            '',                            '',
            '',                            '',
            '',                            '',
            '',                            '',
            '',                            'CREATE DIRECTORY',
            'DROP DIRECTORY',              'CREATE LIBRARY',
            'CREATE JAVA',                 'ALTER JAVA',
            'DROP JAVA',                   'CREATE OPERATOR',
            'CREATE INDEXTYPE',            'DROP INDEXTYPE',
            '',                            'DROP OPERATOR',
            'ASSOCIATE STATISTICS',        'DISASSOCIATE STATISTICS',
            'CALL METHOD',                 'CREATE SUMMARY',
            'ALTER SUMMARY',               'DROP SUMMARY',
            'CREATE DIMENSION',            'ALTER DIMENSION',
            'DROP DIMENSION',              'CREATE CONTEXT',
            'DROP CONTEXT',                'ALTER OUTLINE',
            'CREATE OUTLINE',              'DROP OUTLINE',
            'UPDATE INDEXES',              'ALTER OPERATOR'
        ]

    },

    languageList: {
        ko : 'ko',
        en : 'en'
    },

    threadStateType : [
            'NEW',          'RUNNABLE',     'BLOCKED',          'WAITING',        'TIMED_WAITING',  //  0  4
            '',             '',             '',                 '',               '',               //  5  9
            'TERMINATED',   'EJB_OBJ',      'EJB_LOCAL_HOME',   'EJB_LOCAL_OBJ',  '',               // 10 14
            '',             '',             '',                 '',               '',               // 15 19
            'RMI_CALL',     '',             '',                 '',               '',               // 20 24
            '',             '',             '',                 '',               '',               // 25 29
            'JNI_CALL',     '',             '',                 '',               '',               // 30 34
            '',             '',             '',                 '',               '',               // 35 39
            'NETWORK_IO',   '',             '',                 '',               '',               // 40 44
            '',             '',             '',                 '',               '',               // 45 49
            'FILE_IO',      '',             '',                 '',               '',               // 50 54
            '',             '',             '',                 '',               '',               // 55 59
            'CONN_OPEN',    'CONN_CLOSE',   'STMT_OPEN',        'STMT_EXECUTE',   'STMT_CLOSE',     // 60 64
            'RS_OPEN',      'RS_NEXT',      'RS_CLOSE' ,        '',               '',               // 65 69
            '',             '',             '',                 '',               '',               // 70 74
            '',             '',             '',                 '',               '',               // 75 79
            '',             '',             '',                 '',               '',               // 80 84
            '',             '',             '',                 '',               '',               // 85 89
            '',             '',             '',                 '',               '',               // 90 94
            '',             '',             '',                 '',               ''                // 95 99
    ],

    // quickWindow 관련
    timeInfo: {
        lastFormType     : null,
        lastInsTance     : null,
        lastFromTime     : null,
        lastToTime       : null,
        lastZoomFromTime : null,
        lastZoomToTime   : null
    }
});
