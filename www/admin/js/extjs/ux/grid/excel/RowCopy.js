/**
 * http://developerextensions.com/components/com_extensiondemo/views/extensiondemo/tmpl/ext3/ux/excel-grid/EditorPasteCopyGrid.js
 * 
 * @class Ext.grid.EditorPasteCopyGridPanel
 * Version: 1.4
 * Author: Surinder singh http://www.sencha.com/forum/member.php?75710-Surinder-singh, surinder83singh@gmail.com
 * changes: 1) added the block fill feature.
 			2) support for auto editing on any non-navigation key press (feature demanded by jackpan http://www.sencha.com/forum/member.php?181839-jackpan). 
 *
 * 2013-12-19 Ext 4 버젼에서 돌수 있게 컨버팅함 - 김의주.. 결국 대부분 만들었네.. 쩝..
 */

Ext.define('Ext.ux.grid.RowCopy.contextmenu', 
{
	extend: 'Ext.menu.Menu',	
	hidden: true,
	hideMode: 'display',
	width: 138,
	frameHeader: false,
	
	initComponent: function() {
	    var me = this;
	    
	    Ext.applyIf(me, {
	        items: 
	        [
	              
	            {
	                xtype: 'menuitem',
	                //id: '',
	                //icon: '',
	                text: 'Copy to Clipboard',
	                tooltip: 'Copy to Clipboard',
	                
	                listeners :
	                {
	                	click: function( button, e, eOpts  )
	                	{
	                	},
	                	
	                	
	                }
	            },
	            
	            {
	                xtype: 'menuitem',
	                icon: '',
	                text: 'Save All',
	                tooltip: 'Save All',
	                hidden: (this.store == null),
                	handler : function()
                	{
                		var sss = (this.parentMenu.owner.getStore().proxy.url).split("?");
                		if( sss.length > 1 )
                			var sUrl = sss[1];
                		else
                			var sUrl = sss[0];
                			
                		//console.log(sUrl)
                	    location.href = "/Excel?"+sUrl+"&totalresults=false";
                	}
        		},
        		
	            
	          
	            /*{
	                xtype: 'menuitem',
	                icon: '',
	                text: 'DebugHeader',
	                tooltip: 'DebugHeader',
                	handler : function(){
                		
                		var AGrid = this.ownerCt.owner; 
                		var ss = '';
                		var sStr = "";

                		

                        for( var i = 0 ; i < AGrid.headerCt.items.items.length ; i ++ )
                        {	        	
                        	if( !AGrid.headerCt.items.items[ i ].dataIndex)
                        		continue;
                        	
                        	
                        	sStr = AGrid.headerCt.items.items[ i ].dataIndex.toString();
                        	ss += '<location id="'+ sStr +'">\r\n' ;
                        	
                        	sStr = AGrid.headerCt.items.items[ i ].text.toString();
                        	ss += '\t<en>'+ sStr +'</en>\r\n' ;
                        	ss += '\t<ko>'+ sStr +'</ko>\r\n' ;
                        	ss +=  "</location>\r\n";
                        }
                        ss += "\r\n";
//                        console.log( ss )
                		
                		
                	}
	            }*/
	            
	        ],
	        
	        listeners:
	        {
	        	show:function()
            	{
	        		// 팝업 될때마다 클립보드 카피 swf 를 다시 만든다.
	        		// hide() 될때마다 관계 깨져서 재사용 안됨. 
	        		
            		//console.log('aaaaaaaaaa1', this.items.items[0].getId());
            		this.owner.copyToClipBoard();
            		var sId =  this.items.items[0].getId();
            		this._ZeroClipboard = new ZeroClipboard.Client();
            		this._ZeroClipboard.owner = this;
            		this._ZeroClipboard.setHandCursor( true );
            		this._ZeroClipboard.glue( sId,sId );
            		console.log('_ZeroClipboard.glue',sId,sId)
            		this._ZeroClipboard.setText( this.owner.tsvData );
            		top.Last_ZeroClipboard = this._ZeroClipboard;
            		this._ZeroClipboard.addEventListener('complete', function( client, text){
            			
            			// this 도 안넘어가네..
            			if( top.Last_ZeroClipboard && top.Last_ZeroClipboard.owner )
            			{
            				setTimeout( function(){ 
            					top.Last_ZeroClipboard.owner.hide(); 
            					top.Last_ZeroClipboard = null;
            					
        					Ext.MessageBox.show({
								title: 'Success',
								msg: 'Copy success.',
								buttons: Ext.MessageBox.OK,
								icon:'search'
							});
        					
            				},100 );
            			}
            		});
            		
            		
            		// 지정된 캔버스 없으면 하나 만듬, TextWidth 용
            		if( !top.tmpcanvas )
            		{
            			top.tmpcanvas = document.createElement("canvas").getContext("2d");
            			top.tmpcanvas.font = "12pt Arial";
            		}
            		  // This can be set programmaticly from the element's font-style if desired
            		

            		
            		var nMax = 100 ;
            		var textWidth  = 0;
            		for(var i=0; i < this.items.items.length; i ++ )
            		{
            			//console.log( this.items.items[i] )
            			
            			// 계산된  width 가 없거나,  과거 Text랑 현재 Text랑 다르면 다시 계산한다.
            			if(!this.items.items[i].fixedWidth || this.items.items[i].oldText != this.items.items[i].Text )
            			{
            				textWidth = top.tmpcanvas.measureText( this.items.items[i].text ).width;
            				this.items.items[i].fixedWidth = textWidth;
            				this.items.items[i].oldText    = this.items.items[i].Text;
            			}else
            			{
            				textWidth = this.items.items[i].fixedWidth;
            			}
            			
            			nMax = Math.max( nMax , textWidth );
            			if( typeof(this.items.items[i].events.show) == "object" )
            			{
            				this.items.items[i].events.show.fire();
            			}
            			
            		}
            		
            		this.setWidth( nMax );
            		
            	},
            	afterrender: function()
            	{
            		//console.log('aaaaaaaaaa2');
            		
            		
            	},
            	destroy:function()
            	{
            		//console.log('aaaaaaaaaa3');
            	},
            	hide:function()
            	{
            		//console.log('aaaaaaaaaa4');
            		
            		this._ZeroClipboard.destroy();
            		this._ZeroClipboard = null
            	}
            	//_ZeroClipboard
	        }
	    });
	    me.callParent(arguments);
	}
});


