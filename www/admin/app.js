'use strict';

Ext.Loader.setConfig({ enabled: true });
Ext.Loader.setPath('Ext.ux', '/admin/js/extjs/ux');

Ext.require([
    'Ext.grid.*',
    'Ext.data.*',
    'Ext.ux.grid.FiltersFeature',
    'Ext.toolbar.Paging',
    'Ext.ux.CheckColumn',
]);

var ADMIN_STORE = {};

Ext.onReady(function () {
    var common = window.common;

    function sessionChecker (session) {
        // session check
        if (Object.keys(session.user).length === 0) {
            Ext.MessageBox.show({
                title: 'Warning',
                closable: false,
                msg: 'session has been terminated. Please sign in again.',
                buttons: Ext.MessageBox.OK,
                icon: Ext.MessageBox.WARNING,
                fn: function () {
                    window.location.href = '/';
                }
            });

            return Promise.reject('session has been terminated. Please sign in again.');
        }

        ADMIN_STORE.session = session;
        return session;
    }

    // 최초 전역 language 로드
    return common.utils.ajax.fetch.session()
        .then(sessionChecker)
        .then(function (session) {
            // 세션 주기적으로 체크
            common.utils.ajax.fetch.session.regularCheck(5000, sessionChecker);

            return common.utils.local.load(session.user.lang, true);
        })
        .then(function (lang) {
            var LANG = common.LANG;

            Ext.create('Ext.container.Viewport', {
                layout: 'border',
                items: [{
                    xtype: 'component',
                    region: 'north',
                    height: 48,
                    autoEl: {
                        tag: 'div',
                        cls: 'topbar',
                        html: '<div id="header" class="common_header classic_black">' +
                            '<div class="common_header_sub">' +
                            '<ul>' +
                            '<li class="common_menu dashboard"><a href="#">Dashboard</a></li>' +
                            '</ul>' +
                            '</div>' +
                            '</div>' +
                            '<a href="#" class="logout" ></a>'
                    },
                    listeners: {
                        afterrender: function (comp) {
                            var logout = comp.el.dom.querySelector('.logout');
                            logout.addEventListener('click', function () {
                                common.utils.ajax.get('/Logout')
                                    .then(function () {
                                        location.href = '/';
                                    });
                            });
                        }
                    }
                }, {
                    region: 'west',
                    stateId: 'navigation-panel',
                    id: 'west-panel',
                    title: LANG.management_menu,
                    split: true,
                    width: 200,
                    minWidth: 175,
                    maxWidth: 400,
                    collapsible: true,
                    animCollapse: true,
                    margins: '0 0 0 5',
                    layout: 'fit',
                    items: [{
                        xtype: 'treepanel',
                        store: Ext.create('Ext.data.TreeStore', {
                            autoLoad: false,
                            fields: [
                                { name: 'text', type: 'string' },
                                { name: 'id', type: 'string' }
                            ],
                            root: {
                                text: 'Monitor',
                                id: 'src',
                                expanded: true,
                                children: []
                            }
                        }),
                        hideHeaders: true,
                        rootVisible: false,
                        singleExpand: false,
                        title: 'Dashboard',
                        iconCls: 'info',
                        collapsible: false,
                        listeners: {
                            afterrender: function (comp) {
                                common.utils.ajax.get('/Response', {
                                    content: 'admin',
                                    node: 'tree_menugroup',
                                    output: 'json',
                                    p: ADMIN_STORE.session.user.id
                                }).then(function (data) {
                                    var rootNode = comp.getRootNode();

                                    data.tree_menugroup.node.forEach(function (data) {
                                        rootNode.appendChild({
                                            text: LANG[data.text.toLowerCase()],
                                            id: data.id,
                                            expanded: false,
                                            collapsed: false
                                        });
                                    });
                                });
                            },
                            itemclick (comp, record, item, index, e, eOpts) {
                                if (record.get('leaf')) {
                                    var id = record.get('id');
                                    var title = record.get("text");
                                    var tabPanel = Ext.getCmp('tabPanel');
                                    if (tabPanel) {
                                        var checkTab = tabPanel.getComponent(id);
                                        if (checkTab) {
                                            tabPanel.setActiveTab(checkTab);
                                        } else {
                                            common.utils.ajax.get('/admin/list/' + id + '.js')
                                                .then(function (data) {
                                                    var newComponent = eval(data);
                                                    tabPanel.add(newComponent);
                                                    tabPanel.doLayout();
                                                    tabPanel.setActiveTab(newComponent);
                                                })
                                                .catch(function () {
                                                    Ext.Msg.alert("Grid create failed", "Server communication failure");
                                                });
                                        }
                                    }
                                }
                            },
                            beforeitemexpand: function (node, index, item, eOpts) {
                                if (node.childNodes.length !== 0) return;

                                var that = this;

                                common.utils.ajax.get('/Response', {
                                    content: 'admin',
                                    node: 'tree_openobject',
                                    output: 'json',
                                    p: [ADMIN_STORE.session.user.id, node.get('id')]
                                }).then(function (data) {
                                    data.tree_openobject.node.forEach(function (data) {
                                        node.appendChild({
                                            text: LANG[data.text.toLowerCase()],
                                            id: data.id,
                                            leaf: true,
                                            expanded: false,
                                            pgmid: data.pgmid,
                                            qtip: data.qtip,
                                            cls: data.cls
                                        });
                                    });

                                    node.expand(false);
                                });

                                return false;
                            }
                        }
                    }]
                }, {
                    xtype: 'tabpanel',
                    id: 'tabPanel',
                    region: 'center',
                    deferredRender: false,
                    plain: true,
                    activeTab: 0,
                    plugins: [
                        Ext.create('Ext.ux.TabCloseMenu')
                    ],
                    listeners: {
                        afterrender: function (comp) {
                            common.utils.ajax.get('/admin/list/LoginInfo.js')
                                .then(function (data) {
                                    var newComponent = eval(data);
                                    comp.add(newComponent);
                                    comp.doLayout();
                                    comp.setActiveTab(newComponent);
                                })
                                .catch(function () {
                                    Ext.Msg.alert("Grid create failed", "Server communication failure");
                                });
                        }
                    }
                }],
                renderTo: document.querySelector('body'),
            });
        }).catch(function (error) {
            console.error(error);
        });
});
