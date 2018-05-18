'use strict';

(function () {
    Ext.QuickTips.init();

    Ext.define('UserLocationModel', {
        extend: 'Ext.data.Model',
        fields: [
            { name: 'ck', type: 'string', defaultValue: 'Y' },
            { name: 'userid', type: 'string' },
            { name: 'locationid', type: 'string' }
        ]
    });

    var newInsertRecords = [];
    var store = Ext.create('Ext.data.Store', {
        pageSize: 100,
        remoteSort: true,
        model: 'UserLocationModel',
        proxy: {
            type: 'ajax',
            url: '/Response',
            extraParams: {
                content: 'admin',
                output: 'json',
                totalresults: true,
                node: 'userxlocation'
            },
            reader: {
                type: 'json',
                root: 'userxlocation.node'
            }
        },
        sorters: [
            { property: 'userid', direction: 'ASC' }
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

    var filters = {
        ftype: 'filters',
        encode: false, // json encode the filter query
        local: false, // defaults to false (remote filtering)
        buildQuery: function (filters) {
            var query = exem.doFilter(filters);
            return { filter: query.toString() };
        },
        filters: [
            { type: 'string', dataIndex: 'userid', disabled: false },
            { type: 'string', dataIndex: 'serverid' }
        ]
    };

    //////////////////////////////////////////////////////////////////////////////
    // Function - Check Required Items
    //////////////////////////////////////////////////////////////////////////////
    var checkRequiredItem = function () {
        var datas = [{
            code: 'userid',
            value: LANG.user_id + ' ' + LANG.required_check
        }, {
            code: 'locationid',
            value: LANG.location_id + ' ' + LANG.required_check
        }];
        var message = exem.validateRequiredItem(grid.id, datas);
        return message;
    }

    var disableCheckCount = 0;
    var sm = new Ext.selection.CheckboxModel({
        multipleSelect: true
    });

    // create the Grid
    var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
        clicksToEdit: 1,
        listeners: {
            beforeedit: function (editor, e) {
                if ((e.colIdx === 2 || e.colIdx === 3) && e.record.get('ck') === 'Y') {
                    return false;
                }
            }
        }
    });

    var userLocationSave = function () {
        var validateMessage = checkRequiredItem();
        if (Ext.isEmpty(validateMessage)) {
            Ext.MessageBox.confirm(LANG.save, LANG.selected_save,
                function (btn) {
                    if (btn == 'yes') {
                        console.log('A');
                        exem.doSubmit(grid.id, ['OPIUSERXLOCATION']);
                    }
                }
            );
        } else {
            exem.showWarningMessage(validateMessage);
        }
    }

    var grid = Ext.create('Ext.grid.Panel', {
        id: 'UserxLocation',
        title: LANG.userxlocation,
        store: store,
        disableSelection: false,
        loadMask: true,
        features: [filters],
        closable: true,
        selModel: sm,
        columnLines: true,
        plugins: [cellEditing],
        tbar: [{
            text: LANG.add,
            iconCls: 'add',
            handler: function () {
                openUserLocationIDWin();
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
                            userLocationSave();
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
                    userLocationSave();
                }
            }
        }, {
            text: LANG.delete,
            iconCls: 'delete',
            itemId: 'delete_button_item',
            handler: function () {
                var rows = grid.getSelectionModel().getSelection();
                if (rows.length == 0) {
                    exem.showWarningMessage(LANG.no_selected);
                } else {
                    Ext.MessageBox.confirm(LANG.delete, LANG.selected_delete,
                        function (btn) {
                            if (btn == 'yes') {
                                exem.doSubmit(grid.id, ['OPDUSERXLOCATION']);
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
            iconCls: 'button-excel',
            hidden: true,
            handler: function () {
                var sqlstr = exem.doFilter((grid.filters.getFilterData()));
                location.href = "/Response?content=admin&output=excel&totalresults=false&node=userxlocation&filter=" + encodeURI(sqlstr);
            }
        }],
        columns: [
            Ext.create('Ext.grid.RowNumberer', {
                width: 35,
                renderer: exem.doEditRowNumber
            }),
            {
                text: LANG.user_id,
                dataIndex: 'userid',
                minWidth: 150,
                sortable: true
            }, {
                text: LANG.location_id,
                dataIndex: 'locationid',
                minWidth: 200,
                sortable: true
            }],
        viewConfig: {
            stripeRows: true,
            deferEmptyText: false,
            enableTextSelection: true,
            getRowClass: exem.setNewRowColor
        },
        bbar: Ext.create('Ext.PagingToolbar', {
            store: store,
            displayInfo: true
        }),
        listeners: {
            sortchange: function () {
                newInsertRecords = this.getStore().getNewRecords();
            },
            selectionchange: function () {
                var isDisable = false;
                var selectItems = grid.getSelectionModel().getSelection();
                Ext.Array.each(selectItems, function (record) {
                    if ('Y' == record.get('ck')) {
                        isDisable = true;
                        return false;
                    };
                });
                grid.down('#data_save_button_item').setDisabled(isDisable);
            }
        }
    });

    store.loadPage(1);

    /////////////////////////////////////////////////////////////////////////
    // Add User & Location ID
    /////////////////////////////////////////////////////////////////////////
    var userStore = exem.doCombo('admin', 'user_combo').getStore();
    var locationStore = exem.doCombo('admin', 'locationset_combo', 'UNKNOWN').getStore();

    var userGrid = Ext.create('Ext.grid.Panel', {
        store: userStore,
        header: false,
        flex: 1,
        disableSelection: false,
        closable: true,
        columnLines: true,
        selModel: new Ext.selection.CheckboxModel({
            checkOnly: true,
            mode: 'SINGLE'
        }),
        columns: {
            defaults: {
                draggable: false,
                hideable: false,
                resizable: false
            },
            items: [{
                text: LANG.user_id,
                dataIndex: 'code',
                flex: 1
            }]
        },
        viewConfig: {
            deferEmptyText: false
        },
        listeners: {
            select: function (obj, record) {
                var userid = record.get('code');
                locationStore.load({
                    scope: this,
                    params: {
                        'p': userid
                    },
                    callback: function (records) {
                        locationGrid.setDisabled(false);
                    }
                });
            }
        }
    });

    var locationGrid = Ext.create('Ext.grid.Panel', {
        store: locationStore,
        header: false,
        flex: 1,
        disableSelection: false,
        columnLines: true,
        selModel: new Ext.selection.CheckboxModel({
            checkOnly: true,
            showHeaderCheckbox: true,
            listeners: {
                selectionchange: function (model, selectedRows) {
                    if (!Ext.isEmpty(selectedRows) && selectedRows.length > 0) {
                        userLocationIDWin.down('#userlocation_add_button').setDisabled(false);
                    } else {
                        userLocationIDWin.down('#userlocation_add_button').setDisabled(true);
                    }
                }
            }
        }),
        columns: {
            defaults: {
                draggable: false,
                hideable: false,
                resizable: false
            },
            items: [{
                text: LANG.location_id,
                dataIndex: 'code',
                flex: 1
            }]
        },
        viewConfig: {
            deferEmptyText: false
        }
    });

    var configPanel = Ext.create('Ext.panel.Panel', {
        header: false,
        border: false,
        layout: {
            type: 'hbox',
            align: 'stretch',
            padding: 1
        },
        border: false,
        items: [userGrid, { xtype: 'tbtext', width: 3, margin: 0 }, locationGrid]
    });

    var framePanel = Ext.create('Ext.panel.Panel', {
        layout: 'border',
        border: false,
        bodyStyle: { 'background': '#FFF' },
        items: [{
            region: 'center',
            layout: 'fit',
            border: false,
            items: [configPanel]
        }]
    });

    //////////////////////////////////////////////////////////////////
    // Window - Add User x View Set
    //////////////////////////////////////////////////////////////////
    var userLocationIDWin;
    var openUserLocationIDWin = function () {
        if (!userLocationIDWin) {
            userLocationIDWin = Ext.create('widget.window', {
                closable: true,
                closeAction: 'hide',
                constrain: true,
                width: 400,
                minWidth: 400,
                height: 350,
                minHeight: 200,
                modal: true,
                resizable: true,
                layout: 'fit',
                items: [framePanel],
                buttons: [{
                    text: LANG.add_list,
                    itemId: 'userlocation_add_button',
                    disabled: true,
                    handler: function () {

                        var selectUser = userGrid.getSelectionModel().getSelection()[0];
                        var selectionModel = locationGrid.getSelectionModel();
                        var records = selectionModel.getSelection();
                        Ext.Array.each(records, function (record, indx) {
                            var r = Ext.ModelManager.create({ ck: 'I' }, 'UserLocationModel');
                            r.set('userid', selectUser.get('code'));
                            r.set('locationid', record.get('code'));
                            store.insert(0, r);
                        });
                        userLocationIDWin.close();
                        grid.view.getEl().dom.scrollTop = 0;
                    }
                }, {
                    text: LANG.cancel,
                    handler: function () {
                        userLocationIDWin.close();
                    }
                }]
            });
        }
        userLocationIDWin.show();
        userStore.loadPage(1);
        locationStore.removeAll();
        locationGrid.setDisabled(true);
    }

    return grid;  // return instantiated component
})();
