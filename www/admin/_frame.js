var cp = new Ext.state.CookieProvider({
	path: "/exem-cookie/",
	expires: new Date(new Date().getTime()+(1000*60*60*24*30)) //30 days
});
Ext.state.Manager.setProvider(cp);

Ext.Loader.setConfig({enabled: true});
Ext.Loader.setPath('Ext.ux', '/js/extjs/ux');
Ext.require([
	'Ext.grid.*',
	'Ext.data.*',
	'Ext.ux.grid.FiltersFeature',
	'Ext.toolbar.Paging',
	'Ext.ux.CheckColumn',
	'Ext.ux.WebSocket'
]);

// ExtJS Language Setting
Ext.Loader.loadScript('/js/language.js');

Ext.onReady(function() {
	var currentItem;
	Ext.QuickTips.init();

	Ext.state.Manager.setProvider(Ext.create('Ext.state.CookieProvider'));

	var viewport = Ext.create('Ext.Viewport', {
		id: 'border-example',
		layout: 'border',
		items: [
		// create instance immediately
		Ext.create('Ext.Component', {
			region: 'north',
			height: 48, // give north and south regions a height
			autoEl: {
				tag: 'div',
				cls: 'topbar',
				html: '<div id="header" class="common_header classic_black">' +
					'<div class="common_header_sub">' +
						'<ul>' +
						'<li class="common_menu dashboard"><a href="#">Dashboard</a></li>' +
						'</ul>' +
					'</div>' +
				'</div>'+
				//'<a href="/realtime/globe/#custom" class="custom_link">Custom</a>'+
				//'<a href="/realtime/cinema/#DEFAULT" class="cinema_link">Cinema</a>'+
				'<a href="/Login" class="logout" ></a>'
			}
		}), Ext.create('Ext.Component', {
			region: 'north',
			height: 10 // give north and south regions a height
		}),
		{
			region: 'west',
			stateId: 'navigation-panel',
			id: 'west-panel', // see Ext.getCmp() below
			title: '${label_managementmenu}',
			split: true,
			width: 200,
			minWidth: 175,
			maxWidth: 400,
			collapsible: true,
			animCollapse: true,
			margins: '0 0 0 5',
			layout: 'accordion'
//			items: [Ext.Tree,Ext.Tree3,Ext.Tree2]
		},
		Ext.create('Ext.tab.Panel', {
			id: 'tabPanel',
			region: 'center', // a center region is ALWAYS required for border layout
			deferredRender: false,
			plain: true,
			activeTab: 0,
			plugins: [
				Ext.create('Ext.ux.TabCloseMenu')
			]
		})]
	});//end viewport

	/////////////////////////////////////////////////////////////////
	// Extension Menu NullPark 2016.01.11
	/////////////////////////////////////////////////////////////////
	var isExtension = false;
	Ext.Ajax.request({
		url: '../Response?node=extension&p='+so.userid,
		method: 'POST',
		async: false,
		success: function(xhr) {
			var newComponent = xhr.responseText;
			var nodeLength = $(newComponent).find("node").length;
			if(nodeLength > 0){
				isExtension= true;
				console.log('[INFO] Frame.js : isExtension possible ?  '+isExtension);
			}
		},
		failure: function(xhr) {
			isExtension= false;
			console.log('[ERROR] Frame.js : isExtension check error');
		}
	});
// EAST side view ==> viewport.getComponent(4);
	var RegionWest = viewport.getComponent(2);
	RegionWest.add(Ext.Tree);

	Ext.Ajax.request({
		url: '/CoreExtensionGuiAdminTree',
		method: 'POST',
		async: false,
		params: {
			PgmID: 'ddd'
		},
		success: function(xhr) {
			var newComponent = xhr.responseText;
			var nodeLength = $(newComponent).find("node").length;
			if(nodeLength > 0){
				if(isExtension){
					var isObject = (typeof Ext.TreeExt != 'undefined');
					console.log('[INFO] Frame.js : add Extension object ? '+ isObject);
					RegionWest.add(Ext.TreeExt);
				}
			}
		},
		failure: function(xhr) {
//			exem.showErrorMessage('View create failed. Server communication failure');
			console.log('[ERROR] Frame.js : failure add extension');
		}
	});
	RegionWest.doLayout();

	// main center
	var tabPanel = Ext.getCmp('tabPanel');
	Ext.Ajax.request({
		url: 'list/LoginInfo.js',
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
			window.common_header(exem.so());
		},
		failure: function(xhr) {
			Ext.Msg.alert("Grid create failed", "Server communication failure");
		}
	});
});
