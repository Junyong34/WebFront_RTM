(function () {
    Ext.QuickTips.init();
    Ext.define('ProgramModel', {
        extend: 'Ext.data.Model',
        fields: [
            { name: 'ck', type: 'string', defaultValue: 'Y' },
            { name: 'pgmid', type: 'int' },
            { name: 'openobject', type: 'string' },
            { name: 'menugroup', type: 'string' },
            { name: 'delflag', type: 'string' },
            { name: 'tab_id', type: 'string', defaultValue: 1 }
        ]
    });

    var newInsertRecords = [];
    var store = Ext.create('Ext.data.Store', {
        pageSize: 100,
        remoteSort: true,
        model: 'ProgramModel',
        proxy: {
            type: 'ajax',
            url: '/Response',
            extraParams: {
                content: 'admin',
                output: 'json',
                node: 'program',
                totalresults: true
            },
            reader: {
                type: 'json',
                root: 'program.node'
            }
        },
        sorters: [
            { property: 'pgmid', direction: 'ASC' }
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
            code: 'openobject',
            value: LANG.open_object + ' ' + LANG.required_check
        }, {
            code: 'menugroup',
            value: LANG.menu_group + ' ' + LANG.required_check
        }];
        var message = exem.validateRequiredItem(grid.id, datas);
        return message;
    }

    var sm = new Ext.selection.CheckboxModel({
        //		checkOnly:true,
        multipleSelect: true,
        listeners: {
            beforeselect: function (selModel, record, rowIndex) {
            }
        }
    });

    var setCheckbox = function (column, columnDataIndex, isCheck) {
        if (column === columnDataIndex) {
            store.each(
                function (rec) {
                    rec.set(column, isCheck);
                }
            );
        }
    };

    var customMenuItem = ['DelflagChangeAll'];
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
        encode: false,
        local: false,
        buildQuery: function (filters) {
            var query = exem.doFilter(filters);
            return { filter: query.toString() };
        },
        filters: [
            { type: 'list', dataIndex: 'delflag', options: [['Y', "Yes"], ['N', "No"]] }
        ]
    };

    // create the Grid
    var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
        clicksToEdit: 1,
        listeners: {
            beforeedit: function (editor, e) {
                if (e.colIdx === 2 && e.record.get('ck') === 'Y') {
                    return false;
                }
            }
        }
    });

    var programSave = function () {
        var validateMessage = checkRequiredItem();
        if (Ext.isEmpty(validateMessage)) {
            Ext.MessageBox.confirm(LANG.save, LANG.selected_save,
                function (btn) {
                    if (btn == 'yes') {
                        exem.doSubmit('admin', grid.id, ['OPIPROGRAM', 'OPUPROGRAM']);
                    }
                }
            );
        } else {
            exem.showWarningMessage(validateMessage);
        }
    }

    var grid = Ext.create('Ext.grid.Panel', {
        id: 'Program',
        title: LANG.program,
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
                    ck: 'I', delflag: 'N'
                }, 'ProgramModel');
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
                            programSave();
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
                    programSave();
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
                                exem.doSubmit('admin', grid.id, ['OPDPROGRAM']);
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
                location.href = "/Response?content=admin&output=excel&totalresults=false&node=program&filter=" + encodeURI(sqlstr);
            }
        }],
        columns: [
            Ext.create('Ext.grid.RowNumberer', {
                width: 30,
                renderer: exem.doEditRowNumber
            }),
            {
                text: LANG.program_id,
                dataIndex: 'pgmid',
                width: 110,
                sortable: true,
                align: 'right',
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
                text: LANG.open_object,
                dataIndex: 'openobject',
                width: 150,
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
                text: LANG.menu_group,
                dataIndex: 'menugroup',
                width: 150,
                //hidden: true,
                sortable: false,
                field: {
                    allowBlank: false
                },
                listeners: {
                    headertriggerclick: function (ct, column, e, t) {
                        setCustomMenu(null, false);
                    }
                }
            }, {
                text: LANG.delete2,
                dataIndex: 'delflag',
                width: 100,
                sortable: true,
                field: {
                    xtype: 'combobox',
                    typeAhead: true,
                    triggerAction: 'all',
                    selectOnTab: true,
                    editable: false,
                    lazyRender: true,
                    store: [
                        ['Y', 'Y'],
                        ['N', 'N']
                    ]
                },
                listeners: {
                    headertriggerclick: function (ct, column, e, t) {
                        setCustomMenu('DelflagChangeAll', true);
                    }
                }
            }, {
                text: LANG.tab_id,
                dataIndex: 'tab_id',
                width: 120,
                sortable: true,
                flex: 1,
                field: {
                    xtype: 'numberfield',
                    maxValue: 99,
                    minValue: 1
                },
                listeners: {
                    headertriggerclick: function (ct, column, e, t) {
                        setCustomMenu(null, false);
                    }
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
            afterrender: function () {
                var menu = this.headerCt.getMenu();
                menu.add([{
                    itemId: 'DelflagChangeAllSeperator',
                    xtype: 'menuseparator'
                }, {
                    id: 'DelflagChangeAll',
                    text: LANG.change_all,
                    hidden: true,
                    menu: {
                        items: [
                            {
                                text: 'Yes',
                                handler: function () {
                                    var columnDataIndex = menu.activeHeader.dataIndex;
                                    setCheckbox('delflag', columnDataIndex, 'Y');
                                }
                            }, {
                                text: 'No',
                                handler: function () {
                                    var columnDataIndex = menu.activeHeader.dataIndex;
                                    setCheckbox('delflag', columnDataIndex, 'N');
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