Ext.define('Ext.ux.grid.RowCopy', {
	alias: 'plugin.rowcopy',
	// 초기화 함
	init : function( grid ){
		//console.log('Ext.ux.grid.EditorPasteCopy-initComponent')
		//grid.addClass('EditorPasteCopyGridPanel');
 		/*make sure that selection modal is ExcelCellSelectionModel*/
 		//grid.selModel = new Ext.grid.ExcelCellSelectionModel();
 		grid.addListener('render',this.addKeyMap, grid);	 		
 		grid.addListener('itemcontextmenu',this.contextmenu, grid);
 		
 		grid.copyToClipBoard    = this.copyToClipBoard;
 		grid.collectGridData    = this.collectGridData;
 		grid.pasteFromClipBoard = this.pasteFromClipBoard; // 안씀

 		grid.getHiddenTextArea  = this.getHiddenTextArea;
 		
 		
 		
 		
 		
 		// grid.multiSelect = true; <- 이놈이 외부에서 셋 되어있어야함. 코드로 안되는듯..
	},
	
	contextmenu : function(dataview, record, item, index, e, eOpts)
	{
		//console.log('aaaaaaaaaaaaa');
		
		// 없으면 만든다.
		if(!this.contextmenu_object )
		{
			this.contextmenu_object = new Ext.create('Ext.ux.grid.RowCopy.contextmenu')
			this.contextmenu_object.owner = this;
			if(this.contextmenuItems)
	 		{
	 			for( var i = 0; i < this.contextmenuItems.length; i++  )
	 			{
	 				this.contextmenu_object.add( this.contextmenuItems[i] );
	 			}
	 			
	 		}
			if( this.disableSelection )
			{
				this.contextmenu_object.add( '-' );
				this.contextmenu_object.add( {text:'Grid.disableSelection 옵션을 False 해야함.'} );
				
			}
//			console.log( 'disableSelection',this.disableSelection )
			
			//this.contextmenu_object.setWidth(200);
		}
		
		//this.copyToClipBoard();
		//_ZeroClipboard.setText( this.tsvData )
		
		this.contextmenu_object.showAt(e.getXY());
		e.stopEvent();
	},
	
	addKeyMap:function( grid ){
		//console.log(arguments)
    	 
		grid.body.addListener("mouseover"
				, function(e)
				{
					//console.log(arguments);
					//this.processEvent("mouseover", e);
				}
				, grid );
		grid.body.addListener("mouseup"
				, function(e)
				{
					//console.log(arguments);
					//this.processEvent("mouseup", e);
				}
				, grid );
		
		//aaaa= grid; //Ext.DomQuery.selectNode('div[class*=x-grid3-scroller]', grid.getEl().dom);
		 
    	//Ext.DomQuery.selectNode('div[class*=x-grid3-scroller]', grid.getEl().dom).style.overflowX='hidden';
	 	// map multiple keys to multiple actions by strings and array of codes	 	
	 	new Ext.KeyMap( grid.getEl().dom.id , [{
	        key: "c",
	        ctrl:true,
	        fn: function(){
	        	//console.log('key-c', this.target.dom.id, arguments);
	        	var grid = Ext.getCmp(this.target.dom.id);
	        	//aaaaaaaaaa = grid;
	        	
	        	// 클립보드에 넣기
	        	grid.copyToClipBoard();

			}
	    },{
	    	key: "v",
	        ctrl:true,
	        fn: function(){
	        	//console.log('key-v', arguments);
	        	var grid = Ext.getCmp(this.target.dom.id);
	        	//grid.pasteFromClipBoard();
			}
	    }]);
	},
	 
	copyToClipBoard:function(){
		// 선택된 값이 없으면 나간다.
    	if( 
    		  ! this.getSelectionModel() 
    		  || !this.getSelectionModel().selected
    		  || !this.getSelectionModel().selected.items // Array
    		  || this.getSelectionModel().selected.items.length == 0 // Array
    		) return;
    	this.collectGridData( this.getSelectionModel().selected.items );
    	
    	//console.log( this,'copyToClipBoard',this.tsvData ); 
    	
    	if( window.clipboardData && clipboardData.setData )	{
			clipboardData.setData("text", this.tsvData);
		} else {
			var hiddentextarea = this.getHiddenTextArea();
			hiddentextarea.dom.value = this.tsvData; 
	    	hiddentextarea.focus();
	        hiddentextarea.dom.setSelectionRange(0, hiddentextarea.dom.value.length);			
		}
    },
    collectGridData:function(rows){
        this.tsvData 	="";
        var sColumnName  = "";
        var sStr = "";
        //console.log(rows)
        //
        // 헤더 복사
        
        if( this.headerCt.items.items.length > 0 )
        	var AColumnList = this.headerCt.items.items;
        else
        	var AColumnList = this.columns;
        
        aaa =this;
        //aaa.columns[1].text

        
    	for( var i = 0 ; i < AColumnList.length ; i ++ )
        {	        	
        	if( !AColumnList[ i ].dataIndex || AColumnList[i].hidden )
        		continue;
        	
        	sColumnName = AColumnList[ i ].text;
        	//console.log(sColumnName, rows[r].data[ sColumnName ])
        	sStr = sColumnName.toString();
        	sStr = sStr.split("\t").join(" ")
        	sStr = sStr.split("\n").join(" ")
        	sStr = sStr.split("\r").join(" ")
        	
        	this.tsvData +=  sStr + "\t";
        }	
    	
    	this.tsvData += "\r\n";
        
        // 헤더를 돌면서 보이는 Column 만 복사한다.
        for( var r = 0 ; r < rows.length ; r++ )
        {
        	
	        for( var i = 0 ; i < AColumnList.length ; i ++ )
	        {	        	
	        	if( !AColumnList[ i ].dataIndex || AColumnList[i].hidden )
	        		continue;
	        	
	        	var aaaaaa = AColumnList[ i ];
	        	sColumnName = AColumnList[ i ].dataIndex;
	        	//console.log(sColumnName, rows[r].data[ sColumnName ])

	        	
	        		
	        	if(rows[r].data[ sColumnName ])
	        		sStr = rows[r].data[ sColumnName ].toString();
	        	else
	        		sStr = "";
        	
	        	// 화면에 보여주는 방식 그대로 해준다.
	        	if(AColumnList[ i ].renderer)
	        		sStr = AColumnList[ i ].renderer( sStr ).toString();
	        			
	        	sStr = sStr.split("\t").join(" ")
	        	sStr = sStr.split("\n").join(" ")
	        	sStr = sStr.split("\r").join(" ")
	        	
	        	this.tsvData +=  sStr + "\t";
	        }
	        this.tsvData += "\r\n";
        }
        
    
                
        
    	return this.tsvData;        
	},
		
	pasteFromClipBoard:function(){
		// 안씀
    	var hiddentextarea 			= this.getHiddenTextArea();
		hiddentextarea.dom.value 	= ""; 
    	hiddentextarea.focus();
    },	
   
    getHiddenTextArea:function(){
		if(!this.hiddentextarea){
    		this.hiddentextarea = new Ext.Element(document.createElement('textarea'));    		
    		this.hiddentextarea.setStyle('left','-1000px');
			this.hiddentextarea.setStyle('border','2px solid #ff0000');
			this.hiddentextarea.setStyle('position','absolute');
			this.hiddentextarea.setStyle('top','0px');
			this.hiddentextarea.setStyle('z-index','-1');
			this.hiddentextarea.setStyle('width','100px');
			this.hiddentextarea.setStyle('height','30px');
			
    		//this.hiddentextarea.addListener('keyup', this.updateGridData, this);
			// 이걸 붙여넣기 하면 저게 keyup이 되서 그런가보네..쩝
    		Ext.get(this.getEl().dom.firstChild).appendChild(this.hiddentextarea.dom);
    	}
    	return this.hiddentextarea;
    }
	
	
});


var _tmpPlugins = [];
try
{
	if( Ext.grid.Panel	&& Ext.grid.Panel.prototype )
	{
		if( !Ext.grid.Panel.prototype.plugins )
			Ext.grid.Panel.prototype.plugins = [];
	
		_tmpPlugins = Ext.grid.Panel.prototype.plugins;
	}
	
	_tmpPlugins.push('rowcopy')
	 
	Ext.override(Ext.grid.Panel,{
		plugins: _tmpPlugins,
	});
}finally
{
	_tmpPlugins = null;
}

setTimeout(function(){
	Ext.require([
     		'/extjs.ux.grid.excel.ZeroClipboard'
     ])
},10);