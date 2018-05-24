Ext.define('EXEM.rtmBasicLayout', {
    extend: 'Ext.container.Container',
    padding: 1,
    layout: 'fit',
    width: '100%',
    height: '100%',

    border: true,
    cls: 'rtm-base-panel',
    style: {
        'background': '#393c43',
    },
    constructor: function (config) {
        this.callParent();
        // 옵션값 설정
        var list = Object.keys(config || {});
        for (var ix = 0, ixLen = list.length; ix < ixLen; ix++) {
            this[list[ix]] = config[list[ix]];
        }
        // init 초기셋팅
        this.initLayoutSetting();

    },
    initLayoutSetting: function () {
        // vbox 생성
        this.baseContainer = Ext.create('Ext.container.Container', {
            // cls   : 'frame-OS-Label',
            layout: {type: 'vbox', align: 'middle', pack: 'center'},
            flex: 1,
            // style:{
            // 	'background':'red',
            // }
        });
        // 탑영역  타이틀 , 토글 , 옵션 버튼
        this.baseTopContainer = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            width: '100%',
            height: 30,
            // flex: 1,
            cls: 'xm-container-base',
            style: {
                'background': '#393c43',
            },
        });
        // 타이틀 영역
        this.frameTitle = Ext.create('Ext.form.Label', {
            height: '100%',
            margin: '0 0 0 10',
            cls: 'header-title',
            // text: '제목입니다.'
        });

        this.baseBodyContainer = Ext.create('Ext.container.Container', {
            // cls   : 'frame-OS-Label',
            layout: 'fit',
            width: '100%',
            height: '100%',
            flex: 8,
            // style:{
            // 	'background':'red',
            // }
        });
        this.baseContainer.add([this.baseTopContainer, this.baseBodyContainer]);
        this.add(this.baseContainer);
    },
    // changeGroup : function(pGroupName) {
    //     // pGroupName: 팝업에서 선택했던 값
    //     console.dir(pGroupName);
    // },

});
