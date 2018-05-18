(function () {
    Ext.QuickTips.init();
    Ext.define('Dash.CodedetailModel', {
        extend: 'Ext.data.Model',
        fields: [
            { name: 'ck', type: 'string', defaultValue: 'Y' },
            { name: 'code', type: 'string' },
            { name: 'codedetail', type: 'string' },
            { name: 'descr', type: 'string' }
        ]
    });

    var newInsertRecords = [];
    var store = Ext.create('Ext.data.Store', {
        pageSize: 100,
        remoteSort: true,
        model: 'Dash.CodedetailModel',
        proxy: {
            type: 'ajax',
            url: '/Response?node=codedetail',
            extraParams: {
                content: 'admin',
                output: 'json',
                totalresults: true
            },
            reader: {
                type: 'json',
                root: 'codedetail.node'
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

    var codeComboStore = Ext.create('Ext.data.Store', {
        pageSize: 500,
        remoteSort: false,
        autoLoad: true,
        fields: [{
            name: 'code',
            type: 'string'
        },
        {
            name: 'descr',
            type: 'string'
        }
        ],
        proxy: {
            type: 'ajax',
            url: '/Response',
            extraParams: {
                content: 'admin',
                output: 'json',
                node: 'code'
            },
            reader: {
                type: 'json',
                root: 'code.node'
            }
        }
    })

    var codeCombo = Ext.create('Ext.form.field.ComboBox', {
        displayField: exem.ComboDisplayItem1,
        valueField: 'code',
        store: codeComboStore,
        queryMode: 'local',
        selectOnTab: true,
        triggerAction: 'all',
        editable: true,
        lazyRender: true,
        forceSelection: true,
        typeAhead: true,
        emptyText: LANG.please_selectm,
        listConfig: {
            getInnerTpl: function () {
                return '<div data-qtip="{code}. {descr}">{code} ({descr})</div>';
            }
        },
        listeners: {
            expand: function (field, opts) {
                codeCombo.filters.clear();
                codeCombo.load();
            }
        }
    });

    var checkRequiredItem = function () {
        var datas = [{
            code: 'code',
            value: LANG.code + ' ' + LANG.required_check
        }, {
            code: 'codedetail',
            value: LANG.codedetail + ' ' + LANG.required_check
        }, {
            code: 'descr',
            value: LANG.description + ' ' + LANG.required_check
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
            { type: 'string', dataIndex: 'codedetail' }
        ]
    };

    // create the Grid
    var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
        clicksToEdit: 1,
        listeners: {
            beforeedit: function (editor, e) {
                if ((e.column.dataIndex === 'code' || e.column.dataIndex === 'codedetail') && e.record.get('ck') === 'Y') {
                    return false;
                }
            }
        }
    });

    var codeDetailSave = function () {
        var validateMessage = checkRequiredItem();
        if (Ext.isEmpty(validateMessage)) {
            Ext.MessageBox.confirm(LANG.save, LANG.selected_save,
                function (btn) {
                    if (btn == 'yes') {
                        exem.doSubmit('admin', grid.id, ['OPICODEDETAIL', 'OPUCODEDETAIL']);
                    }
                }
            );
        } else {
            exem.showWarningMessage(validateMessage);
        }
    }

    var grid = Ext.create('Ext.grid.Panel', {
        id: 'CodeDetail',
        title: LANG.codedetail,
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
                }, 'Dash.CodedetailModel');
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
                            codeDetailSave();
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
                    codeDetailSave();
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
                                exem.doSubmit('admin', grid.id, ['OPDCODEDETAIL']);
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
                location.href = '/Response?content=admin&output=excel&totalresults=false&node=codedetail&filter=' + encodeURI(sqlstr);
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
                editor: codeCombo
            }, {
                text: LANG.codedetail,
                dataIndex: 'codedetail',
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
            stripeRows: true,
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

    return grid;
})();
