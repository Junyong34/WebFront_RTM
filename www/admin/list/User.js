(function (common) {
    var LANG = common.LANG

    Ext.QuickTips.init();
    Ext.define('UserModel', {
        extend: 'Ext.data.Model',
        fields: [
            { name: 'ck', type: 'string', defaultValue: 'Y' },
            { name: 'userid', type: 'string' },
            { name: 'name', type: 'string' },
            { name: 'passwd' },
            { name: 'phone', type: 'string' },
            { name: 'hp', type: 'string' },
            { name: 'email', type: 'string' },
            { name: 'addtime', type: 'string' },
            { name: 'lang', type: 'string', defaultValue: 'KO' },
            { name: 'useyn', type: 'string' }
        ]
    });

    var newInsertRecords = [];
    var store = Ext.create('Ext.data.Store', {
        pageSize: 100,
        remoteSort: true,
        model: 'UserModel',
        proxy: {
            type: 'ajax',
            url: '/Response',
            extraParams: {
                content: 'admin',
                output: 'json',
                node: 'users',
                totalresults: 'true'
            },
            reader: {
                type: 'json',
                root: 'users.node'
            }
        },
        sorters: [
            { property: 'userid', direction: 'ASC' },
            { property: 'name', direction: 'ASC' }
        ],
        listeners: {
            load: function (store) {
                grid.down('#userDeleteButton').setDisabled(false);
                if (!Ext.isEmpty(newInsertRecords)) {
                    this.insert(0, newInsertRecords);
                    newInsertRecords = [];
                }
            }
        }
    });

    var checkRequiredItem = function () {
        var datas = [{
            code: 'userid',
            value: LANG.user_id + ' ' + LANG.msg_checkrequired
        }, {
            code: 'name',
            value: LANG.name + ' ' + LANG.msg_checkrequired
        }, {
            code: 'passwd',
            value: LANG.password + ' ' + LANG.msg_checkrequired
        }];
        var message = exem.validateRequiredItem(grid.id, datas);
        return message;
    }

    var disableCheckCount = 0;
    var sm = new Ext.selection.CheckboxModel({
        listeners: {
            select: function (rowmodel, record, index) {
                if (record.get('userid') === 'Administrator' ||
                    record.get('userid') === 'Admin') {
                    disableCheckCount++;
                }
                grid.down('#userDeleteButton').setDisabled((disableCheckCount > 0));
            },
            deselect: function (rowmodel, record, index) {
                if (record.get('userid') === 'Administrator' ||
                    record.get('userid') === 'Admin') {
                    disableCheckCount--;
                }
                grid.down('#userDeleteButton').setDisabled((disableCheckCount > 0));
            }
        }
    });

    var getNoUseCellColor = function (value, meta, record) {
        var useyn = '';
        if (record.get('useyn') === 'N') {
            meta.style = 'font-style:italic;color:#82B8E5';
            useyn = '<br><span style=color:#BF0000;>${msg_usernotuse}</span>';
            meta.tdAttr = 'data-qtip="' + value + useyn + '"';
        }
        return value;
    };

    var isCheckPasswd = false;
    var isRunValidation = function (val, callback) {
        try {
            Ext.Ajax.request({
                disableCaching: true,
                url: '/Response',
                method: 'POST',
                async: true,
                params: {
                    node: 'check_detailcode',
                    content: 'admin',
                    output: 'json',
                    p: ['VALID', 'LOGIN_PASSWD']
                },
                success: function (objServerResponse) {
                    var newComponent = objServerResponse.responseText.trim();
                    var jsonData = Ext.JSON.decode(newComponent);
                    callback(('Y' === jsonData.check_detailcode.node[0].descr));
                },
                failure: function (objServerResponse, callOptions) {
                    exem.showErrorMessage('Fail Connect');
                }
            });
        } catch (e) {
            exem.showErrorMessage('Fail Connect');
        }
    }

    var getCheckText = function (row) {
        var arr = [].concat(row.get('phone').split('-')).concat(row.get('hp').split('-')).concat(row.get('userid'));
        Ext.Array.remove(arr, '02');
        Ext.Array.remove(arr, '010');
        return arr;
    }

    var setCheckbox = function (column, columnDataIndex, isCheck) {
        if (column === columnDataIndex) {
            store.each(
                function (rec) {
                    rec.set(column, isCheck);
                }
            );
        }
    };

    var customMenuItem = ['LangChangeAll'];
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
            { type: 'string', dataIndex: 'userid' },
            { type: 'string', dataIndex: 'name' },
            { type: 'string', dataIndex: 'phone' },
            { type: 'string', dataIndex: 'hp' },
            { type: 'string', dataIndex: 'email' },
            { type: 'list', dataIndex: 'lang', options: [['EN', "EN"], ['KO', "KO"]] },
            { type: 'list', dataIndex: 'useyn', options: [['Y', 'Yes'], ['N', 'No']] }
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

    var userSave = function () {
        var validateMessage = checkRequiredItem();
        if (Ext.isEmpty(validateMessage)) {
            var rows = grid.getSelectionModel().getSelection();

            var passwordValidate = function () {
                var isSave = true;
                Ext.Array.each(rows, function (record, indx) {
                    if (isCheckPasswd === true && (record.get('ck') && record.isModified('passwd'))) {
                        if (!exem.validatePasswd(getCheckText(record), record.get('passwd'))) {
                            exem.showWarningMessage(LANG.passwd_in_hint_check);
                            isSave = false;
                            return false;
                        } else if (!exem.doStrengthCheck(record.get('passwd'))) {
                            var questMessage = LANG.passwd_check + '<br/>' + LANG.repeat_char + '<br/>';
                            questMessage = questMessage.replace(/#VARIABLE#/gi, exem.PasswordPolicy.options.length);
                            exem.showWarningMessage(questMessage);
                            isSave = false;
                            return false;
                        }
                    }
                });
                return isSave;
            }
            var save = function () {
                Ext.MessageBox.confirm('Save?', LANG.save,
                    function (btn) {
                        if (btn == 'yes') {
                            Ext.Array.each(rows, function (record, indx) {
                                if (record.get('ck') && !record.isModified('passwd')) {
                                    record.set('passwd', '');
                                }
                            });
                            exem.doSubmit('admin', grid.id, ['OPIUSER', 'OPUUSER']);
                        }
                    }
                );
            }
            isRunValidation(grid.id, function (val) {
                isCheckPasswd = val;
                exem.loadPasswordPolicy(function (isLoad) {
                    if (isLoad === false) return false;
                    if (passwordValidate() === true) {
                        save();
                    };
                });
            });
        } else {
            exem.showWarningMessage(validateMessage);
        }
    }

    var grid = Ext.create('Ext.grid.Panel', {
        id: 'User',
        title: LANG.user,
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
                }, 'UserModel');
                store.insert(0, r);
                r.set('lang', 'KO');
                r.set('addtime', '');
                r.set('useyn', 'Y');
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
                            userSave();
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
                    userSave();
                }
            }
        }, {
            text: LANG.delete,
            itemId: 'userDeleteButton',
            iconCls: 'delete',
            handler: function () {
                var rows = grid.getSelectionModel().getSelection();
                if (rows.length == 0) {
                    exem.showWarningMessage(LANG.no_selected);
                } else {
                    Ext.MessageBox.confirm('Delete?', LANG.confirm_delete,
                        function (btn) {
                            if (btn == 'yes') {
                                exem.doSubmit('admin', grid.id, ['OPDUSER']);
                            }
                        }
                    );
                }
            }
        }, '-', {
            text: LANG.password + ' ' + LANG.reset,
            handler: function () {
                var rows = grid.getSelectionModel().getSelection();
                if (rows.length == 0) {
                    exem.showWarningMessage(LANG.no_selected);
                } else {
                    openPasswdResetWindow();
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
                location.href = "/Response?content=admin&output=excel&totalresults=false&node=user&filter=" + encodeURI(sqlstr);
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
                width: 110,
                sortable: true,
                renderer: getNoUseCellColor,
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
                text: LANG.name,
                dataIndex: 'name',
                width: 100,
                sortable: true,
                renderer: getNoUseCellColor,
                field: {
                    allowBlank: false
                },
                listeners: {
                    headertriggerclick: function () {
                        setCustomMenu(null, false);
                    }
                }
            }, {
                text: LANG.password,
                dataIndex: 'passwd',
                width: 100,
                sortable: false,
                field: {
                    inputType: 'password',
                    allowBlank: false
                },
                renderer: function (value, meta, record) {
                    if (record.get('useyn') === 'N') {
                        meta.style = 'font-style:italic;color:#82B8E5';
                    }
                    return '**************';
                },
                listeners: {
                    headertriggerclick: function () {
                        setCustomMenu(null, false);
                    }
                }
            }, {
                text: LANG.phone_number,
                dataIndex: 'phone',
                width: 100,
                sortable: true,
                renderer: getNoUseCellColor,
                field: {
                    allowBlank: true,
                    maskRe: /^[\-0-9]*$/,
                    validator: function (value) {
                        var check = /^[\-0-9]*$/;
                        if (!check.test(value)) {
                            return false;
                        } else {
                            return true;
                        }
                    }
                },
                listeners: {
                    headertriggerclick: function () {
                        setCustomMenu(null, false);
                    }
                }
            }, {
                text: LANG.cell_number,
                dataIndex: 'hp',
                width: 100,
                sortable: true,
                renderer: getNoUseCellColor,
                field: {
                    allowBlank: true,
                    maskRe: /^[\-0-9]*$/,
                    validator: function (value) {
                        var check = /^[\-0-9]*$/;
                        if (!check.test(value)) {
                            return false;
                        } else {
                            return true;
                        }
                    }
                },
                listeners: {
                    headertriggerclick: function () {
                        setCustomMenu(null, false);
                    }
                }
            }, {
                text: LANG.email,
                dataIndex: 'email',
                width: 200,
                sortable: true,
                renderer: getNoUseCellColor,
                field: {
                    vtype: 'email',
                    allowBlank: true
                },
                listeners: {
                    headertriggerclick: function () {
                        setCustomMenu(null, false);
                    }
                }
            }, {
                text: LANG.lang,
                dataIndex: 'lang',
                width: 70,
                sortable: true,
                renderer: getNoUseCellColor,
                field: {
                    xtype: 'combobox',
                    typeAhead: true,
                    triggerAction: 'all',
                    selectOnTab: true,
                    editable: false,
                    lazyRender: true,
                    store: [
                        ['EN', 'EN'],
                        ['KO', 'KO']
                    ]
                },
                listeners: {
                    headertriggerclick: function () {
                        setCustomMenu('LangChangeAll', true);
                    }
                }
            }, {
                text: LANG.useyn,
                dataIndex: 'useyn',
                width: 60,
                hideable: false,
                sortable: true,
                renderer: getNoUseCellColor,
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
                    ]
                },
                listeners: {
                    headertriggerclick: function () {
                        setCustomMenu(null, false);
                    }
                }
            }, {
                text: LANG.save_time,
                dataIndex: 'addtime',
                minWidth: 130,
                flex: 1,
                sortable: true,
                renderer: exem.doDisable,
                listeners: {
                    headertriggerclick: function () {
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
                    itemId: 'LangChangeAllSeperator',
                    xtype: 'menuseparator'
                }, {
                    id: 'LangChangeAll',
                    text: LANG.change_all,
                    hidden: true,
                    menu: {
                        items: [
                            {
                                text: LANG.korean,
                                handler: function () {
                                    var columnDataIndex = menu.activeHeader.dataIndex;
                                    setCheckbox('lang', columnDataIndex, 'KO');
                                }
                            }, {
                                text: LANG.english,
                                handler: function () {
                                    var columnDataIndex = menu.activeHeader.dataIndex;
                                    setCheckbox('lang', columnDataIndex, 'EN');
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


    /////////////////////////////////////////////////////////////////////
    // User Password Reset
    /////////////////////////////////////////////////////////////////////
    var resetForm = Ext.create('Ext.form.Panel', {
        header: false,
        border: true,
        items: [{
            xtype: 'textfield',
            itemId: 'field_reset_password_item',
            labelWidth: 70,
            fieldLabel: 'Password',
            name: 'passwd',
            inputType: 'password',
            margin: '15 10 10 10',
            anchor: '100%',
            allowBlank: false,
            maxLength: 150,
            fieldStyle: { 'background-color': '#FFF2D4; background-image: none;' },
            listeners: {
                change: function (field, nval, oval) {
                    if (!Ext.isEmpty(nval) && nval.trim().length > 0) {
                        passwdResetWin.down('#user_passwd_reset_button_item').setDisabled(false);
                    } else {
                        passwdResetWin.down('#user_passwd_reset_button_item').setDisabled(true);
                    }
                }
            }
        }, {
            xtype: 'textfield',
            labelWidth: 70,
            fieldLabel: 'Confirm Password',
            name: 'checkpasswd',
            inputType: 'password',
            margin: '0 10 10 10',
            anchor: '100%',
            allowBlank: false,
            maxLength: 150,
            fieldStyle: { 'background-color': '#FFF2D4; background-image: none;' }
        }, {
            xtype: 'hidden',
            hidden: true,
            name: 'ck',
            value: 'Y'
        }]
    });
    var doSaveUserInfo = function () {
        var formObj = resetForm.getForm();
        var selectionModel = grid.getSelectionModel();
        var selectLength = selectionModel.getSelection().length;
        try {
            var loopCount = 0;
            Ext.Array.each(selectionModel.getSelection(), function (record, indx) {
                Ext.Ajax.request({
                    disableCaching: true,
                    url: '/Procedure',
                    method: 'POST',
                    async: false,
                    params: Ext.apply(formObj.getValues(), { userid: record.data.userid, ProcName: 'OPUUSERLOGINDATA' }),
                    success: function (objServerResponse) {
                        loopCount++;
                        var newComponent = objServerResponse.responseText.trim();
                        if (newComponent.indexOf('-') != -1) {
                            exem.showErrorMessage(newComponent);
                        }
                        if (selectLength === loopCount) {
                            store.loadPage(1);
                            passwdResetWin.close();
                        }
                    }
                });
            });
        } catch (e) {
            errorMessage('Restore Fail : ' + e.message);
        }
    }
    var passwdResetWin;
    var openPasswdResetWindow = function () {
        if (!passwdResetWin) {
            passwdResetWin = Ext.create('widget.window', {
                title: LANG.password + ' ' + LANG.reset,
                closable: false,
                resizable: false,
                closeAction: 'hide',
                constrain: true,
                width: 400,
                height: 150,
                modal: true,
                layout: 'fit',
                border: false,
                items: [resetForm],
                buttons: [{
                    text: LANG.save,
                    itemId: 'user_passwd_reset_button_item',
                    disabled: true,
                    handler: function () {
                        var rows = grid.getSelectionModel().getSelection();
                        var passwordValidate = function () {
                            var isSave = true;
                            var formObj = resetForm.getForm();
                            var afterPasswd = formObj.findField('passwd').getValue();
                            if (isCheckPasswd === true) {
                                if (!exem.validatePasswd(null, afterPasswd)) {
                                    exem.showWarningMessage(LANG.passwd_in_hint_check);
                                    isSave = false;
                                    return false;
                                } else if (!exem.doStrengthCheck(afterPasswd)) {
                                    var questMessage = LANG.passwd_check + '<br/>' + LANG.repeat_char + '<br/>';
                                    questMessage = questMessage.replace(/#VARIABLE#/gi, exem.PasswordPolicy.options.length);
                                    exem.showWarningMessage(questMessage);
                                    isSave = false;
                                    return false;
                                }
                            }
                            return isSave;
                        }
                        var save = function () {
                            Ext.MessageBox.confirm('Save?', LANG.save,
                                function (btn) {
                                    if (btn == 'yes') {
                                        doSaveUserInfo();
                                    }
                                }
                            );
                        }
                        var formData = resetForm.getForm().getValues();
                        if (formData.checkpasswd !== formData.passwd) {
                            exem.showWarningMessage(LANG.passwd_confirm_fail);
                            return;
                        }
                        isRunValidation(grid.id, function (val) {
                            isCheckPasswd = val;
                            exem.loadPasswordPolicy(function (isLoad) {
                                if (isLoad === false) return false;
                                if (passwordValidate() === true) {
                                    save();
                                };
                            });
                        });
                    }
                }, {
                    text: LANG.cancel,
                    handler: function () {
                        resetForm.getForm().reset();
                        passwdResetWin.close();
                    }
                }],
                listeners: {
                    show: function () {
                        resetForm.down('#field_reset_password_item').focus(false, 200);
                    }
                }
            });
        }
        resetForm.getForm().reset();
        passwdResetWin.show();
    }

    return grid;  // return instantiated component
})(window.common);
