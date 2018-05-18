/**
 * @class Ext.ux.grid.HeaderToolTip
 * @namespace ux.grid
 *
 *  Text tooltips should be stored in the grid column definition
 *
 *  Sencha forum url:
 *  http://www.sencha.com/forum/showthread.php?132637-Ext.ux.grid.HeaderToolTip
 *  cell 툴팁으로 확장함 - 김의주
 */
Ext.define('Ext.ux.grid.HeaderToolTip', {
    alias: 'plugin.headertooltip',
    init : function(grid){
        if( grid.headerCt ) {
            this.initColumnHeaders( grid.headerCt, grid );
        } else if( grid.lockable ){
            this.initColumnHeaders( grid.lockedGrid.headerCt, grid );
            this.initColumnHeaders( grid.normalGrid.headerCt, grid );
        }
    },
    initColumnHeaders: function( headerCt, grid ) {
        grid.on("viewready", function(g) {
        	// 지나간 셀 저장해두기
        	var view = g.view;
        	g.mon(view, {
                uievent: function (type, view, cell, recordIndex, cellIndex, e) {
                	
                    g.cellIndex = cellIndex;
                    g.recordIndex = recordIndex;
                    //console.log(g)
                }
            });
        
        	var view = g.getView();
        	//console.log('afterrender 툴팁 Create', g, view.el)
    		// 툴팁 Create
        	
        	g.tip = Ext.create('Ext.tip.ToolTip', {
                // The overall target element.
                target: view.el, // grid
                // Each grid row causes its own separate show and hide.
                delegate: ".x-grid-cell",//view.itemSelector,
                // Moving within the row should not hide the tip.
                trackMouse: true,
                // Render immediately so that tip.body can be referenced prior to the first show.
                renderTo: Ext.getBody(),
                listeners: {
                    // Change content dynamically depending on which element triggered the show.
                    beforeshow: function updateTipBody(tip) {
                    	//console.log('beforeshow')
                    	if (!Ext.isEmpty(g.cellIndex) && g.cellIndex !== -1) 
                    	{
                    		// 출력할 str 추출
                            var header = g.headerCt.getGridColumns()[g.cellIndex];
                            var s = g.getStore().getAt(g.recordIndex).get(header.dataIndex);
                            
                            // 없으면 나감.
                            if(  s == "" )
                            {
                            	//console.log('나감1')
                            	tip.clearTimers();
                                return false;
                            }else{
                            	
                            	try
                            	{
                            		if(header.renderer)
                            			s = header.renderer( s ).toString();
                            	}catch(e)
                            	{
                            		
                            	}
                        		
                            	// 있으면 보여줌
                        		if(tip)
                        			tip.update( s );
                            }
                        }else
                        {
                        	//console.log('나감2')
                        	tip.clearTimers();
                            return false;
                        }
                    }
                }
            });
        	//console.log( "만듬",g.tip );
    		
        });
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
	
	_tmpPlugins.push('headertooltip')
	 
	Ext.override(Ext.grid.Panel,{
		plugins: _tmpPlugins,
	});
}finally
{
	_tmpPlugins = null;
}
