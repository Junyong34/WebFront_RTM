(function () {
    Ext.QuickTips.init();

    Ext.define('ServerModel', {
        extend: 'Ext.data.Model',
        fields: [
            { name: 'ck', type: 'string', defaultValue: 'Y' },
            { name: 'seq', type: 'string' },
            { name: 'serverid', type: 'string' },
            { name: 'serverno', type: 'string' },
            { name: 'type', type: 'string' },
            { name: 'serviceid', type: 'string' },
            { name: 'descr', type: 'string' },
            { name: 'host', type: 'string' },
            { name: 'ip', type: 'string' },
            { name: 'port', type: 'int' },
            { name: 'lineno', type: 'int' },
            { name: 'connecttype', type: 'string' },
            { name: 'alias', type: 'string' },
            { name: 'autorecovery', type: 'string' },
            { name: 'gatherno', type: 'int' },
            { name: 'useyn', type: 'string' }
        ]
    });

    var newInsertRecords = [];
    var store = Ext.create('Ext.data.Store', {
        pageSize: 100,
        remoteSort: true,
        model: 'ServerModel',
        proxy: {
            type: 'ajax',
            url: '/Response',
            extraParams: {
                content: 'admin',
                output: 'json',
                totalresults: true,
                node: 'server'
            },
            reader: {
                type: 'json',
                root: 'server.node'
            }
        },
        sorters: [
            { property: 'serverid', direction: 'ASC' }
        ],
        listeners: {
            load: function () {
                if (!Ext.isEmpty(newInsertRecords)) {
                    this.insert(0, newInsertRecords);
                    newInsertRecords = [];
                }
            }
        }
    });

    var checkRequiredItem = function () {
        var datas = [{
            code: 'serverid',
            value: LANG.server_id + ' ' + LANG.required_check
        }, {
            code: 'serverno',
            value: LANG.server_no + ' ' + LANG.required_check
        }];
        var message = exem.validateRequiredItem(grid.id, datas);
        return message;
    }

    var sm = new Ext.selection.CheckboxModel({
        multipleSelect: true
    });

    var setCheckbox = function (column, columnDataIndex, isCheck) {
        if (column === columnDataIndex) {
            store.each(
                function (rec) {
                    rec.set(column, isCheck);
                }
            );
        }
    }

    var connectTypeCombo = exem.doSimpleCombo([['RTS', 'RTS'], ['WS', 'WS'], ['SELF', 'SELF'], ['UNKNOWN', 'UNKNOWN']]);
    connectTypeCombo.on({
        change: function (field, newValue, oldValue) {
            if (newValue === 'RTS' || newValue === 'WS') {
                Ext.Array.each(grid.getSelectionModel().getSelection(), function (record, indx) {
                    record.set('serviceid', '');
                });
            } else if (newValue === 'UNKNOWN' || newValue === 'SELF') {
                Ext.Array.each(grid.getSelectionModel().getSelection(), function (record, indx) {
                    record.set('serviceid', '');
                });
            }
        }
    });

    // ---------------------------------------------------------------
    // serviceType combo
    // ---------------------------------------------------------------
    var serviceIdStore = Ext.create('Ext.data.Store', {
        storeId: 'serviceIdStore',
        pageSize: 100,
        remoteSort: false,
        autoLoad: true,
        fields: [
            { name: 'code', type: 'string' },
            { name: 'value', type: 'string' }
        ],
        proxy: {
            type: 'ajax',
            url: '/Response',
            extraParams: {
                content: 'admin',
                output: 'json',
                totalresults: false,
                node: 'servicetype_combo'
            },
            reader: {
                type: 'json',
                root: 'servicetype_combo.node'
            }
        }
    });

    var serviceIdCombo = Ext.create('Ext.form.field.ComboBox', {
        displayField: 'code',
        valueField: 'code',
        store: serviceIdStore,
        queryMode: 'local',
        selectOnTab: true,
        triggerAction: 'all',
        emptyText: LANG.please_select,
        editable: false,
        lazyRender: true,
        forceSelection: true,
        typeAhead: true,
        listeners: {
            expand: function (field, opts) {
                serviceIdStore.filters.clear();
                // serviceIdStore.load();
            }
        }
    });

    var customMenuItem = ['ConnectTypeChangeAll', 'AutoRecoveryChangeAll'];
    var setCustomMenu = function (cmpId, isView) {
        for (var i = 0; i < customMenuItem.length; i++) {
            if (isView && cmpId === customMenuItem[i]) {
                grid.headerCt.getMenu().down('#' + customMenuItem[i]).setVisible(true);
                grid.headerCt.getMenu().down('#' + customMenuItem[i] + 'Seperator').setVisible(true);

            } else {
                grid.headerCt.getMenu().down('#' + customMenuItem[i]).setVisible(false);
                grid.headerCt.getMenu().down('#' + customMenuItem[i] + 'Seperator').setVisible(false);
            }

        }
    };

    var filters = {
        ftype: 'filters',
        encode: false, // json encode the filter query
        local: false, // defaults to false (remote filtering)
        buildQuery: function (filters) {
            var query = exem.doFilter(filters);
            return { filter: query.toString() };
        },
        filters: [
            { type: 'string', dataIndex: 'serverid' },
            { type: 'string', dataIndex: 'serverno' },
            { type: 'string', dataIndex: 'type' },
            { type: 'string', dataIndex: 'serviceid' },
            { type: 'string', dataIndex: 'descr' },
            { type: 'string', dataIndex: 'ip' },
            { type: 'string', dataIndex: 'port' },
            { type: 'string', dataIndex: 'alias' },
            { type: 'string', dataIndex: 'gatherno' },
            { type: 'list', dataIndex: 'autorecovery', options: [['Y', 'Yes'], ['N', 'No']] },
            { type: 'list', dataIndex: 'connecttype', options: [['RTS', 'RTS'], ['WS', 'WS'], ['SELF', 'SELF'], ['UNKNOWN', 'UNKNOWN']] }
        ]
    };

    // create the Grid
    var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
        clicksToEdit: 1,
        listeners: {
            beforeedit: function (editor, e) {
                if (e.column.dataIndex === 'serviceid' && (e.record.get('connecttype') !== 'WS' && e.record.get('connecttype') !== 'RTS')) {
                    return false;
                }

                var connectTypeVal = null;
                Ext.Array.each(grid.getSelectionModel().getSelection(), function (record) {
                    connectTypeVal = record.get('connecttype');
                });
                var firstStore = serviceIdStore.getAt(0).data.code;
                if (connectTypeVal === 'RTS' && firstStore != "") {
                    serviceIdStore.insert(0, '');
                } else if (connectTypeVal === 'WS' && firstStore == "") {
                    serviceIdStore.removeAt(0);
                }
            },
            edit: function (e) {
                Ext.Array.each(grid.getSelectionModel().getSelection(), function (record, indx) {
                    if (!record.get('alias')) {
                        record.set('alias', record.get('serverid'));
                    }
                });
            }
        }
    });

    var serverSave = function () {
        var validateMessage = checkRequiredItem();
        if (Ext.isEmpty(validateMessage)) {
            Ext.MessageBox.confirm(LANG.save, LANG.selected_save,
                function (btn) {
                    if (btn == 'yes') {
                        // check unique
                        var matchIsFound = true;
                        Ext.Array.each(grid.getSelectionModel().getSelection(), function (record, indx) {
                            if (record.get('connecttype') === 'WS' && record.get('serviceid') === '') {
                                exem.showWarningMessage(LANG.no_service_id);
                                matchIsFound = false;
                                return false;
                            }
                            if (record.get('connecttype') === 'RTS' || record.get('connecttype') === 'SELF') {
                                if (record.get('ip') === '') {
                                    exem.showWarningMessage(LANG.ipaddress + ' ' + LANG.required_check);
                                    matchIsFound = false;
                                    return false;
                                }
                            }
                        });
                        if (matchIsFound == true) {
                            exem.doSubmit(grid.id, ['OPISERVER', 'OPUSERVER']);
                        }
                    }
                }
            );
        } else {
            exem.showWarningMessage(validateMessage);
        }
    }

    var grid = Ext.create('Ext.grid.Panel', {
        id: 'Server',
        title: LANG.server,
        store: store,
        disableSelection: false,
        loadMask: true,
        closable: true,
        selModel: sm,
        columnLines: true,
        features: [filters],
        plugins: [cellEditing],
        tbar: [{
            text: LANG.add,
            iconCls: 'add',
            handler: function () {
                var r = Ext.ModelManager.create({
                    ck: 'I',
                    connecttype: '',
                    serviceid: '',
                    serverno: '0',
                    autorecovery: 'Y',
                    lineno: 1,
                    port: '5080',
                    useyn: 'Y'
                }, 'ServerModel');
                store.insert(0, r);
                grid.view.getEl().dom.scrollTop = 0;
            }
        }, {
            xtype: 'splitbutton',
            text: LANG.save,
            iconCls: 'modify',
            menu: {
                items: [{
                    text: LANG.select_row_save,
                    handler: function () {
                        var rows = grid.getSelectionModel().getSelection();
                        if (rows.length === 0) {
                            exem.showWarningMessage(LANG.no_selected);
                        } else {
                            serverSave();
                        }
                    }
                }]
            },
            handler: function () {
                exem.doEditRowSelect(grid.id);
                var rows = grid.getSelectionModel().getSelection();
                if (rows.length == 0) {
                    exem.showWarningMessage(LANG.no_changed);
                } else {
                    serverSave();
                }
            }
        }, {
            text: LANG.delete,
            iconCls: 'delete',
            handler: function () {
                var rows = grid.getSelectionModel().getSelection();
                if (rows.length == 0) {
                    exem.showWarningMessage(LANG.no_selected);
                } else {
                    Ext.MessageBox.confirm('Delete?', LANG.selected_delete,
                        function (btn) {
                            if (btn == 'yes') {
                                exem.doSubmit(grid.id, ['OPDSERVER']);
                            }
                        }
                    );
                }
            }
        }, '-', {
            text: LANG.clearfilter,
            handler: function () {
                grid.filters.clearFilters();
            }
        }, '->', {
            text: LANG.download,
            iconCls: 'excel',
            handler: function () {
                var sqlstr = exem.doFilter((grid.filters.getFilterData()));
                location.href = "/Response?content=admin&output=excel&totalresults=false&node=server&filter=" + encodeURI(sqlstr);
            }
        }],
        columns: {
            defaults: {
                draggable: false
            },
            items: [
                Ext.create('Ext.grid.RowNumberer', {
                    width: 30,
                    renderer: exem.doEditRowNumber
                }),
                {
                    text: LANG.seq,
                    dataIndex: 'seq',
                    width: 80,
                    sortable: true,
                    hideable: true,
                    listeners: {
                        headertriggerclick: function (ct, column, e, t) {
                            setCustomMenu(null, false);
                        },
                        render: function () {
                            this.setVisible(false);
                        }
                    }
                }, {
                    text: LANG.server_id,
                    dataIndex: 'serverid',
                    width: 110,
                    sortable: true,
                    field: {
                        allowBlank: false,
                        maskRe: /^[A-Za-z0-9\-_]$/
                    },
                    listeners: {
                        headertriggerclick: function (ct, column, e, t) {
                            setCustomMenu(null, false);
                        }
                    }
                }, {
                    text: LANG.server_no,
                    dataIndex: 'serverno',
                    width: 90,
                    sortable: true,
                    field: {
                        allowBlank: false,
                        maskRe: /[0-9]$/
                    },
                    listeners: {
                        headertriggerclick: function (ct, column, e, t) {
                            setCustomMenu(null, false);
                        }
                    }
                }, {
                    text: LANG.connect_type,
                    dataIndex: 'connecttype',
                    width: 80,
                    sortable: true,
                    editor: connectTypeCombo,
                    listeners: {
                        headertriggerclick: function (ct, column, e, t) {
                            setCustomMenu(null, true);
                        }
                    }
                }, {
                    text: LANG.service_id,
                    dataIndex: 'serviceid',
                    width: 150,
                    sortable: true,
                    editor: serviceIdCombo,
                    listeners: {
                        headertriggerclick: function (ct, column, e, t) {
                            setCustomMenu(null, false);
                        }
                    }
                }, {
                    text: LANG.server_alias,
                    dataIndex: 'alias',
                    width: 80,
                    sortable: true,
                    field: {
                        allowBlank: false
                    },
                    listeners: {
                        headertriggerclick: function (ct, column, e, t) {
                            setCustomMenu(null, false);
                        }
                    }
                }, {
                    text: LANG.host,
                    dataIndex: 'host',
                    width: 100,
                    sortable: true,
                    field: {
                        allowBlank: true
                    },
                    listeners: {
                        headertriggerclick: function (ct, column, e, t) {
                            setCustomMenu(null, false);
                        }
                    }
                }, {
                    text: LANG.ipaddress,
                    dataIndex: 'ip',
                    width: 100,
                    sortable: true,
                    field: {
                        allowBlank: true
                    },
                    listeners: {
                        headertriggerclick: function (ct, column, e, t) {
                            setCustomMenu(null, false);
                        }
                    }
                }, {
                    text: LANG.port,
                    dataIndex: 'port',
                    width: 70,
                    sortable: true,
                    field: {
                        allowBlank: false,
                        maskRe: /[0-9]$/
                    },
                    listeners: {
                        headertriggerclick: function (ct, column, e, t) {
                            setCustomMenu(null, false);
                        }
                    }
                }, {
                    text: LANG.auto_recovery,
                    dataIndex: 'autorecovery',
                    width: 80,
                    sortable: true,
                    field: {
                        xtype: 'combobox',
                        typeAhead: true,
                        triggerAction: 'all',
                        selectOnTab: true,
                        editable: false,
                        lazyRender: true,
                        store: [
                            ['Y', 'Yes'],
                            ['N', 'No']
                        ],
                        lazyRender: true,
                        listClass: 'x-combo-list-small'
                    },
                    listeners: {
                        headertriggerclick: function (ct, column, e, t) {
                            setCustomMenu(null, false);
                        }
                    }
                }, {
                    text: LANG.gather_no,
                    dataIndex: 'gatherno',
                    width: 70,
                    sortable: true,
                    field: {
                        allowBlank: false,
                        maskRe: /[0-9]$/
                    },
                    listeners: {
                        headertriggerclick: function (ct, column, e, t) {
                            setCustomMenu(null, false);
                        }
                    }
                }, {
                    text: LANG.description,
                    dataIndex: 'descr',
                    minWidth: 100,
                    sortable: true,
                    flex: 1,
                    field: {
                        allowBlank: true
                    },
                    listeners: {
                        headertriggerclick: function (ct, column, e, t) {
                            setCustomMenu(null, false);
                        }
                    }
                }, {
                    text: LANG.useyn,
                    dataIndex: 'useyn',
                    width: 80,
                    sortable: true,
                    field: {
                        xtype: 'combobox',
                        typeAhead: true,
                        triggerAction: 'all',
                        selectOnTab: true,
                        editable: false,
                        lazyRender: true,
                        store: [
                            ['Y', 'Yes'],
                            ['N', 'No']
                        ],
                        lazyRender: true,
                        listClass: 'x-combo-list-small'
                    },
                    listeners: {
                        headertriggerclick: function (ct, column, e, t) {
                            setCustomMenu('AutoRecoveryChangeAll', true);
                        }
                    }
                }]
        },
        viewConfig: {
            stripeRows: true,
            deferEmptyText: false,
            getRowClass: exem.setNewRowColor
        },
        bbar: Ext.create('Ext.PagingToolbar', {
            store: store,
            displayInfo: true
        }),
        listeners: {
            afterrender: function () {
                var menu = this.headerCt.getMenu();
                menu.add([{
                    itemId: 'ConnectTypeChangeAllSeperator',
                    xtype: 'menuseparator'
                }, {
                    id: 'ConnectTypeChangeAll',
                    text: LANG.change_all,
                    hidden: true,
                    menu: {
                        items: [
                            {
                                text: 'RTS',
                                handler: function () {
                                    var columnDataIndex = menu.activeHeader.dataIndex;
                                    setCheckbox('connecttype', columnDataIndex, 'RTS');
                                }
                            }, {
                                text: 'WS',
                                handler: function () {
                                    var columnDataIndex = menu.activeHeader.dataIndex;
                                    setCheckbox('connecttype', columnDataIndex, 'WS');
                                }
                            }, {
                                text: 'SELF',
                                handler: function () {
                                    var columnDataIndex = menu.activeHeader.dataIndex;
                                    setCheckbox('connecttype', columnDataIndex, 'SELF');
                                }
                            }, {
                                text: 'UNKNOWN',
                                handler: function () {
                                    var columnDataIndex = menu.activeHeader.dataIndex;
                                    setCheckbox('connecttype', columnDataIndex, 'UNKNOWN');
                                }
                            }]
                    }
                }]);
                menu.add([{
                    itemId: 'AutoRecoveryChangeAllSeperator',
                    xtype: 'menuseparator'
                }, {
                    id: 'AutoRecoveryChangeAll',
                    text: LANG.change_all,
                    hidden: true,
                    menu: {
                        items: [
                            {
                                text: 'Yes',
                                handler: function () {
                                    var columnDataIndex = menu.activeHeader.dataIndex;
                                    setCheckbox('useyn', columnDataIndex, 'Y');
                                }
                            }, {
                                text: 'No',
                                handler: function () {
                                    var columnDataIndex = menu.activeHeader.dataIndex;
                                    setCheckbox('useyn', columnDataIndex, 'N');
                                }
                            }]
                    }
                }]);
            },
            sortchange: function () {
                newInsertRecords = this.getStore().getNewRecords();
            }
        }
    });

    store.loadPage(1);

    return grid;  // return instantiated component
})();
