(function (common) {
    var LANG = common.LANG

    Ext.QuickTips.init();
    Ext.define('Dash.CodeModel', {
        extend: 'Ext.data.Model',
        fields: [
            { name: 'ck', type: 'string', defaultValue: 'Y' },
            { name: 'code', type: 'string' },
            { name: 'descr', type: 'string' }
        ]
    });

    var newInsertRecords = [];
    var store = Ext.create('Ext.data.Store', {
        pageSize: 100,
        remoteSort: true,
        model: 'Dash.CodeModel',
        proxy: {
            type: 'ajax',
            url: '/Response',
            extraParams: {
                content: 'admin',
                output: 'json',
                node: 'code',
                totalresults: true
            },
            reader: {
                type: 'json',
                root: 'code.node'
            }
        },
        sorters: [
            { property: 'code', direction: 'ASC' }
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
            code: 'code',
            value: LANG.code + ' ' + LANG.required_check
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
            { type: 'string', dataIndex: 'code' },
            { type: 'string', dataIndex: 'descr' }
        ]
    };
    // create the Grid
    var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
        clicksToEdit: 1,
        listeners: {
            beforeedit: function (editor, e) {
                if (e.column.dataIndex === 'code' && e.record.get('ck') === 'Y') {
                    return false;
                }
            }
        }
    });

    var codeSave = function () {
        var validateMessage = checkRequiredItem();
        if (Ext.isEmpty(validateMessage)) {
            Ext.MessageBox.confirm(LANG.save, LANG.selected_save,
                function (btn) {
                    if (btn == 'yes') {
                        exem.doSubmit(grid.id, ['OPICODE', 'OPUCODE']);
                    }
                }
            );
        } else {
            exem.showWarningMessage(validateMessage);
        }
    }

    var grid = Ext.create('Ext.grid.Panel', {
        id: 'Code',
        title: LANG.code,
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
                    ck: 'I'
                }, 'Dash.CodeModel');
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
                            codeSave();
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
                    codeSave();
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
                    Ext.MessageBox.confirm(LANG.delete, LANG.selected_delete,
                        function (btn) {
                            if (btn == 'yes') {
                                exem.doSubmit(grid.id, ['OPDCODE']);
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
                location.href = "/Response?content=admin&output=excel&node=code&filter=" + encodeURI(sqlstr);
            }
        }],
        columns: [
            Ext.create('Ext.grid.RowNumberer', {
                width: 30,
                renderer: exem.doEditRowNumber
            }),
            {
                text: LANG.code,
                dataIndex: 'code',
                width: 110,
                sortable: true,
                field: {
                    allowBlank: false
                }
            }, {
                text: LANG.description,
                dataIndex: 'descr',
                width: 300,
                sortable: true,
                flex: 1,
                field: {
                    allowBlank: false
                }
            }],
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
})(window.common);
