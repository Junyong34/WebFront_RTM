/******************
 * 2014-09-16 kim ui zu
 * import /libs/pako-master/dist/pako.js
 * auto unzip     
 */
Ext.override(Ext.data.proxy.Ajax, {
	binary: true,	       
	buildUrl: function(request) {
		var url = this.callParent([request]);
		//return url;
	
		request.url = url.replace('/ResponseJS?', '/ResponseJSCompress?')		
		return request.url;

	},

    processResponse: function(success, operation, request, response, callback, scope)
    {

    	var encode_utf8 = function (s) {
    	  return unescape(encodeURIComponent(s));
    	}

    	var decode_utf8 = function (s) {
    	  return decodeURIComponent(escape(s));
    	}

    	var ab2str = function (ABuffer) {
    		try
    		{
        		var pData = new Uint8Array(ABuffer,0,ABuffer.byteLength-1); 
        		var i = 0;
                var pCopyStr = "";
                var pDataLength =  pData.length;
                
        		if( pDataLength > 0 )
                {
                   while (  i < pDataLength )
                   {
                         var pCopy  = [];
                         for ( var x = 0;  x < Math.min(pDataLength-i, 10 )  ; x ++  )
                         {

                              pCopy.push( pData[ i ] );
                              i ++;
                         }
                        if( pCopy.length == 0 ) break;
                        pCopyStr += String.fromCharCode.apply(null, new Uint16Array(pCopy) )
                   }
                }  
               pCopyStr = decode_utf8( pCopyStr );     
               
        	   return pCopyStr;
    		} finally
    		{
    			pCopyStr ='';
                delete pCopyStr;
                
                delete pData;
    		}   
    	}

    	var unzip = function( ABuffer )
    	{
    		if(!pako) return;
    	
    		try
    		{
        		var data = new Uint8Array(ABuffer,0,ABuffer.byteLength-1); 
        		var pData = pako.inflate( pako.inflate( data ) );	            		
        		
        		var i = 0;
                var pCopyStr = "";
                var pDataLength =  pData.length;
                
        		if( pDataLength > 0 )
                {
                   while (  i < pDataLength )
                   {
                         var pCopy  = [];
                         for ( var x = 0;  x < Math.min(pDataLength-i, 10 )  ; x ++  )
                         {

                              pCopy.push( pData[ i ] );
                              i ++;
                         }
                        if( pCopy.length == 0 ) break;
                        pCopyStr += String.fromCharCode.apply(null, new Uint16Array(pCopy) )
                   }
                }  
               pCopyStr = decode_utf8( pCopyStr );     
               
        	   return pCopyStr;
    		} finally
    		{
    			pCopyStr ='';
                delete pCopyStr;
                
                delete pData;
                delete data;
    		}
    		
    	};
    	
        var me = this,
            reader,
            result,
            records,
            length,
            mc,
            record,
            i;
            
        
        if (success === true) {
          try
          {
        		            	
        	if( response.getResponseHeader('X-Compress') == "true" )
        	{
        		// zip
        		var sResponseText = unzip( response.responseBytes.buffer );    
        	}else
        	{
        		
        		// string        		
        		var sResponseText = ab2str( response.responseBytes.buffer );        		
        	}
        	
    		response.responseText = sResponseText;        		

    		// isXML ?
    		if( sResponseText.indexOf('{') < sResponseText.indexOf('<') )
    		{
    			var parser = new DOMParser();     
    			
    			response.responseXML  = parser.parseFromString(sResponseText, "application/xml");
    			delete parser;
    		}        	
        	
    		
        	return this.callParent( arguments );
            
          }
          catch(ex)        
          {
            operation.setException(ex);
            me.fireEvent('exception', this, response, operation);              
          }
        } else {
            me.setException(operation, response);
            me.fireEvent('exception', this, response, operation);              
        }
            
        //this callback is the one that was passed to the 'read' or 'write' function above
        if (typeof callback == 'function') {
            callback.call(scope || me, operation);
        }
            
        me.afterRequest(request, success);
    },
}); // Ext.data.proxy.Ajax