Ext.require([
    'Ext.tree.*',
    'Ext.data.*'
]);
Ext.QuickTips.init();
Ext.onReady(function() {

	var so = exem.so();
	if (Ext.isEmpty(so) || Ext.isEmpty(so.userid)) {
		return false;
	}

	var TreeExtStore = Ext.create('Ext.data.TreeStore', {
		proxy: {
			type: 'ajax',
			url: '/CoreExtensionGuiAdminTree',
			extraParams: {
				isXml: true,
				userid : so.userid
			},
			reader: {
				type: 'xml',
				root: 'nodes',
				record: '>node',
				propertyId: 'text'
			}
		},
		root: {
			id: 'text',	expanded: true
		},
		fields: [
		  {name: 'id',		type: 'string'},
		  {name: 'text',	type: 'string'},
		  {name: 'cls',		type: 'string'},
		  {name: 'url',		type: 'string'}
		]
	});

	// create the Tree
	Ext.TreeExt = Ext.create('Ext.tree.Panel', {
		store: TreeExtStore,
		hideHeaders: true,
		rootVisible: false,
		singleExpand: false,
		title: '${label_extension}',
		iconCls: 'label-display16',
		collapsible: true,
		listeners:{
			itemclick: function(view, record, item, index ,eventObj) {
				if(record.get('leaf')){
					var id		= record.get("id");
					var url			= record.get("url");
					var tabPanel	= Ext.getCmp('tabPanel');
					var isTab = tabPanel.items.find(function(i){
						return i.id === id;
					});
					if(!isTab) {
						Ext.Ajax.request({
							url: url,
							method: 'POST',
							success: function(xhr) {
								var newComponent = eval(xhr.responseText);
								tabPanel.add(newComponent);
								tabPanel.doLayout();
								tabPanel.setActiveTab(newComponent);
								tabPanel.destroy;
							},
							failure: function(xhr) {
								Ext.Msg.alert("Grid create failed", "Server communication failure");
							}
						});
					}
					tabPanel.setActiveTab(isTab);
				}
			}
		}
	});
});
