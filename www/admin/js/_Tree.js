	// create the Tree
	Ext.Tree = Ext.create('Ext.tree.Panel', {
		store: Ext.create('Ext.data.TreeStore', {
			proxy: {
				type: 'ajax',
				url: '../Tree?tab=1',
				extraParams: {
					isXml: true
				},
				reader: {
					type: 'xml',
					root: 'nodes',
					record: 'node'
				}
			},
			sorters: [{
				property: 'leaf',
				direction: 'ASC'
			},{
				property: 'text',
				direction: 'ASC'
			}],
			root: {
				text: 'Momitor',
				id: 'src',
				expanded: true
			}
		}),
		hideHeaders: true,
		rootVisible: false,
		singleExpand: false,
		title: 'Dashboard',
		iconCls: 'info',
		collapsible: true,
		listeners:{
			afterrender: function(comp, item, e) {
				try
				{
					if( comp.getRootNode().childNodes.length == 0 )
					{
						comp.setVisible(false);
					}
				}catch(e)
				{}
			},
			itemclick: function(view, record, item, index ,eventObj) {
				if(record.get('leaf')){
					var id =record.get('id');
					var title = record.get("text");
					var tabPanel = Ext.getCmp('tabPanel');
					if(tabPanel) {
						var checkTab = tabPanel.getComponent(id);
						 if (checkTab) {
							 tabPanel.setActiveTab(checkTab);
						 } else {
							Ext.Ajax.request({
								disableCaching: true,
								url: '../JSModel?openobject='+id+'',
								method: 'POST',
								params: {
									PgmID: 'ddd'
								},
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
					}
					//tabPanel.setActiveTab(isTab);
				}
			}
		}
	});
});
