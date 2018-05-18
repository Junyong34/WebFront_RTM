(function () {
    Ext.QuickTips.init();

    if (window.location.href.indexOf('debug') !== -1) {
        Ext.getBody().addCls('x-debug');
    }

    var msg = function (title, msg) {
        Ext.Msg.show({
            title: title,
            msg: msg,
            minWidth: 200,
            modal: true,
            icon: Ext.Msg.INFO,
            buttons: Ext.Msg.OK
        });
    };

    var soundAddon = '<audio id="soundCritical" loop="loop">'
        + '<source src="/assets/sound/critical.mp3" type="audio/mpeg">'
        + '</audio><audio id="soundWarning" loop="loop">'
        + '<source src="/assets/sound/warning.mp3" type="audio/mpeg">'
        + '</audio>';

    var formPanel = Ext.create('Ext.form.Panel', {
        width: 500,
        id: 'EventSound',
        frame: false,
        closable: true,
        title: LANG.eventsound,
        bodyPadding: '10 10 0',
        defaults: {
            //			anchor: '70%',
            allowBlank: false,
            msgTarget: 'side',
            labelWidth: 120
        },

        items: [{
            xtype: 'fieldcontainer',
            itemId: 'c',
            fieldLabel: LANG.critical_sound,
            style: 'font: bold 13px Arial',
            layout: {
                type: 'hbox',
                defaultMargins: { top: 0, right: 5, bottom: 0, left: 0 }
            },
            items: [{
                xtype: 'button',
                text: LANG.play,
                iconCls: 'play',
                itemId: 'cPlay_Button',
                width: 65,
                handler: function () {
                    var elDom = Ext.getDom('soundCritical');
                    elDom.currentTime = -1;
                    elDom.play();
                    formPanel.down('#cPlay_Button').setDisabled(true); //Ext.getCmp('cPlay_Button').setDisabled(true);
                    formPanel.down('#wPlay_Button').setDisabled(true); //Ext.getCmp('wPlay_Button').setDisabled(true);
                    formPanel.down('#cStop_Button').setDisabled(false); //Ext.getCmp('cStop_Button').setDisabled(false);
                }
            }, {
                xtype: 'button',
                text: LANG.pause,
                iconCls: 'pause',
                itemId: 'cStop_Button',
                width: 65,
                handler: function () {
                    var elDom = Ext.getDom('soundCritical');
                    elDom.pause();
                    formPanel.down('#cPlay_Button').setDisabled(false); //Ext.getCmp('cPlay_Button').setDisabled(false);
                    formPanel.down('#wPlay_Button').setDisabled(false); //Ext.getCmp('wPlay_Button').setDisabled(false);
                    formPanel.down('#cStop_Button').setDisabled(true); //Ext.getCmp('cStop_Button').setDisabled(true);
                }
            }, {
                xtype: 'filefield',
                id: 'cFile',
                width: 300,
                emptyText: 'Select a File to Upload',
                name: 'critical',
                buttonOnly: true,
                buttonText: LANG.file_select,
                listeners: {
                    change: function (th, val) {
                        formPanel.down('#Upload_Button').setDisabled(false); //Ext.getCmp('Upload_Button').setDisabled(false);
                        formPanel.down('#Reset_Button').setDisabled(false); //Ext.getCmp('Reset_Button').setDisabled(false);
                        formPanel.down('#cPlay_Button').setDisabled(true); //Ext.getCmp('cPlay_Button').setDisabled(true);
                        formPanel.down('#cStop_Button').setDisabled(true); //Ext.getCmp('cStop_Button').setDisabled(true);
                    }
                }
            }]
        }, {
            xtype: 'fieldcontainer',
            itemId: 'w',
            fieldLabel: LANG.warning_sound,
            style: 'font: bold 13px Arial',
            layout: {
                type: 'hbox',
                defaultMargins: { top: 0, right: 5, bottom: 0, left: 0 }
            },
            items: [{
                xtype: 'button',
                text: LANG.play,
                iconCls: 'play',
                itemId: 'wPlay_Button',
                width: 65,
                handler: function () {
                    var elDom = Ext.getDom('soundWarning');
                    elDom.currentTime = -1;
                    elDom.play();
                    formPanel.down('#wPlay_Button').setDisabled(true); //Ext.getCmp('wPlay_Button').setDisabled(true);
                    formPanel.down('#cPlay_Button').setDisabled(true); //Ext.getCmp('cPlay_Button').setDisabled(true);
                    formPanel.down('#wStop_Button').setDisabled(false); //Ext.getCmp('wStop_Button').setDisabled(false);
                }
            }, {
                xtype: 'button',
                text: LANG.pause,
                iconCls: 'pause',
                itemId: 'wStop_Button',
                width: 65,
                handler: function () {
                    var elDom = Ext.getDom('soundWarning');
                    elDom.pause();
                    formPanel.down('#wPlay_Button').setDisabled(false); //Ext.getCmp('wPlay_Button').setDisabled(false);
                    formPanel.down('#cPlay_Button').setDisabled(false); //Ext.getCmp('cPlay_Button').setDisabled(false);
                    formPanel.down('#wStop_Button').setDisabled(true); //Ext.getCmp('wStop_Button').setDisabled(true);
                }
            }, {
                xtype: 'filefield',
                id: 'wFile',
                width: 300,
                emptyText: 'Select a File to Upload',
                name: 'warning',
                buttonOnly: true,
                buttonText: LANG.file_select,
                listeners: {
                    change: function (th, val) {
                        formPanel.down('#Upload_Button').setDisabled(false); //Ext.getCmp('Upload_Button').setDisabled(false);
                        formPanel.down('#Reset_Button').setDisabled(false); //Ext.getCmp('Reset_Button').setDisabled(false);
                        formPanel.down('#wPlay_Button').setDisabled(true); //Ext.getCmp('wPlay_Button').setDisabled(true);
                        formPanel.down('#wStop_Button').setDisabled(true); //Ext.getCmp('wStop_Button').setDisabled(true);
                    }
                }
            }]
        }, {
            id: 'eSoundId',
            xtype: 'box',
            autoEl: {
                html: soundAddon,
                width: 90
            }
        }],
        tbar: [{
            itemId: 'Upload_Button',
            text: LANG.save,
            iconCls: 'modify',
            handler: function () {
                // just a console log to show when the file Upload starts

                var form = this.up('form').getForm();
                //if(form.isValid()){
                form.submit({
                    url: '/Upload',
                    waitMsg: 'Uploading your file...',
                    scope: this,
                    success: function (form, action) {
                        // server responded with success = true
                        response = Ext.decode(action.response.responseText);

                        if (response.success) {
                            formPanel.down('#cPlay_Button').setDisabled(false); //Ext.getCmp('cPlay_Button').setDisabled(false);
                            formPanel.down('#wPlay_Button').setDisabled(false); //Ext.getCmp('wPlay_Button').setDisabled(false);
                            formPanel.down('#Upload_Button').setDisabled(true); //Ext.getCmp('Upload_Button').setDisabled(true);
                            formPanel.down('#Reset_Button').setDisabled(true); //Ext.getCmp('Reset_Button').setDisabled(true);
                            responseMessage = response.message;

                            formPanel.getForm().reset(); //Ext.getCmp('EventSound').getForm().reset();

                            Ext.MessageBox.show({
                                closable: false,
                                width: 350,
                                title: '<b>File Upload Successful!</b>',
                                msg: responseMessage,
                                buttons: Ext.MessageBox.OK,
                                fn: function (btn) {
                                    //console.log('You clicked the ' + btn + ' button');
                                },
                                icon: Ext.MessageBox.INFO
                            });
                            Ext.get('eSoundId').update(soundAddon);
                            form.reset();
                        }
                    },
                    failure: function (form, action) {
                        formPanel.down('#cPlay_Button').setDisabled(false); //Ext.getCmp('cPlay_Button').setDisabled(false);
                        formPanel.down('#wPlay_Button').setDisabled(false); //Ext.getCmp('wPlay_Button').setDisabled(false);
                        formPanel.down('#Upload_Button').setDisabled(true); //Ext.getCmp('Upload_Button').setDisabled(true);
                        formPanel.down('#Reset_Button').setDisabled(true); //Ext.getCmp('Reset_Button').setDisabled(true);

                        if (action.failureType === Ext.form.Action.CONNECT_FAILURE) {
                            Ext.Msg.alert('Fail', 'Status:' + action.response.status + ': ' + action.response.statusText);
                        }
                        if (action.failureType === Ext.form.Action.SERVER_INVALID) {
                            // server responded with success = false
                            Ext.Msg.alert('Invalid', action.result.message);
                        }
                        if (action.failureType === Ext.form.Action.CLIENT_INVALID) {
                            Ext.Msg.alert('Error', "Is an invalid file.");
                        }
                    }
                });
                //}
            }
        }, '-', {
            itemId: 'Reset_Button',
            text: LANG.reset,
            handler: function () {
                this.up('form').getForm().reset();
                formPanel.down('#Upload_Button').setDisabled(true); //Ext.getCmp('Upload_Button').setDisabled(true);
                formPanel.down('#Reset_Button').setDisabled(true); //Ext.getCmp('Reset_Button').setDisabled(true);
                formPanel.down('#cPlay_Button').setDisabled(false); //Ext.getCmp('cPlay_Button').setDisabled(false);
                formPanel.down('#wPlay_Button').setDisabled(false); //Ext.getCmp('wPlay_Button').setDisabled(false);
                formPanel.down('#cStop_Button').setDisabled(true); //Ext.getCmp('cStop_Button').setDisabled(true);
                formPanel.down('#wStop_Button').setDisabled(true); //Ext.getCmp('wStop_Button').setDisabled(true);
            }
        }]
    });

    formPanel.down('#Upload_Button').setDisabled(true); //Ext.getCmp('Upload_Button').setDisabled(true);
    formPanel.down('#cStop_Button').setDisabled(true); //Ext.getCmp('cStop_Button').setDisabled(true);
    formPanel.down('#wStop_Button').setDisabled(true); //Ext.getCmp('wStop_Button').setDisabled(true);
    formPanel.down('#Reset_Button').setDisabled(true); //Ext.getCmp('Reset_Button').setDisabled(true);

    return formPanel;
})();
