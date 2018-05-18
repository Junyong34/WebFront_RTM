/**
 * Application Layout
 * by Null Park
 */

// reference local blank image

// create namespace
Ext.namespace('exem');

// create application
exem = function () {
    // do NOT access DOM from here; elements don't exist yet
    // private variables

    // private functions
    // public space
    return {
        // public properties, e.g. strings to translate

        // public methods
        init: function () {},
        /*********************************************************************/
        /** Session Info                                                   */
        /*********************************************************************/
        so: function () {
            var jsonData;
            Ext.Ajax.request({
                disableCaching: true,
                url: '/Session',
                method: 'POST',
                async: false,
                params: null,
                success: function (objServerResponse) {
                    var newComponent = objServerResponse.responseText;
                    jsonData = Ext.JSON.decode(newComponent);
                    jsonData = jsonData.response;
                },
                failure: function (objServerResponse, callOptions) {
                    jsonData = '{"userid": null}';
                }
            });
            return jsonData;
        },
        /*********************************************************************/
        /** Session Info                                                   */
        /*********************************************************************/
        extension: function () {
            var jsonData;
            Ext.Ajax.request({
                disableCaching: true,
                url: '/CoreExtensionGuiView?group_name=LOCATION_SET',
                method: 'GET',
                async: false,
                params: null,
                success: function (objServerResponse) {
                    var newComponent = objServerResponse.responseText;
                    jsonData = Ext.JSON.decode(newComponent);
                },
                failure: function (objServerResponse, callOptions) {
                    jsonData = '[{"gui_id":"UNKNOWN"}]';
                }
            });
            return jsonData;
        },
        /*********************************************************************/
        /** SQLm util only                                                   */
        /*********************************************************************/
        SQLmSource: function (connName, type, object) {
            return exem.SQLm('SOURCE', connName, null, null, null, type, object);
        },
        SQLmQuery: function (connName, sqlstr, start, limit, type) {
            return exem.SQLm('QUERY', connName, sqlstr, start, limit);
        },
        SQLmExplain: function (connName, sqlstr) {
            return exem.SQLm('EXPLAIN', connName, sqlstr);
        },
        SQLm: function (process, connName, sqlstr, start, limit, type, object) {
            var jsonData;
            Ext.Ajax.request({
                disableCaching: true,
                url: '../SQLm',
                method: 'POST',
                async: false,
                params: {
                    process: process,
                    connName: connName,
                    sqlstr: sqlstr,
                    limit: limit,
                    start: start,
                    type: type,
                    name: object
                },
                success: function (objServerResponse) {
                    var newComponent = objServerResponse.responseText;
                    jsonData = Ext.JSON.decode(newComponent);
                },
                failure: function (objServerResponse, callOptions) {
                    jsonData = '{"Error": "JDBC Socket fail"}';
                }
            });
            return jsonData;
        },
        /*********************************************************************/
        /** SessionCheck                                                   */
        /*********************************************************************/
        doSessionCheck: function () {
            var so = exem.so();
            if (!Ext.isEmpty(exem.so().reason) && exem.so().reason === 'DUPLICATE') {
                Ext.MessageBox.show({
                    title: 'Warning',
                    msg: 'A duplicate login has detected. Your connection to the server has been lost.<br>Please login!',
                    buttons: Ext.MessageBox.OK,
                    icon: Ext.MessageBox.WARNING,
                    fn: function (btn, text) {
                        if (btn == 'ok') {
                            location.href = "../";
                        }
                    }
                });
            } else if (so.userid == null) {
                Ext.MessageBox.show({
                    title: 'Warning',
                    msg: 'Server session disconnected. or permission denied!  Please login !',
                    buttons: Ext.MessageBox.OK,
                    icon: Ext.MessageBox.WARNING,
                    fn: function (btn, text) {
                        if (btn == 'ok') {
                            location.href = "../";
                        }
                    }
                });
            }
            if (Ext.isEmpty(window.oncontextmenu)) {
                window.oncontextmenu = function () {
                    return false;
                }
            }
        },
        /*********************************************************************/
        /** submit                                                           */
        /*********************************************************************/
        doSecurity: function (content, grid, procNames, extension) {
            var so = exem.so();
            var isSecurityConfirm = false;
            if (grid.indexOf('_') != -1) {
                grid = grid.substring(0, grid.indexOf('_'));
            }

            /*********************************************************************/
            /** Extension일 경우 예외처리를 해놓음.                              */
            /*********************************************************************/

            if (extension === 'Extension') {
                grid = extension;
            }

            Ext.Ajax.request({
                disableCaching: true,
                url: '/Response',
                method: 'POST',
                async: false,
                params: {
                  content: content,
                  output: 'json',
                  node: 'userxprogramparameter',
                  p: [so.user.id, grid]
                },
                success: function (objServerResponse) {
                    var newComponent = objServerResponse.responseText;
                    var jsonData = Ext.JSON.decode(newComponent);
                    var insertallowed = jsonData.userxprogramparameter.node[0].insertallowed;
                    var updateallowed = jsonData.userxprogramparameter.node[0].updateallowed;
                    var deleteallowed = jsonData.userxprogramparameter.node[0].deleteallowed;

                    if (procNames.substr(2, 1) === 'I' && insertallowed === 'Y') {
                        isSecurityConfirm = true;
                    } else if (procNames.substr(2, 1) === 'U' && updateallowed === 'Y') {
                        isSecurityConfirm = true;
                    } else if (procNames.substr(2, 1) === 'D' && deleteallowed === 'Y') {
                        isSecurityConfirm = true;
                    } else if (procNames.substr(2, 1) === 'T' && deleteallowed === 'Y') {
                        isSecurityConfirm = true;
                    }
                    if (isSecurityConfirm == false) {
                        Ext.MessageBox.show({
                            title: 'Warning',
                            msg: 'You do not have permission, please contact the administrator',
                            buttons: Ext.MessageBox.OK,
                            icon: Ext.MessageBox.WARNING,
                            fn: function (btn, text) {
                                if (btn == 'ok') {
                                    return false;
                                }
                            }
                        });
                    }
                },
                failure: function (objServerResponse, callOptions) {
                    return false;
                }
            }); // end Ajax request
            return isSecurityConfirm;
        },
        doSubmit: function (content, grid, procNames, extension, callBackFunc) {
            var gridObj = Ext.getCmp(grid);
            var selectionModel = gridObj.getSelectionModel();
            var selectLength = selectionModel.getSelection().length - 1;
            var isConfirm = [];
            Ext.Array.each(selectionModel.getSelection(), function (record, indx) {
                if (!record.get('ck')) {
                    record.set('ck', 'I');
                }
                var procName = '';
                var ckValue = record.get('ck');
                for (i = 0; i < procNames.length; i++) {
                    if (ckValue == 'I' && procNames[i].indexOf('OPI') == 0) {
                        procName = procNames[i];
                        break;
                    }
                    procName = procNames[i];
                }

                if (isConfirm[grid + '_' + procName] == null) {
                    isConfirm[grid + '_' + procName] = exem.doSecurity(content, grid, procName, extension);
                }

                if (isConfirm[grid + '_' + procName]) {
                    Ext.Ajax.timeout = 10000;
                    Ext.Ajax.request({
                        waitMsg: 'Processing save...',
                        disableCaching: true,
                        url: '../Procedure',
                        method: 'POST',
                        async: false,
                        params: Ext.apply(record.data, {
                            ProcName: procName
                        }),
                        success: function (objServerResponse) {
                            var newComponent = objServerResponse.responseText.trim();
                            if (newComponent.indexOf('-') != -1) {
                                Ext.MessageBox.show({
                                    title: 'Error',
                                    msg: newComponent,
                                    buttons: Ext.MessageBox.OK,
                                    icon: Ext.MessageBox.ERROR
                                });
                            }
                            if (selectLength == indx) {
                                gridObj.getStore().load();
                            }
                            if (typeof (callBackFunc) == 'function')
                                setTimeout(function (a, isSuccess) {
                                    a(isSuccess)
                                }, 100, callBackFunc, true);


                        },
                        failure: function (objServerResponse, callOptions) {
                            var newComponent = objServerResponse.responseText.trim();
                            Ext.MessageBox.show({
                                title: 'Error',
                                msg: 'Server connection fail',
                                buttons: Ext.MessageBox.OK,
                                icon: Ext.MessageBox.ERROR,
                                fn: function () {
                                    if (typeof (callBackFunc) == 'function')
                                        setTimeout(function (a, isSuccess) {
                                            a(isSuccess)
                                        }, 100, callBackFunc, false);
                                }
                            });
                        }
                    }); // end Ajax request
                }
            });
        },
        /*********************************************************************/
        /** Submit for Extension only                                        */
        /**                                                                  */
        /**   exem.doExtensionCall(grid.id, classname, menuid, 'EXI'         */
        /**		function(returnString){                                      */
        /**	     alert(a);                                                   */
        /**   });                                                            */
        /**                                                                  */
        /** allowd : EXI, EXU, EXD (insert, update, delete)                  */
        /**          EXS => true                              */
        /**                                                                  */
        /*********************************************************************/
        doExtensionCall: function (content, grid, gui_id, param, allowd, callback) {
            var gridObj = Ext.getCmp(grid);
            var store = gridObj.getStore();
            var records = store.getModifiedRecords();
            var fields = store.getAt(0).fields;
            var model = gridObj.getStore().model;

            // check Security
            if (exem.doSecurity(content, 'Extension', allowd) == false) {
                return;
            }

            var parameter = "gui_id=" + gui_id + "&" + param + "&";
            for (var i = 0; i < records.length; i++) {
                Ext.each(model.getFields(), function (field) {
                    parameter += '&' + field.name + '=' + records[i].get(field.name);
                });
            }
            Ext.Ajax.request({
                url: '../CoreExtensionGuiCall',
                method: 'POST',
                params: parameter,
                success: function (objServerResponse) {
                    var newComponent = objServerResponse.responseText.trim();
                    if (callback != null) {
                        callback(newComponent);
                    }
                },
                failure: function (objServerResponse, callOptions) {
                    var newComponent = objServerResponse.responseText.trim();
                    exem.showErrorMessage('Server connection fail');
                }
            });
        },
        /*********************************************************************/
        /** Recovery                                                       */
        /*********************************************************************/
        doRecovery: function (grid, ProcName, text, recoveryoption) {
            var gridObj = Ext.getCmp(grid);
            var selectionModel = gridObj.getSelectionModel();
            var selectLength = selectionModel.getSelection().length - 1;
            Ext.Array.each(selectionModel.getSelection(), function (record, indx) {
                record.data.alerttime = Ext.Date.format(new Date(record.data.alerttime), 'Y-m-d H:i:s');
                Ext.Ajax.request({
                    waitMsg: 'Processing save...',
                    disableCaching: true,
                    url: '/Procedure',
                    method: 'POST',
                    async: false,
                    params: Ext.apply(record.data, {
                        ProcName: ProcName,
                        text: text,
                        recoveryoption: recoveryoption,
                        ck: 'Y'
                    }),
                    success: function (objServerResponse) {
                        var newComponent = objServerResponse.responseText.trim();
                        if (newComponent.indexOf('-') != -1) {
                            Ext.MessageBox.show({
                                title: 'Error Message',
                                msg: newComponent,
                                buttons: Ext.MessageBox.OK,
                                icon: 'search'
                            });
                        }
                        if (selectLength == indx) {
                            gridObj.getStore().load();
                        }
                        var recovery_data;
                        if ('ALL' === recoveryoption) {
                            recovery_data = {
                                RECOVERY: 'SUCCESS'
                            };
                        } else if ('ROW' === recoveryoption) {
                            recovery_data = {
                                RECOVERY_ROW: record.data.serverid,
                                RECOVERY_ALERTTIME: record.data.alerttime
                            };
                        } else {
                            recovery_data = {
                                RECOVERY_SINGLE: record.data.serverid
                            };
                        }
                        exem.doSocketSend(JSON.stringify(recovery_data));
                    },
                    failure: function (objServerResponse, callOptions) {
                        var newComponent = objServerResponse.responseText.trim();
                        Ext.MessageBox.show({
                            title: 'Error Message',
                            msg: 'Server connection fail',
                            buttons: Ext.MessageBox.OK,
                            icon: 'search'
                        });
                    }
                });
            });
        },
        /*********************************************************************/
        /** AsyncRecovery By Simboyz 2015-12-29                              */
        /*********************************************************************/
        doAsyncRecovery: function (grid, ProcName, text, recoveryoption, cb) {
            var gridObj = Ext.getCmp(grid);
            var callback = cb;
            var selectionModel = gridObj.getSelectionModel();
            var records = selectionModel.getSelection();
            var ii = 0;
            var tt = text ? text : '';
            var roption = recoveryoption ? recoveryoption : '';
            var pName = ProcName ? ProcName : '';

            var asyncLoopTimer = 0;
            var asyncLoop = function () {
                if (!records[ii]) {
                    clearTimeout(asyncLoopTimer);
                    gridObj.getStore().load();
                    if (callback) {
                        return callback();
                    }
                } else {
                    var record = records[ii];
                    if (window.exem.$mask) {
                        window.exem.$mask.text('Recovery Row ' + (ii + 1) + '/' + records.length);
                    }
                    record.data.alerttime = Ext.Date.format(new Date(record.data.alerttime), 'Y-m-d H:i:s');

                    Ext.Ajax.request({
                        waitMsg: 'Processing save...',
                        disableCaching: true,
                        url: '/Procedure',
                        method: 'POST',
                        async: true,
                        params: Ext.apply(record.data, {
                            ProcName: pName,
                            text: tt,
                            recoveryoption: roption,
                            ck: 'Y'
                        }),
                        success: function (objServerResponse) {
                            var newComponent = objServerResponse.responseText.trim();
                            if (newComponent.indexOf('-') != -1) {
                                Ext.MessageBox.show({
                                    title: 'Error Message',
                                    msg: newComponent,
                                    buttons: Ext.MessageBox.OK,
                                    icon: 'search'
                                });
                            }

                            var recovery_data;
                            if ('ALL' === roption) {
                                recovery_data = {
                                    RECOVERY: 'SUCCESS'
                                };
                            } else if ('ROW' === roption) {
                                recovery_data = {
                                    RECOVERY_ROW: record.data.serverid,
                                    RECOVERY_ALERTTIME: record.data.alerttime
                                };
                            } else {
                                recovery_data = {
                                    RECOVERY_SINGLE: record.data.serverid
                                };
                            }
                            exem.doSocketSend(JSON.stringify(recovery_data));

                            ii += 1;
                            asyncLoopTimer = setTimeout(asyncLoop, 0);
                        },
                        failure: function (objServerResponse, callOptions) {
                            Ext.MessageBox.show({
                                title: 'Error Message',
                                msg: 'Server connection fail',
                                buttons: Ext.MessageBox.OK,
                                icon: 'search'
                            });
                            ii += 1;
                            asyncLoopTimer = setTimeout(asyncLoop, 0);
                        }
                    });
                }
            };

            if (selectionModel && records && records.length) {
                asyncLoop();
            }
        },
        /*********************************************************************/
        /** Combo                                                          */
        /*********************************************************************/
        // Combo Type 1  - CODE (VALUE)   ex) 1 (PROGRAMMED)
        ComboType1: '<div data-qtip="{value}">{code} ({value})</div>',

        // Combo Type 2  - VALUE (CODE)   ex) PROGRAMMED (1)
        ComboType2: '<div data-qtip="{value}">{value} ({code})</div>',

        // Combo Type 3  - VALUE   ex) PROGRAMMED
        ComboType3: '<div data-qtip="{value}">{value}</div>',

        // Combo Type 4  - CODE   ex) 1
        ComboType4: '<div data-qtip="{value}">{code}</div>',

        ComboType5: '<div data-qtip="{code}. {value}">{code} ({value})</div>',

        ComboType6: '<div data-qtip="{code}">{code}</div>',

        ComboDisplayItem1: 'code',

        ComboDisplayItem2: 'value',

        doCombo: function (content, url, nodeName, type, displayItem) {
            var params = (Ext.isEmpty(nodeName)) ? {
                content: content,
                output: 'json',
                node: url
            } : {
                content: content,
                output: 'json',
                node: url,
                p: nodeName
            };
            if (!type) {
                type = exem.ComboType5;
            }
            if (!displayItem) {
                displayItem = exem.ComboDisplayItem1;
            }
            var store = Ext.create('Ext.data.Store', {
                pageSize: 500,
                remoteSort: false,
                autoLoad: true,
                fields: [{
                        name: 'code',
                        type: 'string'
                    },
                    {
                        name: 'value',
                        type: 'string'
                    }
                ],
                proxy: {
                    type: 'ajax',
                    url: '/Response',
                    extraParams: params,
                    reader: {
                        type: 'json',
                        root: url + '.node'
                    }
                }
            });

            // Simple ComboBox using the data store
            var simpleCombo = Ext.create('Ext.form.field.ComboBox', {
                displayField: displayItem,
                valueField: 'code',
                store: store,
                queryMode: 'local',
                selectOnTab: true,
                triggerAction: 'all',
                editable: true,
                lazyRender: true,
                forceSelection: true,
                typeAhead: true,
                listConfig: {
                    getInnerTpl: function () {
                        return type;
                    }
                },
                listeners: {
                    expand: function (field, opts) {
                        store.filters.clear();
                        store.load();
                    }
                }
            });
            return simpleCombo;
        },

        doSimpleCombo: function (data) {
            return Ext.create('Ext.form.field.ComboBox', {
                typeAhead: true,
                triggerAction: 'all',
                selectOnTab: true,
                editable: false,
                lazyRender: true,
                store: data
            });
        },

        /*********************************************************************/
        /** doFilter                                                         */
        /*********************************************************************/
        doFilter: function (filters) {
            var query = [],
                filter, field, value, compare, filterType, count, len = filters.length;
            for (i = 0; i < len; i++) {
                filter = filters[i];
                field = filter['field'];
                value = filter['data']['value'];
                compare = filter['data']['comparison'];
                filterType = filter['data']['type'];

                switch (filterType) {
                    case 'string':
                        query.push(" AND " + field + " LIKE '%" + value + "%'");
                        break;
                    case 'list':
                        if (value.length > 1) {
                            var v = "";
                            for (q = 0; q < value.length; q++) {
                                if (value.length - 1 == q) {
                                    v += "'" + value[q] + "'";
                                } else {
                                    v += "'" + value[q] + "',";
                                }
                            }
                            query.push(" AND " + field + " IN (" + v + ")");
                        } else {
                            query.push(" AND " + field + " = '" + value + "'");
                        }
                        break;
                    case 'boolean':
                        query.push(" AND " + field + " = " + (value));
                        break;
                    case 'numeric':
                        switch (compare) {
                            case 'eq':
                                query.push(" AND " + field + " = " + value);
                                break;
                            case 'lt':
                                query.push(" AND " + field + " < " + value);
                                break;
                            case 'gt':
                                query.push(" AND " + field + " > " + value);
                                break;
                        }
                        break;
                    case 'date':
                        switch (compare) {
                            case 'eq':
                                query.push(" AND trunc(" + field + ") = to_date('" + value + "','mm/dd/yyyy')");
                                break;
                            case 'lt':
                                query.push(" AND trunc(" + field + ") <= to_date('" + value + "','mm/dd/yyyy')");
                                break;
                            case 'gt':
                                query.push(" AND trunc(" + field + ") >= to_date('" + value + "','mm/dd/yyyy')");
                                break;
                        }
                        break;
                }
            }
            return query;
        },
        /*********************************************************************/
        /** Row Detail Data                                                  */
        /*********************************************************************/
        doDetail: function (record, store) {
            var win;
            if (!win) {
                var propsGrid = Ext.create('Ext.grid.property.Grid', {
                    cls: 'multiline',
                    sortableColumns: false,
                    enableLocking: true,
                    border: false,
                    source: {
                        alertlevel: !Ext.isEmpty(record.data.alertlevel) ? exem.setLevelText(record.data.alertlevel) : '',
                        server: (record.data.serverid != undefined) ? record.data.serverid : '',
                        alertname: (record.data.alertname != undefined) ? record.data.alertname : '',
                        alertvalue: (record.data.alertvalue != undefined) ? record.data.alertvalue : '',
                        logtime: (record.data.alerttime != undefined) ? Ext.Date.format(record.data.alerttime, 'Y-m-d H:i:s') : '',
                        descr: (record.data.descr != undefined) ? record.data.descr : '',
                        recoverytime: (record.data.recoverytime != undefined) ? Ext.Date.format(record.data.recoverytime, 'Y-m-d H:i:s') : '',
                        reason: (record.data.reason != undefined) ? record.data.reason : ''
                    },
                    customRenderers: {
                        alertlevel: function (v) {
                            return '<div style="width: 70px;text-align:center;">' + v + '</div>';
                        }
                    },
                    propertyNames: {
                        alertlevel: '<b>${col_alertlevel}</b>',
                        server: '<b>${col_serveralias}</b>',
                        alertname: '<b>${col_alertname}</b>',
                        alertvalue: '<b>${col_alertvalue}</b>',
                        logtime: '<b>${col_alerttime}</b>',
                        descr: '<b>${col_description}</b>',
                        recoverytime: '<b>${col_recoverytime}</b>',
                        reason: '<b>${col_reason}</b>'
                    },
                    viewConfig: {
                        enableTextSelection: true
                    },
                    listeners: {
                        beforeedit: function (editor, e, opts) {
                            return false;
                        }
                    }
                });

                win = Ext.widget('window', {
                    title: '${label_alertinfo}',
                    closeAction: 'hide',
                    width: 400,
                    minWidth: 400,
                    minHeight: 250,
                    constrain: true,
                    maximizable: true,
                    layout: 'fit',
                    modal: true,
                    items: propsGrid
                });
            }
            win.show();
        },
        /*********************************************************************/
        /** WebSocket - Send Message                                         */
        /*********************************************************************/
        doSocketSend: function (obj) {
            var so = exem.so();
            var ip = so.ip;
            var port = so.port;
            var context = so.context;
            var url = 'ws://' + ip + ':' + port + context;
            var websocket = Ext.create('Ext.ux.WebSocket', {
                url: url, //'ws://d.maxgauge.co.kr:8080/ws' ,
                listeners: {
                    open: function (ws) {
                        ws.send(obj);
                    },
                    error: function (ws, error) {
                        Ext.Error.raise(error);
                    },
                    message: function (ws, message) {
                        websocket.close();
                    },
                    close: function (ws) {}
                }
            });
        },
        /*********************************************************************/
        /** Version Check                                                    */
        /*********************************************************************/
        doActive: function (ver, visible) {
            var so = this.so();

            var version = parseFloat(ver);
            var activeVersion = 0;

            if (so.VersionMajor != undefined && so.VersionMinor != undefined) {
                versionVal = so.VersionMajor + '.' + so.VersionMinor;
                activeVersion = parseFloat(versionVal);
            }

            if (visible == true) {
                return (version <= activeVersion);
            } else {
                return (version == activeVersion);
            }
            return false;
        },
        /*********************************************************************/
        /** disable font color                                                    */
        /*********************************************************************/
        doDisable: function (value) {
            return '<span style="color:#888888">' + value + '</span>';
        },
        /*********************************************************************/
        /** Server Position                                                  */
        /*********************************************************************/
        doPosition: function (posdata, key) {

            Ext.define('JsonData', {
                extend: 'Ext.data.Model',
                fields: [{
                        name: 'serverid',
                        type: 'string'
                    },
                    {
                        name: 'groupid',
                        type: 'string'
                    },
                    {
                        name: 'groupno',
                        type: 'string'
                    },
                    {
                        name: 'alias',
                        type: 'string'
                    }
                ]
            });

            var jsonStore = Ext.create('Ext.data.JsonStore', {
                model: 'JsonData',
                data: posdata
            });

            Ext.define('ServerData', {
                extend: 'Ext.data.Model',
                fields: [{
                        name: 'ck',
                        type: 'string',
                        defaultValue: 'Y'
                    },
                    {
                        name: 'locationid',
                        type: 'string'
                    },
                    {
                        name: 'serverid',
                        type: 'string'
                    },
                    {
                        name: 'groupid',
                        type: 'string'
                    },
                    {
                        name: 'groupno',
                        type: 'string'
                    }
                ]
            });
            var waitBox;

            var serverStore = Ext.create('Ext.data.Store', {
                pageSize: 300,
                model: 'ServerData',
                autoLoad: true,
                proxy: {
                    type: 'ajax',
                    url: '../Response?node=positionview&p=GID_CINEMA&p=' + key,
                    reader: {
                        type: 'xml',
                        record: 'node',
                        totalProperty: 'totalresults'
                    }
                },
                listeners: {
                    'beforeload': function (store, records, options) {
                        waitBox = Ext.MessageBox.show({
                            title: 'Save Position',
                            msg: 'Saving data, please wait...',
                            progressText: 'Saving...',
                            width: 250,
                            closable: false,
                            progress: true
                        });
                    },
                    'load': function (store, records, options) {

                        Ext.Array.each(records, function (record, indx) {
                            var isSet = false;
                            jsonStore.each(function (rec) {
                                if (rec.get('serverid') === record.get('serverid')) {
                                    record.set('groupno', rec.get('groupno'));
                                    isSet = true;
                                }
                            });
                            if (!isSet) {
                                record.set('groupno', '');
                            }

                            var procName = 'OPULOCATIONXSERVER';
                            Ext.Ajax.timeout = 10000;
                            Ext.Ajax.request({
                                waitMsg: 'Processing save...',
                                disableCaching: true,
                                url: '../Procedure',
                                method: 'POST',
                                async: false,
                                params: Ext.apply(record.data, {
                                    ProcName: procName
                                }),
                                success: function (objServerResponse) {
                                    var newComponent = objServerResponse.responseText.trim();
                                    if (newComponent.indexOf('-') != -1) {
                                        waitBox.hide();
                                        Ext.MessageBox.show({
                                            title: 'Error Message',
                                            msg: newComponent,
                                            buttons: Ext.MessageBox.OK,
                                            icon: 'search'
                                        });
                                    }
                                },
                                failure: function (objServerResponse, callOptions) {
                                    waitBox.hide();
                                    var newComponent = objServerResponse.responseText.trim();
                                    Ext.MessageBox.show({
                                        title: 'Error Message',
                                        msg: 'Server connection fail',
                                        buttons: Ext.MessageBox.OK,
                                        icon: 'search'
                                    });
                                }
                            }); // end Ajax request
                        });
                        waitBox.hide();
                        Ext.MessageBox.show({
                            title: 'Message',
                            msg: 'Success',
                            buttons: Ext.MessageBox.OK,
                            icon: Ext.MessageBox.INFO
                        });
                    }
                }
            });
        },
        /*********************************************************************/
        /** Add/Update Row Select                                            */
        /*********************************************************************/
        doEditRowSelect: function (grid) {
            var selectedModel = [];
            var gridObj = Ext.getCmp(grid);
            var gridSm = gridObj.getSelectionModel();
            selectedModel = Ext.Array.merge(gridObj.getStore().getUpdatedRecords(), gridSm.getSelection(), gridObj.getStore().getNewRecords());
            gridSm.select(selectedModel);
            gridObj = null;
            gridSm = null;
            selectedModel = null;

        },

        /*********************************************************************/
        /** RowNumber Edit                                                   */
        /*********************************************************************/
        doEditRowNumber: function (value, metaData, record, rowIdx, colIdx, store) {
            if (this.rowspan) {
                metaData.cellAttr = 'rowspan="' + this.rowspan + '"';
            }
            metaData.tdCls = Ext.baseCSSPrefix + 'grid-cell-special';
            if (record.get('ck') === 'I') {
                return null;
            }
            return store.indexOfTotal(record) + 1;
        },

        /*********************************************************************/
        /** Set New Row Color                                                */
        /*********************************************************************/
        setNewRowColor: function (record, rowIndex, rowParams) {
            return (record.get('ck') === 'I') ? 'admin-new-row' : '';
        },

        /*********************************************************************/
        /** Grid Quick Tip                                                   */
        /*********************************************************************/
        quickTip: function (value, metadata) {
            metadata.tdAttr = 'data-qtip="' + value + '"';
            return value;
        },

        /*********************************************************************/
        /** Format - Password                                                */
        /*********************************************************************/
        formatPassword: function (value, metadata) {
            if (Ext.isEmpty(value)) {
                return '';
            } else {
                return '**************';
            }
        },

        /*********************************************************************/
        /** Set Event Level Text                                             */
        /*********************************************************************/
        setLevelText: function (value, metaData) {
            if (value === '0') {
                return '<div style="background-color:#459F46;color:#FFF">NORMAL</div>';
            } else if (value === '1') {
                return '<div style="background-color:#AA8415;color:#FFF">WARNING</div>';
            } else if (value === '2') {
                return '<div style="background-color:#CB1B1F;color:#FFF">CRITICAL</div>';
            }
            return value;
        },

        setLevelSimpleText: function (value, metaData) {
            if (value === '0') {
                return 'NORMAL';
            } else if (value === '1') {
                return 'WARNING';
            } else if (value === '2') {
                return 'CRITICAL';
            }
            return value;
        },

        /*********************************************************************/
        /** Show Message - INFO LEVEL                                        */
        /*********************************************************************/
        showInfoMessage: function (message) {
            exem.showMessage(Ext.MessageBox.INFO, 'Message', message);
        },

        /*********************************************************************/
        /** Show Message - WARNING LEVEL                                     */
        /*********************************************************************/
        showWarningMessage: function (message) {
            exem.showMessage(Ext.MessageBox.WARNING, 'Warning', message);
        },

        /*********************************************************************/
        /** Show Message - ERROR LEVEL                                       */
        /*********************************************************************/
        showErrorMessage: function (message) {
            exem.showMessage(Ext.MessageBox.ERROR, 'Error', message);
        },

        /*********************************************************************/
        /** Show Message                                                     */
        /*********************************************************************/
        showMessage: function (level, name, message) {
            Ext.MessageBox.show({
                title: name,
                closable: false,
                msg: message,
                buttons: Ext.MessageBox.OK,
                icon: level
            });
        },

        /*********************************************************************/
        /** Validate Required Items                                          */
        /*********************************************************************/
        validateRequiredItem: function (gridid, datas) {
            var gridObj = Ext.getCmp(gridid);
            var gridSm = gridObj.getSelectionModel();
            var selectItems = gridSm.getSelection();
            var message = null;
            Ext.Array.each(selectItems, function (item) {
                Ext.each(datas, function (data) {
                    if (Ext.isEmpty(item.get(data.code))) {
                        message = data.value;
                        return false;
                    }
                })
                if (!Ext.isEmpty(message)) {
                    return false;
                }
            });
            return message;
        },

        /*********************************************************************/
        /** Get Login Password Policy.                                       */
        /*********************************************************************/
        PasswordPolicy: {
            options: {
                length: 10,
                lower: false,
                upper: false,
                number: false,
                special: false
            }
        },
        loadPasswordPolicy: function (callback) {
            try {
                Ext.Ajax.request({
                    disableCaching: true,
                    url: '/Response',
                    method: 'POST',
                    async: false,
                    params: {
                        content: 'admin',
                        output: 'json',
                        node: 'check_code',
                        p: 'VALID'
                    },
                    success: function (objServerResponse) {
                        var newComponent = objServerResponse.responseText;
                        var jsonData = Ext.JSON.decode(newComponent);

                        var findCheckCode = jsonData.check_code.node.find(function (data) {
                          return data.detailcode === 'LOGIN_PASSWD_LENGTH';
                        });

                        exem.PasswordPolicy.options = {
                            length: findCheckCode.descr,
                            lower: true,
                            upper: true,
                            number: true,
                            special: true
                        }
                        callback(true);
                    },
                    failure: function (objServerResponse, callOptions) {
                        exem.showErrorMessage('Connect fail');
                        callback(false);
                    }
                });
            } catch (e) {
                exem.showErrorMessage(e.message);
                callback(false);
            }
        },

        /*********************************************************************/
        /** Check the strength of a password.                                */
        /*********************************************************************/
        doStrengthCheck: function (p) {
            var isOk = true;
            var option = exem.PasswordPolicy.options;

            // Password Length
            if (!Ext.isEmpty(p) && !(p.length >= option.length)) {
                isOk = false;
            }
            // Letters (Not exactly implemented as dictacted above because of my limited understanding of Regex)
            if (option.lower && !p.match(/[a-z]/)) { // [verified] at least one lower case letter
                isOk = false;
            }
            if (option.upper && !p.match(/[A-Z]/)) { // [verified] at least one upper // case letter
                isOk = false;
            }
            // Numbers
            if (option.number && !p.match(/\d/)) { // [verified] at least one // number
                isOk = false;
            }
            // Special Char
            if (option.special && !p.match(new RegExp("[!,@,#,$,%,^,&,*,?,_,~]"))) { // [verified] at least one special character
                isOk = false;
            }
            // Repeat
            if ((/([a-zA-Z0-9])\1{2,}/g.test(p))) {
                isOk = false;
            }
            // Combos
            if (!p.match(new RegExp("(?=.*[a-z])(?=.*[A-Z])"))) { // [verified] both upper and lower case
                isOk = false;
            }
            if (!p.match(new RegExp("(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])"))) { // [verified] both letters and numbers
                isOk = false;
            }
            // [verified] letters, numbers, and special characters
            if (!p.match(new RegExp("(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!,@,#,$,%,^,&,*,?,_,~])"))) {
                isOk = false;
            }
            return isOk;
        },

        /*********************************************************************/
        /** validate password                                                */
        /*********************************************************************/
        validatePasswd: function (datas, p) {
            var isOk = true;
            Ext.each(datas, function (data) {
                if (!Ext.isEmpty(data) && p.indexOf(data) !== -1) {
                    isOk = false;
                    return false;
                }
            });
            return isOk;
        },
        /*********************************************************************/
        /** Grid Display Message                                             */
        /*********************************************************************/
        getMessageByLanguage: function (msg) {
            var lang = exem.so().lang.toUpperCase();
            if (!Ext.isEmpty(lang) && lang === 'JP') {
                return '';
            } else {
                return msg;
            }
        }

    }; // end return
}(); // end of app
