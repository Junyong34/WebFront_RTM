(function () {
    Ext.QuickTips.init();
    Ext.define('UserxProgramModel', {
        extend: 'Ext.data.Model',
        fields: [
            { name: 'ck', type: 'string', defaultValue: 'Y' },
            { name: 'userid', type: 'string' },
            { name: 'pgmid', type: 'string' },
            { name: 'menugroup', type: 'string' },
            { name: 'openobject', type: 'string' },
            { name: 'insertd', type: 'bool', convert: strConvert },
            { name: 'updated', type: 'bool', convert: strConvert },
            { name: 'deleted', type: 'bool', convert: strConvert }
        ]
    });

    function strConvert (v) {
        return (v === "Y" || v === true) ? true : false;
    }

    function boolConvert (v) {
        return (v === true) ? "Y" : "N";
    }

    var newInsertRecords = [];
    var store = Ext.create('Ext.data.Store', {
        pageSize: 100,
        remoteSort: true,
        model: 'UserxProgramModel',
        proxy: {
            type: 'ajax',
            url: '/Response',
            extraParams: {
                content: 'admin',
                output: 'json',
                node: 'userxprogram',
                totalresults: true
            },
            reader: {
                type: 'json',
                root: 'userxprogram.node'
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

    var userComboStore = Ext.create('Ext.data.Store', {
        pageSize: 500,
        remoteSort: false,
        autoLoad: true,
        fields: [{
            name: 'userid',
            type: 'string'
        }, {
            name: 'name',
            type: 'string'
        }],
        proxy: {
            type: 'ajax',
            url: '/Response',
            extraParams: {
                content: 'admin',
                output: 'json',
                node: 'users',
            },
            reader: {
                type: 'json',
                root: 'users.node'
            }
        }
    });

    // Simple ComboBox using the data store
    var userCombo = Ext.create('Ext.form.field.ComboBox', {
        displayField: 'userid',
        valueField: 'userid',
        store: userComboStore,
        queryMode: 'local',
        selectOnTab: true,
        triggerAction: 'all',
        editable: true,
        lazyRender: true,
        forceSelection: true,
        typeAhead: true,
        emptyText: LANG.please_select,
        listConfig: {
            getInnerTpl: function () {
                return '<div data-qtip="{userid}. {name}">{userid} ({name})</div>';
            }
        },
        listeners: {
            expand: function (field, opts) {
                userComboStore.filters.clear();
                userComboStore.load();
            }
        }
    });

    var pgmidComboStore = Ext.create('Ext.data.Store', {
        pageSize: 500,
        remoteSort: false,
        autoLoad: true,
        fields: [{
            name: 'pgmid',
            type: 'string'
        }, {
            name: 'openobject',
            type: 'string'
        }],
        proxy: {
            type: 'ajax',
            url: '/Response',
            extraParams: {
                content: 'admin',
                output: 'json',
                node: 'program',
            },
            reader: {
                type: 'json',
                root: 'program.node'
            }
        }
    });

    // Simple ComboBox using the data store
    var pgmidCombo = Ext.create('Ext.form.field.ComboBox', {
        displayField: 'pgmid',
        valueField: 'pgmid',
        store: pgmidComboStore,
        queryMode: 'local',
        selectOnTab: true,
        triggerAction: 'all',
        editable: true,
        lazyRender: true,
        forceSelection: true,
        typeAhead: true,
        emptyText: LANG.please_select,
        listConfig: {
            getInnerTpl: function () {
                return '<div data-qtip="{pgmid}. {openobject}">{pgmid} ({openobject})</div>';
            }
        },
        listeners: {
            expand: function (field, opts) {
                pgmidComboStore.filters.clear();
                pgmidComboStore.load();
            }
        }
    });

    var checkRequiredItem = function () {
        var datas = [{
            code: 'userid',
            value: LANG.user_id + ' ' + LANG.required_check
        }, {
            code: 'pgmid',
            value: LANG.program_id + ' ' + LANG.required_check
        }];
        var message = exem.validateRequiredItem(grid.id, datas);
        return message;
    }

    var sm = new Ext.selection.CheckboxModel({
        // checkOnly:true,
        multipleSelect: true,
        listeners: {
            beforeselect: function (selModel, record, rowIndex) {
            }
        }
    });

    var filters = {
        ftype: 'filters',
        encode: false, // json encode the filter query
        local: false, // defaults to false (remote filtering)
        buildQuery: function (filters) {
            var query = exem.doFilter(filters);
            return { filter: query.toString() };
        },
        filters: [
            { type: 'string', dataIndex: 'userid' },
            { type: 'string', dataIndex: 'pgmid' },
            { type: 'string', dataIndex: 'menugroup' },
            { type: 'string', dataIndex: 'openobject' },
            { type: 'list', dataIndex: 'insertd', options: [['Y', 'Yes'], ['N', 'No']] },
            { type: 'list', dataIndex: 'updated', options: [['Y', 'Yes'], ['N', 'No']] },
            { type: 'list', dataIndex: 'deleted', options: [['Y', 'Yes'], ['N', 'No']] }
        ]
    };

    var setCheckbox = function (columnDataIndex, isCheck) {
        if ('insertd' === columnDataIndex) {
            store.each(function (rec) { rec.set('insertd', isCheck) })
        } else if ('updated' === columnDataIndex) {
            store.each(function (rec) { rec.set('updated', isCheck) })
        } else if ('deleted' === columnDataIndex) {
            store.each(function (rec) { rec.set('deleted', isCheck) })
        }
    }

    // create the Grid
    var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
        clicksToEdit: 1,
        listeners: {
            beforeedit: function (editor, e) {
                if (e.record.get('ck') === 'Y' && (e.column.dataIndex === 'pgmid' || e.column.dataIndex === 'userid')) {
                    return false;
                }
            }
        }
    });

    var userProgramSave = function () {
        var validateMessage = checkRequiredItem();
        if (Ext.isEmpty(validateMessage)) {
            Ext.MessageBox.confirm(LANG.save, LANG.selected_save,
                function (btn) {
                    if (btn == 'yes') {
                        var rows = grid.getSelectionModel().getSelection();
                        Ext.Array.each(rows, function (record, indx) {
                            record.set('insertallowed', boolConvert(record.get('insertd')));
                            record.set('updateallowed', boolConvert(record.get('updated')));
                            record.set('deleteallowed', boolConvert(record.get('deleted')));
                            record.commit();
                        });
                        exem.doSubmit('admin', grid.id, ['OPIUSERXPROGRAM', 'OPUUSERXPROGRAM']);
                    }
                }
            );
        } else {
            exem.showWarningMessage(validateMessage);
        }
    }

    var grid = Ext.create('Ext.grid.Panel', {
        id: 'UserxProgram',
        title: LANG.userxprogram,
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
                }, 'UserxProgramModel');
                r.set('menugroup', '');
                r.set('openobject', '');
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
                            userProgramSave();
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
                    userProgramSave();
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
                                exem.doSubmit('admin', grid.id, ['OPDUSERXPROGRAM']);
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
                location.href = "/Response?content=admin&output=excel&totalresults=false&node=userxprogram&filter=" + encodeURI(sqlstr);
            }
        }],
        columns: [
            Ext.create('Ext.grid.RowNumberer', {
                width: 30,
                renderer: exem.doEditRowNumber
            }),
            {
                text: LANG.user_id,
                dataIndex: 'userid',
                width: 150,
                sortable: true,
                editor: userCombo,
                listeners: {
                    headertriggerclick: function () {
                        grid.headerCt.getMenu().down('#UserxProgramxMenuSeparator1').setVisible(false);
                        grid.headerCt.getMenu().down('#UserxProgramxSelectMenu').setVisible(false);
                        grid.headerCt.getMenu().down('#UserxProgramxDeselectMenu').setVisible(false);
                    }
                }
            }, {
                text: LANG.program_id,
                dataIndex: 'pgmid',
                width: 220,
                sortable: true,
                editor: pgmidCombo,
                listeners: {
                    headertriggerclick: function () {
                        grid.headerCt.getMenu().down('#UserxProgramxMenuSeparator1').setVisible(false);
                        grid.headerCt.getMenu().down('#UserxProgramxSelectMenu').setVisible(false);
                        grid.headerCt.getMenu().down('#UserxProgramxDeselectMenu').setVisible(false);
                    }
                }
            }, {
                text: LANG.open_object,
                dataIndex: 'openobject',
                width: 220,
                sortable: true,
                listeners: {
                    headertriggerclick: function () {
                        grid.headerCt.getMenu().down('#UserxProgramxMenuSeparator1').setVisible(false);
                        grid.headerCt.getMenu().down('#UserxProgramxSelectMenu').setVisible(false);
                        grid.headerCt.getMenu().down('#UserxProgramxDeselectMenu').setVisible(false);
                    }
                },
                renderer: exem.doDisable
            }, {
                xtype: 'checkcolumn',
                text: LANG.insert_allowed,
                dataIndex: 'insertd',
                value: true,
                minWidth: 80,
                width: 100,
                sortable: true,
                listeners: {
                    headertriggerclick: function () {
                        grid.headerCt.getMenu().down('#UserxProgramxMenuSeparator1').setVisible(true);
                        grid.headerCt.getMenu().down('#UserxProgramxSelectMenu').setVisible(true);
                        grid.headerCt.getMenu().down('#UserxProgramxDeselectMenu').setVisible(true);
                    }
                }
            }, {
                xtype: 'checkcolumn',
                text: LANG.update_allowed,
                dataIndex: 'updated',
                value: true,
                minWidth: 80,
                width: 100,
                sortable: true,
                listeners: {
                    headertriggerclick: function () {
                        grid.headerCt.getMenu().down('#UserxProgramxMenuSeparator1').setVisible(true);
                        grid.headerCt.getMenu().down('#UserxProgramxSelectMenu').setVisible(true);
                        grid.headerCt.getMenu().down('#UserxProgramxDeselectMenu').setVisible(true);
                    }
                }
            }, {
                xtype: 'checkcolumn',
                text: LANG.delete_allowed,
                dataIndex: 'deleted',
                value: true,
                minWidth: 100,
                width: 100,
                sortable: true,
                listeners: {
                    headertriggerclick: function () {
                        grid.headerCt.getMenu().down('#UserxProgramxMenuSeparator1').setVisible(true);
                        grid.headerCt.getMenu().down('#UserxProgramxSelectMenu').setVisible(true);
                        grid.headerCt.getMenu().down('#UserxProgramxDeselectMenu').setVisible(true);
                    }
                }
            }, {
                text: LANG.menu_group,
                dataIndex: 'menugroup',
                width: 150,
                minWidth: 100,
                sortable: true,
                flex: 1,
                listeners: {
                    headertriggerclick: function () {
                        grid.headerCt.getMenu().down('#UserxProgramxMenuSeparator1').setVisible(false);
                        grid.headerCt.getMenu().down('#UserxProgramxSelectMenu').setVisible(false);
                        grid.headerCt.getMenu().down('#UserxProgramxDeselectMenu').setVisible(false);
                    }
                },
                renderer: exem.doDisable
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
                    itemId: 'UserxProgramxMenuSeparator1',
                    xtype: 'menuseparator'
                }, {
                    itemId: 'UserxProgramxSelectMenu',
                    text: LANG.select_all,
                    hidden: true,
                    handler: function () {
                        var columnDataIndex = menu.activeHeader.dataIndex;
                        setCheckbox(columnDataIndex, true);
                    }
                }]);
                menu.add([{
                    itemId: 'UserxProgramxDeselectMenu',
                    text: LANG.deselect_all,
                    hidden: true,
                    handler: function () {
                        var columnDataIndex = menu.activeHeader.dataIndex;
                        setCheckbox(columnDataIndex, false);
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
