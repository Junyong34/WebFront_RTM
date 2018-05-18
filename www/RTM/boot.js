
/**********************************************************/
/**              Global Area                              */
/**********************************************************/
var mainApp;


/**********************************************************/
/**              util                                     */
/**********************************************************/
var Utils = {};
var Comm = {
    loginType : EED.RTM
};
Comm.config = {};
var cfg = Comm.config;

Comm.config.login = {
    user_id     : '',
    login_id    : '',
    password    : '',
    user_name   : '',
    admin_check : '',
    permission: {
        kill_thread    : -1,
        system_dump    : -1,
        memory_leak    : -1,
        property_load  : -1,
        bind           : -1
    } ,
    wasInfoObj : {}
};


/**
 * string -> hex
 * @param tmp
 * @returns {string}
 */
Utils.stringToHex = function(tmp) {
    var str = '';
    var i;
    var c;
    var tmp_len = tmp.length;

    for (i = 0; i < tmp_len; i++) {
        c = tmp.charCodeAt(i);
        str += c.toString(16);
    }
    return str;
};

Ext.Loader.setConfig({ enabled: true, disableCaching: true });
Ext.Ajax.disableCaching = false;

Ext.define('Exem.Store', {
    extend : 'Ext.data.ArrayStore',
    proxy  :  {
        type     : 'memory',
        reader   : {
            type : 'json'
        }
    },
    fields : [
        {name : '1'}, {name : '2'}, {name : '3'}, {name : '4'}, {name : '5'},
        {name : '6'}, {name : '7'}, {name : '8'}, {name : '9'}, {name : '10'},
        {name : '11'},{name : '12'},{name : '13'},{name : '14'},{name : '15'},
        {name : '16'},{name : '17'},{name : '18'},{name : '19'},{name : '20'},
        {name : '21'},{name : '22'},{name : '23'},{name : '24'},{name : '25'},
        {name : '26'},{name : '27'},{name : '28'},{name : '29'},{name : '30'},
        {name : '31'},{name : '32'},{name : '33'},{name : '34'},{name : '35'},
        {name : '36'},{name : '37'},{name : '38'},{name : '39'},{name : '40'},
        {name : '41'},{name : '42'},{name : '43'},{name : '44'},{name : '45'},
        {name : '46'},{name : '47'},{name : '48'},{name : '49'},{name : '50'},
        {name : '51'},{name : '52'},{name : '53'},{name : '54'},{name : '55'},
        {name : '56'},{name : '57'},{name : '58'},{name : '59'},{name : '60'},
        {name : '61'},{name : '62'},{name : '63'},{name : '64'},{name : '65'}
    ]
});


// /**********************************************************/
// /**               Class Area                              */
// /**********************************************************/
//
// /************************* Loading Mask *************************************/
// var MainLaoaingMask = function(arg) {
//     this.initProperty(arg);
//     this.createLayer();
// };
//
// MainLaoaingMask.prototype = {
//
//     initProperty : function(arg) {
//         this.textColor = '#747474';
//
//         for (var argmuent in arg) {
//             this[argmuent] = arg[argmuent];
//         }
//
//     },
//
//     createLayer : function() {
//         this.layer = $('<div style="position:absolute;width:100%;height:40px;"></div>');
//         if (this.showProcessBar) {
//             this.processBar = $('<div style="width:100%;height:20px;padding:4px;"><span style="display:block;width:0%;height:100%;transition: all 0.5s;border-radius: 6px;background: linear-gradient(to bottom, #00B4E5 0%, #29C2BF 100%);"></span></div>');
//             this.layer.append(this.processBar);
//         }
//
//         this.processText = $('<div style="float:left;font-size: 17px;color:'+ this.textColor+ ';line-height: 40px;margin-right: 15px;"></div>');
//         this.loadingMask = $('<div class="loading-container"><div class="loading"></div></div>');
//
//         this.layer.append(this.processText);
//         this.layer.append(this.loadingMask);
//
//         $(this.target).append(this.layer);
//     },
//
// };

