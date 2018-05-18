(function (common) {
    var LANG = common.LANG;
    var userData;

    Ext.QuickTips.init();

    // ----- Selection Bug Fixed for Grouping Grid!
    Ext.view.Table.override({
        hasActiveGrouping: function () {
            return this.isGrouping && this.store.isGrouped();
        },
        getRecord: function (node) {
            var me = this;
            var record;
            var recordIndex;

            if (me.store.isDestroyed) {
                return;
            }
            node = me.getNode(node);
            if (node) {
                if (!me.hasActiveGrouping()) {
                    recordIndex = node.getAttribute('data-recordIndex');
                    if (recordIndex) {
                        recordIndex = parseInt(recordIndex, 10);
                        if (recordIndex > -1) {
                            return me.store.data.getAt(recordIndex);
                        }
                    }
                }
                if (!record) {
                    record = this.dataSource.data.get(node.getAttribute('data-recordId'));
                }
                return record;
            }
        },
        indexInStore: function (node) {
            node = this.getNode(node, true);
            if (!node && node !== 0) {
                return -1;
            }
            var recordIndex = node.getAttribute('data-recordIndex');
            if (recordIndex) {
                return parseInt(recordIndex, 10);
            }
            return this.dataSource.indexOf(this.getRecord(node));
        }
    });

    Ext.override(Ext.grid.plugin.CellEditing, {
        showEditor: function (ed, context, value) {
            var me = this;
            var record = context.record;
            var columnHeader = context.column;
            var sm = me.grid.getSelectionModel();
            var selection = sm.getCurrentPosition();
            var otherView = selection && selection.view;

            if (otherView && otherView !== me.view) {
                return me.lockingPartner.showEditor(ed, me.lockingPartner.getEditingContext(selection.record, selection.columnHeader), value);
            }

            me.setEditingContext(context);
            me.setActiveEditor(ed);
            me.setActiveRecord(record);
            me.setActiveColumn(columnHeader);

            if (sm.selectByPosition && (!selection || selection.column !== context.colIdx || selection.row !== context.rowIdx)) {
                sm.selectByPosition({
                    row: (context.store.getGroupField && !!context.store.getGroupField()) ? context.record.index : context.rowIdx,
                    column: context.colIdx,
                    view: me.view
                });
            }

            ed.startEdit(me.getCell(record, columnHeader), value, context);
            me.editing = true;
            me.scroll = me.view.el.getScroll();
        },
    });
    // ----- END

    var setLoginInfo = function (callback) {
        userinfo.setLoading(true);
        common.utils.ajax.get('/Response', {
            content: 'admin',
            output: 'json',
            node: 'userinfo',
            p: ADMIN_STORE.session.user.id
        }).then(function (data) {
            callback(data.userinfo.node[0]);
        }).catch(function (e) {
            userinfo.setLoading(false);
            exem.showErrorMessage('Refresh Fail : ' + e.message);
            console.error(e.message);
        });
    }

    var loadLoginInfo = function () {
        setLoginInfo(function (data) {
            userData = data;

            userinfo.setSource({
                userid: data.userid,
                name: data.name,
                lang: data.lang.toUpperCase(),
                version: ADMIN_STORE.session.version.name,
                dbversion: data.dbversion,
                addtime: moment(data.addtime).format('YYYY-MM-DD HH:mm:ss')
            });
            userinfo.setLoading(false);
        });
    }

    var userinfo = Ext.create('Ext.grid.property.Grid', {
        title: 'Information',
        cls: 'multiline',
        sortableColumns: false,
        enableLocking: true,
        source: {
            userid: '',
            name: '',
            lang: '',
            version: '',
            dbversion: ''
        },
        propertyNames: {
            userid: 'User ID',
            name: 'User Name',
            lang: 'Language',
            version: 'Dashboard Version',
            dbversion: 'Repository Server Version'

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

    var changeUserInfo = {
        xtype: 'button',
        text: LANG.login_user_info,
        margin: '10 0 0 0',
        handler: function () {
            openUserEditWindow();
        }
    }

    var panel = Ext.create('Ext.panel.Panel', {
        id: 'LoginInfo',
        title: LANG.login_info,
        closable: false,
        header: true,
        bodyPadding: 10,
        overflowY: 'auto',
        layout: {
            type: 'vbox',
            align: 'stretch',
            pack: 'start'
        },
        tbar: [{
            text: LANG.refresh,
            iconCls: 'refresh',
            handler: function () {
                userinfo.setLoading({
                    msg: 'Loading data...'
                });
                loadLoginInfo();
            }
        }],
        items: [
            userinfo
            , changeUserInfo
        ]
    })

    ///////////////////////////////////////////////////////////////////////////////
    // User Edit Form
    ///////////////////////////////////////////////////////////////////////////////
    var langCombo = exem.doSimpleCombo([['EN', 'EN'], ['KO', 'KO']]);
    langCombo.editable = false;
    langCombo.fieldLabel = LANG.lang;
    langCombo.name = 'lang';
    langCombo.fieldStyle = { 'background-color': '#FFF2D4; background-image: none;' };
    langCombo.width = 300;

    var userForm = Ext.create('Ext.form.Panel', {
        closable: false,
        header: false,
        border: false,
        bodyPadding: 10,
        items: [{
            xtype: 'fieldset',
            items: [{
                xtype: 'textfield',
                fieldLabel: LANG.user_id,
                margin: '5 0 5 0',
                name: 'userid',
                width: 300,
                readOnly: true,
                fieldStyle: { 'background-color': '#EDEDED; background-image: none;' }
            }, {
                xtype: 'textfield',
                fieldLabel: LANG.name,
                name: 'name',
                enforceMaxLength: true,
                width: 300,
                maxLength: 150,
                fieldStyle: { 'background-color': '#FFF2D4; background-image: none;' }
            }, {
                xtype: 'textfield',
                fieldLabel: LANG.password,
                name: 'passwd',
                enforceMaxLength: true,
                allowBlank: false,
                allowOnlyWhitespace: false,
                inputType: 'password',
                width: 300,
                maxLength: 150,
                fieldStyle: { 'background-color': '#FFF2D4; background-image: none;' }
            }, {
                xtype: 'textfield',
                fieldLabel: LANG.phone_number,
                name: 'phone',
                enforceMaxLength: true,
                width: 300,
                maxLength: 150,
                maskRe: /^[\-0-9]*$/,
                fieldStyle: { 'background-color': '#FFF2D4; background-image: none;' }
            }, {
                xtype: 'textfield',
                fieldLabel: LANG.cell_number,
                name: 'hp',
                enforceMaxLength: true,
                width: 300,
                maxLength: 150,
                maskRe: /^[\-0-9]*$/,
                fieldStyle: { 'background-color': '#FFF2D4; background-image: none;' }
            }, {
                xtype: 'textfield',
                fieldLabel: LANG.email,
                name: 'email',
                enforceMaxLength: true,
                width: 300,
                maxLength: 150,
                fieldStyle: { 'background-color': '#FFF2D4; background-image: none;' }
            }, langCombo,
            {
                xtype: 'hidden',
                hidden: true,
                name: 'useyn'
            }, {
                xtype: 'hidden',
                hidden: true,
                name: 'smsflag'
            }, {
                xtype: 'hidden',
                hidden: true,
                name: 'smsset'
            }, {
                xtype: 'hidden',
                hidden: true,
                name: 'addtime'
            }, {
                xtype: 'hidden',
                hidden: true,
                name: 'ck',
                value: 'Y'
            }]
        }]
    });

    var isCheckPasswd = false;
    var isRunValidation = function (callback) {
        common.utils.ajax.get('/Response', {
            content: 'admin',
            output: 'json',
            node: 'check_detailcode',
            p: ['VALID', 'LOGIN_PASSWD']
        }).then(function (data) {
            callback(data.check_detailcode.node[0].descr === 'Y');
        });
    }

    var beforePasswd = null;
    var doSaveUserInfo = function () {
        var formObj = userForm.getForm();
        try {
            Ext.Ajax.request({
                disableCaching: true,
                url: '../Procedure',
                method: 'POST',
                async: false,
                params: Ext.apply(formObj.getValues(), { ProcName: 'OPUUSER' }),
                success: function (objServerResponse) {
                    var newComponent = objServerResponse.responseText.trim();
                    if (newComponent.indexOf('-') != -1) {
                        exem.showErrorMessage(newComponent);
                        userEditWindow.close();
                    } else {
                        loadLoginInfo();
                        userEditWindow.close();
                    }
                }
            });
        } catch (e) {
            errorMessage('Restore Fail : ' + e.message);
        }
    }

    var getCheckText = function (row) {
        var arr = [].concat(row.phone.split('-')).concat(row.hp.split('-')).concat(row.userid);
        Ext.Array.remove(arr, '02');
        Ext.Array.remove(arr, '010');
        return arr;
    }

    var userEditWindow;
    var openUserEditWindow = function () {
        if (!userEditWindow) {
            userEditWindow = Ext.widget('window', {
                title: LANG.user_edit,
                closeAction: 'hide',
                width: 400,
                height: 325,
                constrain: true,
                maximizable: false,
                closable: false,
                resizable: false,
                modal: true,
                items: [userForm],
                buttons: [{
                    text: LANG.save,
                    handler: function () {
                        var formObj = userForm.getForm();
                        var afterPasswd = formObj.findField('passwd').getValue();

                        var passwordValidate = function () {
                            var isSave = true;
                            if (isCheckPasswd === true && (beforePasswd !== afterPasswd)) {
                                if (!exem.validatePasswd(getCheckText(formObj.getValues()), afterPasswd)) {
                                    exem.showWarningMessage('${msg_passwdinhintcheck}');
                                    isSave = false;
                                    return false;
                                } else if (!exem.doStrengthCheck(afterPasswd)) {
                                    var questMessage = '${msg_passwdcheck}<br>(${msg_repeatchar})</br>';
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
                                        if (beforePasswd === afterPasswd) {
                                            formObj.findField('passwd').setValue('');
                                        }
                                        doSaveUserInfo();
                                    }
                                }
                            );
                        }
                        isRunValidation(function (val) {
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
                        userEditWindow.close();
                    }
                }]
            });
        }
        // userForm.getForm().reset();
        userForm.getForm().setValues(userData);
        userEditWindow.show();
    }

    loadLoginInfo();

    return panel;

})(window.common);
