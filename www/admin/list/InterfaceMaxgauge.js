(function () {
    Ext.QuickTips.init();
    Ext.define('Dash.InterfaceMaxgaugeModel', {
        extend: 'Ext.data.Model',
        fields: [
            { name: 'ck', type: 'string', defaultValue: 'Y' },
            { name: 'serviceid', type: 'string' },
            { name: 'loginid', type: 'string' },
            { name: 'passwd', type: 'string' },
            { name: 'ipaddr,', type: 'string' },
            { name: 'port', type: 'string' },
            { name: 'context', type: 'string' },
            { name: 'writetimeout', type: 'int' },
            { name: 'idletimeout', type: 'int' },
            { name: 'maxbinarymessagesize', type: 'int' },
            { name: 'maxtextmessagesize', type: 'int' },
        ]
    });

    var newInsertRecords = [];
    var store = Ext.create('Ext.data.Store', {
        pageSize: 100,
        remoteSort: true,
        model: 'Dash.InterfaceMaxgaugeModel',
        proxy: {
            type: 'ajax',
            url: '/Response',
            extraParams: {
                content: 'admin',
                output: 'json',
                node: 'interface',
                totalresults: true
            },
            reader: {
                type: 'json',
                root: 'interface.node'
            }
        },
        sorters: [
            { property: 'serviceid', direction: 'ASC' }
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
            code: 'serviceid',
            value: LANG.service_id + ' ' + LANG.required_check
        }, {
            code: 'ipaddr',
            value: LANG.ipaddress + ' ' + LANG.required_check
        }, {
            code: 'port',
            value: LANG.port + ' ' + LANG.required_check
        }];
        var message = exem.validateRequiredItem(grid.id, datas);
        return message;
    }

    var sm = new Ext.selection.CheckboxModel({
        multipleSelect: true
    });

    var filters = {
        ftype: 'filters',
        encode: false,
        local: false,
        buildQuery: function (filters) {
            var query = exem.doFilter(filters);
            return { filter: query.toString() };
        },
        filters: [
            { type: 'string', dataIndex: 'serviceid' }
        ]
    };

    // create the Grid
    var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
        clicksToEdit: 1,
        listeners: {
            beforeedit: function (editor, e) {
                if (e.column.dataIndex === 'serviceid' && e.record.get('ck') === 'Y') {
                    return false;
                }
            }
        }
    });

    var interfaceSave = function () {
        var validateMessage = checkRequiredItem();
        if (Ext.isEmpty(validateMessage)) {
            Ext.MessageBox.confirm(LANG.save, LANG.selected_save,
                function (btn) {
                    if (btn == 'yes') {
                        exem.doSubmit(grid.id, ['OPIINTERFACE', 'OPUINTERFACE']);
                    }
                }
            );
        } else {
            exem.showWarningMessage(validateMessage);
        }
    }

    var grid = Ext.create('Ext.grid.Panel', {
        id: 'Interface',
        title: LANG.interface,
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
                    ck: 'I', context: '/ws', writetimeout: '10000', idletimeout: '6000', maxbinarymessagesize: '1048576', maxtextmessagesize: '1048576'
                }, 'Dash.InterfaceMaxgaugeModel');
                store.insert(0, r);
                grid.view.getEl().dom.scrollTop = 0;
            }
        }, {
            xtype: 'splitbutton',
            text: LANG.save,
            iconCls: 'modify',
            itemId: 'data_save_button_item',
            menu: {
                items: [{
                    text: LANG.select_row_save,
                    handler: function () {
                        var rows = grid.getSelectionModel().getSelection();
                        if (rows.length === 0) {
                            exem.showWarningMessage(LANG.no_selected);
                        } else {
                            interfaceSave();
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
                    interfaceSave();
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
                    Ext.MessageBox.confirm(LANG.delete, LANG.selected_save,
                        function (btn) {
                            if (btn == 'yes') {
                                exem.doSubmit(grid.id, ['OPDINTERFACE']);
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
                location.href = "/Response?content=admin&output=excel&totalresults=false&node=interface&filter=" + encodeURI(sqlstr);
            }
        }],
        columns: {
            defaults: {
                hideable: false
            },
            items: [
                Ext.create('Ext.grid.RowNumberer', {
                    width: 30,
                    renderer: exem.doEditRowNumber
                }), {
                    text: LANG.service_id,
                    dataIndex: 'serviceid',
                    width: 110,
                    sortable: true,
                    field: {
                        allowBlank: false
                    }
                }, {
                    text: LANG.ipaddress,
                    dataIndex: 'ipaddr',
                    width: 100,
                    sortable: true,
                    field: {
                        allowBlank: false
                    }
                }, {
                    text: LANG.port,
                    dataIndex: 'port',
                    width: 70,
                    sortable: true,
                    field: {
                        allowBlank: false,
                        maskRe: /[0-9]$/
                    }
                }, {
                    text: LANG.user_id,
                    dataIndex: 'serviceid',
                    width: 110,
                    sortable: true,
                    field: {
                        allowBlank: false
                    }
                }, {
                    text: LANG.password,
                    dataIndex: 'serviceid',
                    width: 110,
                    sortable: true,
                    field: {
                        allowBlank: false
                    }
                }, {
                    text: LANG.context,
                    dataIndex: 'context',
                    width: 90,
                    sortable: true,
                    field: {
                        allowBlank: false
                    }
                }, {
                    text: LANG.write_timeout,
                    dataIndex: 'writetimeout',
                    width: 90,
                    sortable: true,
                    field: {
                        allowBlank: false,
                        maskRe: /[0-9]$/
                    }
                }, {
                    text: LANG.idle_timeout,
                    dataIndex: 'idletimeout',
                    width: 90,
                    sortable: true,
                    field: {
                        allowBlank: false,
                        maskRe: /[0-9]$/
                    }
                }, {
                    text: LANG.maxbinarymessagesize,
                    dataIndex: 'maxbinarymessagesize',
                    width: 130,
                    sortable: true,
                    field: {
                        allowBlank: false,
                        maskRe: /[0-9]$/
                    }
                }, {
                    text: LANG.maxtextmessagesize,
                    dataIndex: 'maxtextmessagesize',
                    width: 120,
                    sortable: true,
                    field: {
                        allowBlank: false,
                        maskRe: /[0-9]$/
                    }
                },]
        },
        viewConfig: {
            enableTextSelection: true,
            deferEmptyText: false,
            getRowClass: exem.setNewRowColor
        },
        bbar: Ext.create('Ext.PagingToolbar', {
            store: store,
            displayInfo: true
        }),
        listeners: {
            sortchange: function () {
                newInsertRecords = this.getStore().getNewRecords();
            }
        }
    });

    store.loadPage(1);

    return grid;  // return instantiated component
})();
