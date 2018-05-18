Ext.define('RTM.EED.rtmWorkGroup', {
    extend   : 'Exem.XMWindow',
    title    : common.Util.TR('Service List'),
    layout   : 'fit',
    width    : 350,
    height   : 300,
    minWidth : 300,
    minHeight: 300,
    modal    : true,

    groupName    : '',
    targetGroup  : null,
    useSelect    : true,

    cls      : 'xm-dock-window-base',
    bodyStyle: {
        padding: '10px'
    },

    listeners: {
        show : function() {
            var row = this.grid.getStore().findRecord('Display', this.groupName);
            // var row = this.grid.getStore().getCount();
            if (row) {
                this.grid.getView().focusRow(row) ;
                this.grid.getSelectionModel().select(row);
            }
            this.grid.fireEvent('itemclick', this.grid, this.grid.getSelectionModel().getLastSelected());
        },
        destroy: function() {
            this.selectedRows = [];
        }
    },

    init: function() {
        this.group      = [];

        this.comboData = [];
        this.selectedRows = [];

        this.background = Ext.create('Ext.container.Container', {
            layout : {
                type : 'vbox',
                pack  : 'middle'
            },
            width : '100%',
            flex : 1,
            cls  : 'rtm-groupchange-base'
        });
        this.add( this.background );

        this.top = Ext.create( 'Ext.container.Container', {
            layout : 'fit',
            flex   : 1,
            width  : '100%'
        });

        this.bottom = Ext.create('Ext.container.Container', {
            layout : {
                type  : 'hbox',
                align : 'middle',
                pack  : 'center'
            },
            width  : '100%',
            height : 25,
            margin : '5 0 0 0',
            items  : [{
                xtype : 'button',
                text  : common.Util.TR('OK'),
                cls   : 'rtm-btn',
                width : 55,
                height: 25,
                listeners: {
                    scope: this,
                    click: function() {
                        Ext.getCmp(this.targetGroup.id).changeGroup(this.selectedRows);
                        this.close();
                    }
                }
            },{
                xtype : 'tbspacer',
                width : 5
            },{
                xtype : 'button',
                text  : common.Util.TR('Cancel'),
                cls   : 'rtm-btn',
                height: 25,
                listeners: {
                    scope: this,
                    click: function() {
                        this.selectedRows = [];
                        this.close();
                    }
                }
            }]
        });

        this.background.add( this.top, this.bottom );

        this.groupStore = Ext.create( 'Ext.data.Store', {
            fields  : [
                {name : 'Index',   type : 'int' },
                {name : 'Name',    type : 'string'  },
                {name : 'Display', type : 'string'  }
            ],
            data    : [],
            sorters : [
                { property : 'Display', direction : 'ASC' }
            ]
        });

        this.grid = Ext.create( 'Ext.grid.Panel', {
            width       : '100%',
            flex        : 1,
            hideHeaders : true,
            forceFit    : true,
            autoScroll  : true,
            store       : this.groupStore,
            cls         : 'baseGridRTM',
            bodyStyle   : {'border-bottom-width':'1px'},
            columns     : [
                { text: 'Index',    dataIndex : 'Index',    hidden: true},
                { text: 'Name',     dataIndex : 'Name' ,    hidden: true},
                { text: 'Display',  dataIndex : 'Display',  flex  : 1   }
            ],
            selModel : Ext.create('Ext.selection.CheckboxModel',{
                showHeaderCheckbox: false,
                mode: 'SIMPLE',
                enableKeyNav: false
            }),
            listeners: {
                scope: this,
                itemclick: function (thisGrid, record) {
                    if (!Ext.isEmpty(record)) {
                        this.groupName = record.data.Name;

                        var index = this.selectedRows.indexOf(this.groupName);

                        if (index === -1) {
                            if (this.selectedRows.length < 3) {
                                this.searchGroupCombo.setValue(this.groupName);
                                this.selectedRows.push(this.groupName);
                            } else {
                                Ext.Msg.show({
                                    title  : common.Util.TR('ERROR'),
                                    msg    : common.Util.TR('You can select up to 3 items.'),
                                    buttons: Ext.Msg.OK,
                                    icon   : Ext.MessageBox.WARNING
                                });

                                thisGrid.getSelectionModel().deselect(record);
                                // return false;
                            }
                        } else {
                            this.selectedRows.splice(index, 1);
                        }
                    }
                }
            }
        });

        this.searchGroupCombo = Ext.create('Exem.AjaxComboBox',{
            cls: 'rtm-list-condition',
            width: '100%',
            data : [],
            enableKeyEvents: true,
            listeners: {
                scope: this,
                select: function() {
                    // 선택한 이름으로 찾기
                    this.findGroupValue();
                },
                keydown: function(comboboxThis, e) {
                    // keyCode 은 ENTER , 입력 값이 있는경우에만 find and focus된다.
                    if(e.keyCode === 13 && comboboxThis.getValue()) {
                        this.findGroupValue();
                    }
                }
            }
        });

        this.left = Ext.create( 'Ext.container.Container', {
            layout : 'vbox',
            height : '100%',
            width  : 320
        });

        if (this.useSelect) {
            this.left.add(this.searchGroupCombo, this.grid);
        } else {
            this.left.add(this.grid);
        }

        this.top.add( this.left);

        this.addList();
    },


    addList : function() {
        var store = this.grid.getStore();

        var ix, ixLen;
        var groupName;

        for (ix = 0, ixLen = this.dataRow.length; ix < ixLen ; ix++ ) {
            groupName = this.dataRow[ix];

            this.group.push( { 'Index': ix, 'Name':  groupName, 'Display':  groupName} );

            this.comboData.push ( {name: groupName, value: groupName });
        }

        store.loadData(this.group);

        this.searchGroupCombo.setData(this.comboData);
        this.searchGroupCombo.setSearchField( 'name' );
    },


    findGroupValue: function() {

        var searchString = this.searchGroupCombo.getValue();
        var targetStore  = this.grid.getStore();
        var row          = targetStore.findRecord('Name', searchString );

        this.grid.getView().focusRow(row) ;
        this.grid.getSelectionModel().select(row);
        this.groupName = row.data.Name;

        this.grid.fireEvent('itemclick', this.grid, this.grid.getSelectionModel().getLastSelected());
    }

});

