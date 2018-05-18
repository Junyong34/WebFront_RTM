'use strict';

Ext.Loader.setPath('Exem', '/RTM/EXEM');
Ext.Loader.setPath('RTM.EED', '/RTM/EED');
Ext.Loader.setPath('Ext.ux', '/common/extjs/src/ux');

Ext.application({
    name: 'EED',
    is_init: false,
    appFolder: location.pathname.split('/')[1],

    launch: function () {
        this.is_init = true;
    },
    launch_afterInit: function () {
        var self = this;
        // common.DataModule.init();

        this.viewport = Ext.create('Ext.container.Container', {
            id: 'viewPort',
            layout: {
                type: 'vbox',
            },
            width: '100%',
            height: '100%',
            cls: 'viewport',
            renderTo: Ext.get('homediv')
        });
        // this.viewport.applyStyles({
        //     'background-color': '#212227 !important',
        //     'border-color': '#474a53'
        // });
        window.addEventListener('resize', function () {
            self.viewport.setSize(window.innerWidth, window.innerHeight);
        });

        var self = this;

        // 모니터링 뷰 타입 설정
        // Comm.RTComm.checkMonitorViewType();

        (function () {
            // 화면 상단 기본 레이아웃 구성
            self.createTopBaseLayout();
            // 화면 메인 기본 레이아웃 구성
            self.createMainBaseLayout();
        })();
    },
    rtmViewObject: function () {
        this.trackStackChart = Ext.create("RTM.EED.rtmTrackStack");
        this.trackStackChart.init();

        this.webCpuChart = Ext.create('RTM.EED.rtmCpuMonitor', {
            monitorType: 'web',
        });
        // this.webCpuChart.init();
        this.wasCpuChart = Ext.create('RTM.EED.rtmCpuMonitor', {
            monitorType: 'was',
        });
        // this.wasCpuChart.init();
        this.dbCpuChart = Ext.create('RTM.EED.rtmCpuMonitor', {
            monitorType: 'db',
        });
        this.chiefTaskTopLineChart = Ext.create('RTM.EED.rtmTaskTop');
        this.chiefTaskTopLineChart.init();
        this.domainChart = Ext.create("RTM.EED.rtmDomain");
        this.domainChart.init();
    },
    /**
     * 화면 메인 부분에 보여지는 기본 레이아웃 구성
     */
    createMainBaseLayout: function () {

        // 대쉬보드 화면 호출
        this.rtmViewObject();

        this.mainFrame = Ext.create('Ext.container.Container', {
            width: '100%',
            flex: 1,
            cls: 'edd-container-gray',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            style: {
                'padding': '10px 5px 10px 5px',
            },
            items: [
                {
                    xtype: 'container',
                    flex: 1,
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    cls: 'edd-container-gray',
                    items: [
                        {
                            xtype: 'container',
                            flex: 1,
                            layout: {
                                type: 'vbox',
                                align: 'stretch'
                            },
                            items: [
                                {
                                    xtype: 'panel',
                                    // title:'',
                                    height: 50,
                                    // flex:1,
                                    cls: 'panel_gray',
                                },
                                {
                                    xtype: 'splitter',
                                    height: 5
                                },
                                {
                                    xtype: 'container',
                                    flex: 1,
                                    layout: {
                                        type: 'hbox',
                                        align: 'stretch'
                                    },
                                    items: [
                                        {
                                            xtype: 'panel',
                                            title: '업무별 거래 현황',
                                            flex: 1,
                                            height: 200,
                                            width: '100%',
                                            items: [this.trackStackChart]
                                        },
                                        {
                                            xtype: 'splitter',
                                            height: 5
                                        },
                                        {
                                            xtype: 'panel',
                                            title: '주요 업무별 TPS 현황 (TOP 5)',
                                            flex: 1,
                                            height: 200,
                                            width: '100%',
                                            items: [this.chiefTaskTopLineChart]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            xtype: 'splitter',
                            height: 5
                        },
                        {
                            xtype: 'container',
                            flex: 4,
                            layout: {
                                type: 'hbox',
                                align: 'stretch'
                            },
                            items: [
                                {
                                    xtype: 'container',
                                    flex: 7,
                                    layout: {
                                        type: 'vbox',
                                        align: 'stretch'
                                    },
                                    items: [
                                        {
                                            xtype: 'container',
                                            flex: 3,
                                            layout: {
                                                type: 'hbox',
                                                align: 'stretch'
                                            },
                                            items: [
                                                {
                                                    xtype: 'container',
                                                    flex: 1.5,
                                                    layout: {
                                                        type: 'vbox',
                                                        align: 'stretch'
                                                    },
                                                    items: [
                                                        {
                                                            xtype: 'panel',
                                                            title: 'Web CPU',
                                                            layout: 'fit',
                                                            flex: 1,
                                                            items: [this.webCpuChart],
                                                        }, {
                                                            xtype: 'panel',
                                                            title: 'Was CPU',
                                                            layout: 'fit',
                                                            flex: 1,
                                                            items: [this.wasCpuChart],
                                                        }, {
                                                            xtype: 'panel',
                                                            title: 'DB CPU',
                                                            layout: 'fit',
                                                            flex: 1,
                                                            items: [this.dbCpuChart],
                                                        }
                                                    ]
                                                },
                                                {
                                                    xtype: 'splitter',
                                                    height: 5
                                                }, {
                                                    xtype: 'panel',
                                                    title: '업무/도메인별',
                                                    flex: 6,
                                                    items: [this.domainChart]
                                                }
                                            ]
                                        },
                                        {
                                            xtype: 'splitter',
                                            height: 5
                                        }, {
                                            xtype: 'panel',
                                            title: '실시간 이벤트 알람 목록',
                                            // layout: 'vbox',
                                            flex: 1,
                                        }
                                    ]
                                },
                                {
                                    xtype: 'splitter',
                                    height: 5
                                },
                                {
                                    xtype: 'panel',
                                    title: '인스턴트별 - 업무',
                                    flex: 1.8
                                }
                            ]
                        }
                    ]
                },
            ]
        });
        this.viewport.add(this.mainFrame);
    },
    /**
     * 화면 상단 부분에 보여지는 기본 레이아웃 구성
     */
    createTopBaseLayout: function () {
        this.topFrame = Ext.create('Ext.container.Container', {
            width: '100%',
            height: 50,
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            style: {
                'background': '#393c43'
            },
            items: [
                {
                    xtype: 'panel',
                    height: 50,
                    flex: 1,
                    items: [
                        {
                            xtype: 'label',
                            text: 'EDD DashBoard',
                            flex: 1,
                            cls: 'logo-text'
                        }
                    ]
                },
                {
                    xtype: 'panel',
                    height: 50,
                    flex: 3,

                }, {
                    xtype: 'panel',
                    height: 50,
                    flex: 3
                }
            ]
        });
        this.viewport.add(this.topFrame);


    },


})
;
