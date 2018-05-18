/**
 * Created by Hongkyun on 14. 4. 22.
 */
Ext.define('RTM.EED.OS',{
    extend      : 'Ext.container.Container',
	title  	: common.Util.TR('CPU, Memory (Single)'),
	padding	: 1,
	border 	: true,
	cls    	: 'Exem-DockForm Auto-OS',

	cpu		: {},
	memory	: {},
	is_init	:  false,
	is_init_finish : false,
	is_style_finish: false,

	listeners: {
		resize: function(me, width) {
			this.resizeCombo(width)
		}
	},

	beforeDestroyEvent: function(me){
		this.osData = null;
		common.RTMDataManager.removeFrame(common.RTMDataManager.frameGroup.ALARM, me);
	},

	initFrameOption: function(){
		if ( this.frameOption.isIOWaitCheck == null ) {
			this.frameOption.isIOWaitCheck = true;
		}

		if ( this.frameOption.instanceName == null || this.instanceList.indexOf(this.frameOption.instanceName) == -1 ) {
			this.frameOption.instanceName = window.rtmViewManager.getActivityTabInstanceName() || this.instanceList[0];
		}
	},

	init : function () {
		if ( this.is_init ) {
			return;
		}
		this.is_init = true;
		this.is_init_finish  = false;
		this.is_style_finish = false;

		this.instanceList = window.rtmViewManager.getActivityTabInstance();
		this.businessFlag = common.WebEnv.getGroupNameType();

		var levelColors = common.WebEnv.getLevelColor();

		this.initFrameOption();

		this.osData    = {};
		this.osWinFlag = false;
		this.cpuColorList    = [ levelColors.cpu   , levelColors.warning, levelColors.critical ];
		this.memoryColorList = [ levelColors.memory, levelColors.warning, levelColors.critical ];

        this.activeCpuStatName = 'active_cpu_num';
        this.hpOSList   = ['HP', 'HPIA'];
        this.isHPServer = false;
        this.hpStatIdx  = null;

		// this.beforeCPUValue    = 0;
		// this.beforeMemoryValue = 0;
		// this.beforeComboIdx = 0;

		this.ioWaitCheck = Ext.create('Ext.form.field.Checkbox', {
			boxLabel : common.Util.TR('Exclude I/O wait'),
			width    : 105,
			margin   : '0 0 0 15',
			checked  : this.frameOption.isIOWaitCheck,
			cls      : 'base-frame-font',
			listeners:  {
				change: function(checkbox, nv) {
					if (nv) {
						this.ioLabel.hide();
						this.cpuIOValue.hide();
					} else {
						this.ioLabel.show();
						this.cpuIOValue.show();
					}

					this.frameOption.isIOWaitCheck = nv;
					this.saveFrameOption();
				}.bind(this)
			}
		});

		var ix, ixLen, instanceName, labelName;
		var dbArr = [];

		if (this.businessFlag) {
			for (ix = 0, ixLen = this.instanceList.length; ix < ixLen; ix++) {
				instanceName = this.instanceList[ix];
				dbArr.push({"idx": instanceName, "name": common.Util.getBusinessName(instanceName)});
			}
			labelName = common.Util.TR('Business Name');
		} else {
			for (ix = 0, ixLen = this.instanceList.length; ix < ixLen; ix++) {
				instanceName = this.instanceList[ix];
				dbArr.push({"idx": instanceName, "name": instanceName});
			}
			labelName = common.Util.TR('Instance Name');
		}

		var dbStore = Ext.create('Ext.data.Store', {
			fields: ['idx', 'name'],
			data  : dbArr
		});

		this.dbCombo = Ext.create('Exem.ComboBox', {
			fieldLabel	: labelName,
			itemId    	: 'dbCombo',
			width     	: 100,
			labelWidth	: 85,
			margin    	: '2 5 0 0',
			cls       	: 'xm-combo-theme',
			store     	: dbStore,
			valueField	: 'idx',
			displayField: 'name',
			useSelectFirstRow: false,
			listeners: {
				select : function(combo, rec) {
					// this.beforeComboIdx = rec[0].data['idx'];
					this.frameOption.instanceName = rec[0].data['idx'];
					this.cpuChartLayer.dbName = this.frameOption.instanceName;
					this.memoryChartLayer.dbName = this.frameOption.instanceName;

					// 알람 상태 초기화
					if (this.cpu) {this.cpu.alarmLevel = 0;}
					if (this.memory) {this.memory.alarmLevel = 0;}

					this._initData();
					this.alarmCheck();
					this.ioWaitShowHide();
                    this._getHPStatIdx();
					this.frameRefresh();
					this.saveFrameOption();
				}.bind(this)
			}
		});

		var dbName = this.instanceList[this.dbCombo.getValue()];

		var baseContainer = Ext.create('Exem.Container', {
            cls   : 'frame-OS-Label',
			layout: { type : 'vbox', align: 'middle', pack : 'center' }
		});

		this.frameTitle = Ext.create('Ext.form.Label',{
			height: 30,
			margin: '3 0 0 0',
			text  : common.Util.TR('CPU, Memory (Single)'),
			cls   : 'base-frame-title'
		});

		this.topArea = Ext.create('Ext.container.Container', {
			width : '100%',
			height: 25,
			layout: 'hbox',
			margin : '10 0 0 15',
			padding : '0 10 0 0'
		});

		var centerArea = Ext.create('Ext.container.Container', {
			width  : '100%',
			height : 140,
			margin : '0 0 20 0',
			layout : { type : 'hbox', align: 'middle', pack : 'center' }
		});

        this.hpValueArea = Ext.create('Exem.Container', {
            width : '100%',
            height: 15,
            hidden: true,
            margin: '-10 0 0 0',
            layout: { type: 'hbox', pack: 'center' }
        });
        var labelStyle = 'text-align: right;';
        //var hpMaxLabel      = this._createLabel('MAX : ');
        //var hpMinLabel      = this._createLabel('MIN : ',     null, null, '0 0 0 5');
        var hpCurrentLabel  = this._createLabel('CPU Core Count : ');
        //this.hpMaxValue     = this._createLabel('0', 25, labelStyle);
        //this.hpMinValue     = this._createLabel('0', 25, labelStyle);
        this.hpCurrentValue = this._createLabel('0', 25, labelStyle);

        //var minLineCon = Ext.create('Ext.container.Container', {
        //    margin: '1 0 0 5',
        //    width: 2,
        //    height: 11,
        //    cls : 'frame-GroupOS-linecon'
        //});
        //var currentLineCon = Ext.create('Ext.container.Container', {
        //    margin: '1 0 0 5',
        //    width: 2,
        //    height: 11,
        //    cls : 'frame-GroupOS-linecon'
        //});

		var chartArea = Ext.create('Ext.container.Container', {
			width  : 370,
			height : 140,
			layout : 'absolute'
		});

		var chartLeftArea = Ext.create('Ext.container.Container', {
			x : 0,
			y : 15,
			width  : 240,
			height : '100%',
			layout : { type : 'hbox', align: 'middle', pack : 'center' }
		});
		var chartRightArea = Ext.create('Ext.container.Container', {
			x : 130,
			y : 15,
			width  : 240,
			height : '100%',
			layout : { type : 'hbox', align: 'middle', pack : 'center' }
		});

		// ================ cpu ================

		this.cpuChartLayer = Ext.create('Exem.Container', {
			width : 120,
			height: 120,
			dbName: dbName,
			style : 'cursor : pointer;',//background : #fff',
			listeners : {
				render: function(me) {
					me.getEl().on('click', function() {
						common.OpenView.ShowTopGrid(this.dbCombo.getValue(), 2, 'CPU');
					}, this);
				}.bind(this),
				afterrender: function(me) {
					this.cpu = Ext.create('Exem.chart.CanvasArc', {
						title: 'CPU',
						fps:1,
						oldValue : null,
						target: me,
						color: this.cpuColorList
						//color: ['#2b99f0', '#FF9803', '#D7000F']
					});

					this.cpu.draw(0); // 초기화
					//me.cpu.oldValue = 0;
				}.bind(this)
			}
		});

		var cpuLabelLayer = Ext.create('Ext.container.Container', {
			width  : 90,
			height : 120,
			layout : 'vbox',
			listeners: {
				afterrender: function(me) {
					if(me.el){
						me.el.dom.children[0].style.overflow = 'inherit';
						me.el.dom.children[0].style.left = '-20px';
					}

                }
			}
		});

		this.cpuUserValue = Ext.create('Ext.form.Label', {
			width : 35,
			style : 'text-align: right;',
			text  : '0%'
		});

		this.cpuSysValue = Ext.create('Ext.form.Label', {
			width : 35,
			style : 'text-align: right;',
			text  : '0%'
		});

		this.cpuIOValue = Ext.create('Ext.form.Label', {
			width : 35,
			style : 'text-align: right;',
			text  : '0%'
		});

		var cpuUserBox = Ext.create('Ext.container.Container', {
			width  : '100%',
			height : 15,
			layout : 'hbox',
			//cls : 'frame-OS-Label',
			items  : [{
					xtype : 'label',
					flex  : 1,
					text  : 'User : ',
					style : 'text-align: right;'
				},
				this.cpuUserValue
			]
		});
		var cpuSysBox = Ext.create('Ext.container.Container', {
			width  : '100%',
			height : 15,
			layout : 'hbox',
			//cls : 'frame-OS-Label',
			items  : [{
					xtype : 'label',
					flex  : 1,
					text  : 'Sys : ',
					style : 'text-align: right;'
				},
				this.cpuSysValue
			]
		});

		this.ioLabel = Ext.create('Ext.form.Label', {
			text : 'I/O : ',
			style: 'text-align: right;',
			flex : 1
		});

		var cpuIOBox = Ext.create('Ext.container.Container', {
			width  : '100%',
			height : 15,
			layout : {
				type : 'hbox',
				align: 'middle',
				pack : 'center'
			},
			//cls : 'frame-OS-Label',
			items  : [ this.ioLabel, this.cpuIOValue ]
		});

		if ( this.ioWaitCheck ) {
			this.ioLabel.hide();
			this.cpuIOValue.hide();
		}

		//================ memory =================

		this.memoryTotalValue = Ext.create('Ext.form.Label', {
			text  : '0M'
		});

		this.memoryFreeValue = Ext.create('Ext.form.Label', {
			margin: '0 0 0 -3',
			text  : '0M'
		});

		var memoryTotalBox = Ext.create('Ext.container.Container', {
			width  : '100%',
			height : 18,
			layout : 'hbox',
			//cls : 'frame-OS-Label',
			items  : [{
					xtype : 'label',
					width : 40,
					text  : 'Total : '
				},
				this.memoryTotalValue
			]
		});
		var memoryFreeBox =  Ext.create('Exem.Container', {
			width  : '100%',
			height : 18,
			layout : 'hbox',
			margin : '0 0 0 3',
			//cls : 'frame-OS-Label',
			items  : [{
					xtype : 'label',
					width : 40,
					text  : 'Free :'
				},
				this.memoryFreeValue
			]
		});

		this.memoryChartLayer = Ext.create('Exem.Container', {
			width : 120,
			height: 120,
			dbName: dbName,
			style : 'cursor : pointer;', //background : #fff',
			listeners : {
				render: function(me) {
					me.getEl().on('click', function() {
						common.OpenView.ShowTopGrid(this.dbCombo.getValue(), 2, 'free memory');
					}, this);
				}.bind(this),
				afterrender: function(me) {
					this.memory = Ext.create('Exem.chart.CanvasArc', {
						title: 'Memory',
						fps:1,
						oldValue : null,
						target: me,
						color: this.memoryColorList
						//color: ['#8AC44B', '#FF9803', '#D7000F']
					});
					this.memory.draw(0); // 초기화
					// me.memory.oldValue = 0; // 초기화
					this.is_init_finish = true;
				}.bind(this)
			}
		});

		var memoryLabelLayer = Ext.create('Ext.container.Container', {
			width  : 90,
			height : 120,
			layout : { type : 'vbox', pack : 'end' },
			listeners : {
				afterrender: function (me) {
					if(me.el){
						me.el.dom.children[0].style.overflow = 'inherit';
						me.el.dom.children[0].style.left = '6px';
						//me.el.dom.children[0].style.top = '-30px';
					}
				}
			}
		});

        if ( this.floatingLayer ) {
            this.frameTitle.hide();
            this.dbCombo.setWidth(190);
        }

        //this.hpValueArea.add([hpMaxLabel, this.hpMaxValue, minLineCon, hpMinLabel, this.hpMinValue, currentLineCon, hpCurrentLabel, this.hpCurrentValue]);
        this.hpValueArea.add([ hpCurrentLabel, this.hpCurrentValue ]);
		memoryLabelLayer.add( memoryTotalBox, memoryFreeBox );
		cpuLabelLayer.add(cpuUserBox, cpuSysBox, cpuIOBox, {xtype: 'tbspacer', flex: 1});
		chartRightArea.add(memoryLabelLayer, this.memoryChartLayer);
		chartLeftArea.add(this.cpuChartLayer, cpuLabelLayer);
		chartArea.add(chartLeftArea, chartRightArea);
		centerArea.add(chartArea);
		this.topArea.add(this.frameTitle, {xtype: 'tbspacer', flex : 1},this.ioWaitCheck, this.dbCombo);
		baseContainer.add(this.topArea, centerArea, this.hpValueArea);
		this.add(baseContainer);

		//if(cpuLabelLayer.el){
		//	cpuLabelLayer.el.dom.children[0].style.overflow = 'inherit';
		//	cpuLabelLayer.el.dom.children[0].style.left = '-20px';
		//}
		//
		//if(memoryLabelLayer.el){
		//	memoryLabelLayer.el.dom.children[0].style.overflow = 'inherit';
		//	memoryLabelLayer.el.dom.children[0].style.left = '6px';
		//	memoryLabelLayer.el.dom.children[0].style.top = '-30px';
		//}

		// this.fontStyle = 'color: white; font-family:Tahoma; font-size: 12pt;';

		// this.cpuNormalClass = 'radial-cpuNormal';
		// this.memNormalClass = 'radial-memNormal';
		// this.warningClass   = 'radial-warning';
		// this.criticalClass  = 'radial-critical';

		// this.cpuHeight      = '0%';
		// this.memoryHeight   = '0%';

		// Alarm 등록
		common.RTMDataManager.addFrame(common.RTMDataManager.frameGroup.ALARM, this);

		this.dbCombo.setValue(this.frameOption.instanceName || dbStore.getAt('0'));

		this.resizeCombo(this.getWidth());
		///////////////////////////////// single view init ///////////////////////////////////////
		if(this.dockContainer.className == RTMViewName.SINGLE) {
			this.dbCombo.hide();
		}

        this._getHPStatIdx();
		this.frameRefresh();
		this.alarmCheck();

		if ( !this.frameOption.isIOWaitCheck ) {
			this.ioLabel.show();
			this.cpuIOValue.show();
		}
	},

    _getHPStatIdx: function() {
        this.hpStatIdx = null;
        this.isHPServer = false;

        var ix, ixLen, dbInfoObj, osName, osStatList;

        dbInfoObj = Object.keys(Comm.dbInfoObj || {});
        for (ix = 0, ixLen = dbInfoObj.length; ix < ixLen; ix++) {
            if (this.frameOption.instanceName == Comm.dbInfoObj[dbInfoObj[ix]].instanceName) {
                osName = Comm.dbInfoObj[dbInfoObj[ix]].osName;
                if (this.hpOSList.indexOf(osName) > -1) {
                    this.isHPServer = true;
                    break;
                }
            }
        }

        if (!this.isHPServer) {
            return;
        }

        if (Repository.statList && Repository.statList[this.frameOption.instanceName] && Repository.statList[this.frameOption.instanceName].os) {
            osStatList = Repository.statList[this.frameOption.instanceName].os;

            for (ix = 0, ixLen = osStatList.length; ix < ixLen; ix++) {
                if (osStatList[ix][1] == this.activeCpuStatName) {
                    this.hpStatIdx = osStatList[ix][0];
                    break;
                }
            }
        }
    },

    _createLabel: function(text, width, style, margin) {
        return Ext.create('Ext.form.Label', {
            width : width,
            margin: margin,
            style : style,
            text  : text
        });
    },

	_initData: function() {
		this.cpuUserValue.setText('0%');
		this.cpuSysValue.setText('0%');
		this.cpuIOValue.setText('0%');
		this.memoryTotalValue.setText('0');
		this.memoryFreeValue.setText('0');

		this.cpu.draw(0);
		//this.cpu.oldValue = 0;
		this.memory.draw(0);
		//this.memory.oldValue = 0;
	},

	frameStyleChange: function(){
		if (!this.is_init || !this.cpuColorList || !this.memoryColorList) {
			return;
		}

		var levelColors = common.WebEnv.getLevelColor();

		this.cpuColorList.length = 0;
		this.cpuColorList.push( levelColors.cpu, levelColors.warning, levelColors.critical );

		this.memoryColorList.length = 0;
		this.memoryColorList.push( levelColors.memory, levelColors.warning, levelColors.critical );

		this.cpu.color    = this.cpuColorList;
		this.memory.color = this.memoryColorList;

		this.cpu.changeDraw();
		this.memory.changeDraw();

		this._inputData();
	},
	frameRefresh: function(){
		if ( !this.is_init ) {
			return;
		}

		if ( this.isVisible() ) {
			this._inputData();
		}

		//var ix;
		//for (ix = 0; ix < this.instanceList.length; ix++) {
		//	if (bufferRepo.data[this.instanceList[ix]]) {
		//		if (this.osData[this.instanceList[ix]] == null) {
		//			this.osData[this.instanceList[ix]] = {
		//				cpuIO      : bufferRepo.data[this.instanceList[ix]].cpuIO,
		//				cpuIdle    : bufferRepo.data[this.instanceList[ix]].cpuIdle,
		//				cpuRatio   : bufferRepo.data[this.instanceList[ix]].cpuRatio,
		//				cpuSys     : bufferRepo.data[this.instanceList[ix]].cpuSys,
		//				cpuUser    : bufferRepo.data[this.instanceList[ix]].cpuUser,
		//				memoryFree : bufferRepo.data[this.instanceList[ix]].memoryFree,
		//				memoryTotal: bufferRepo.data[this.instanceList[ix]].memoryTotal,
		//				memoryUsage: bufferRepo.data[this.instanceList[ix]].memoryUsage,
		//				oracleCPU  : bufferRepo.data[this.instanceList[ix]].oracleCPU
		//			};
		//		} else {
		//			this.osData[this.instanceList[ix]].cpuIO = bufferRepo.data[this.instanceList[ix]].cpuIO;
		//			this.osData[this.instanceList[ix]].cpuIdle = bufferRepo.data[this.instanceList[ix]].cpuIdle;
		//			this.osData[this.instanceList[ix]].cpuRatio = bufferRepo.data[this.instanceList[ix]].cpuRatio;
		//			this.osData[this.instanceList[ix]].cpuSys = bufferRepo.data[this.instanceList[ix]].cpuSys;
		//			this.osData[this.instanceList[ix]].cpuUser = bufferRepo.data[this.instanceList[ix]].cpuUser;
		//			this.osData[this.instanceList[ix]].memoryFree = bufferRepo.data[this.instanceList[ix]].memoryFree;
		//			this.osData[this.instanceList[ix]].memoryTotal = bufferRepo.data[this.instanceList[ix]].memoryTotal;
		//			this.osData[this.instanceList[ix]].memoryUsage = bufferRepo.data[this.instanceList[ix]].memoryUsage;
		//			this.osData[this.instanceList[ix]].oracleCPU = bufferRepo.data[this.instanceList[ix]].oracleCPU;
		//		}
		//	}
		//}
//        setTimeout( this._inputData.bind(this), 3000 );
	},


	_inputData: function() {
		/*
		 Repository['QA163'].statList.os[index]
		 [0, "user cpu",     "", 0]
		 [1, "sys cpu",      "", 0]
		 [2, "iowait cpu",   "", 0]
		 [3, "idle cpu",     "", 0]
		 [4, "free memory",  "", 0]
		 [5, "total memory", "", 0]
		 [6, "CPU",          "", 0]
		 [7, "free swap",    "", 0]
		 [8, "total swap",   "", 0]
		 [9, "active memory","", 0]
		 */
//        var osStatList = Repository.sgaStatusStat[this.instanceName].Sigma.sys_os;

		var bufferRepo = this.getRepositoryData();

		if ( !this.cpu || !this.cpu.draw || !this.memory || !this.memory.draw || !this.frameOption.instanceName || ! bufferRepo) {
			return;
		}

		var osStatList = bufferRepo.data[this.frameOption.instanceName];

		if ( !osStatList ) {
			return;
		}

        if (this.isHPServer) {
            if (this.hpStatIdx == null) {
                this._getHPStatIdx();
            }

            var sgaData = bufferRepo.sgaStatusStat[this.frameOption.instanceName];

            if (this.hpStatIdx > 0 && sgaData && sgaData.Delta && sgaData.Delta.sys_os && sgaData.Delta.sys_os[this.hpStatIdx] != null && sgaData.Delta.sys_os[this.hpStatIdx] > -1) {
                this.hpCurrentValue.setText(sgaData.Delta.sys_os[this.hpStatIdx]);
                if (!this.hpValueArea.isVisible()) {
                    this.hpValueArea.show();
                }
            } else {
                if (this.hpValueArea.isVisible()) {
                    this.hpValueArea.hide();
                }
            }

        } else {
            if (this.hpValueArea.isVisible()) {
                this.hpValueArea.hide();
            }
        }

		var cpuUser = osStatList.cpuUser;
		var cpuSys  = osStatList.cpuSys;
		var cpuIO   = osStatList.cpuIO;

		// 리눅스 버전에서는 I/O wait 가 포함되어야 한다.
		var cpuRatio = cpuUser + cpuSys + ( this.ioWaitCheck.getValue() ? 0 : cpuIO );

		this.cpu.draw(cpuRatio);
//        this.cpu.draw(Math.random()*100);

		var memoryTotal = osStatList.memoryTotal;
		var memoryFree  = osStatList.memoryFree;
		var memoryUsage = osStatList.memoryUsage;

		this.memory.draw(memoryUsage);
//        this.memory.draw(Math.random()*100);

		// Memory 계산
		memoryFree = (memoryFree  / 1024).toFixed(1);
		memoryTotal= (memoryTotal / 1024).toFixed(1);

		if ( memoryFree > 1000 ) {
			memoryFree = ( (memoryFree / 1024).toFixed(1) ) + 'G';
		} else {
			memoryFree = memoryFree + 'M';
		}

		if ( memoryTotal > 1000 ) {
			memoryTotal = ( (memoryTotal / 1024).toFixed(1) ) + 'G';
		} else {
			memoryTotal = memoryTotal + 'M';
		}

		cpuUser += '%';
		cpuSys  += '%';
		cpuIO   += '%';

		if( this.cpuUserValue.text != cpuUser )	this.cpuUserValue.setText(cpuUser);
		if( this.cpuSysValue.text != cpuSys )	this.cpuSysValue.setText(cpuSys);
		if( this.cpuIOValue.text != cpuIO )		this.cpuIOValue.setText(cpuIO);

		if( this.memoryTotalValue.text != memoryTotal ) this.memoryTotalValue.setText(memoryTotal);
		if( this.memoryFreeValue.text != memoryFree   ) this.memoryFreeValue.setText(memoryFree);

		cpuUser = null, cpuSys = null, cpuIO = null, cpuRatio = null;
		memoryTotal = null, memoryFree = null, memoryUsage = null;
	},

	frameChange: function(instanceList) {
		if ( instanceList ) {
			this.instanceList = instanceList;
		}

		var ix, ixLen, instanceName;
		var dbArr = new Array(this.instanceList.length);
		if ( this.businessFlag ) {
			for (ix = 0, ixLen = this.instanceList.length; ix < ixLen; ix++) {
				instanceName = this.instanceList[ix];
				dbArr[ix] = {'idx': instanceName, 'name': common.Util.getBusinessName(instanceName)};
			}
		} else {
			for (ix = 0, ixLen = this.instanceList.length; ix < ixLen; ix++) {
				instanceName = this.instanceList[ix];
				dbArr[ix] = {'idx': instanceName, 'name': instanceName};
			}
		}

		var store = this.dbCombo.getStore();
		store.removeAll();
		store.loadData(dbArr);

		if( instanceList || this.instanceList.indexOf(this.frameOption.instanceName) == -1 ) {
			this.frameOption.instanceName = this.instanceList[0];
		}

		this.dbCombo.setValue(this.frameOption.instanceName);

		if ( this.dockContainer.className == RTMViewName.SINGLE ) {
			this.dbCombo.hide();
		}

		this.cpuChartLayer.dbName = this.frameOption.instanceName;
		this.memoryChartLayer.dbName = this.frameOption.instanceName;

        this._getHPStatIdx();
		this.alarmCheck();
		this.frameRefresh();

		instanceName = null, dbArr = null, store = null;
	},

	frameInstanceNameChange: function() {
		this.businessFlag  = common.WebEnv.getGroupNameType();
		this.resizeCombo(this.getWidth());

        this._getHPStatIdx();
		this.frameChange();
	},

	frameSelectInstance: function (instanceName) {
		if ( instanceName == null ) {
			instanceName = this.instanceList[0];
		}

		if(this.instanceList.indexOf(instanceName) > -1){
			this.dbCombo.setValue(instanceName);
			this.cpuChartLayer.dbName = instanceName;
			this.memoryChartLayer.dbName = instanceName;
			this.frameOption.instanceName = instanceName;
            this._getHPStatIdx();
			this.alarmCheck();
			this.frameRefresh();
		}
	},

	ioWaitShowHide: function() {
		// 현재 instanceName 이 Window 면 hide. 아니면 show
		var dbInfoObj = Object.keys(Comm.dbInfoObj || {});

		for ( var ix = 0, ixLen = dbInfoObj.length; ix < ixLen; ix++ ) {
			if ( this.frameOption.instanceName == Comm.dbInfoObj[dbInfoObj[ix]].instanceName && Comm.dbInfoObj[dbInfoObj[ix]].osType == '' ) {
				this.osWinFlag = true;
				break;
			}
		}

		if ( this.osWinFlag ) {
			this.ioWaitCheck.hide();
			this.cpuIOValue.hide();
		} else {
			this.ioWaitCheck.show();
		}

		ix = null, ixLen = null, dbInfoObj = null;
	},

	singleInstanceFrame: function(instanceName){
		if ( this.instanceList.indexOf(instanceName) > -1 ) {
			var store = this.dbCombo.getStore();
			store.removeAll();
			store.loadData([{idx: instanceName, name: common.Util.getBusinessName(instanceName)}]);

			this.dbCombo.setValue(instanceName);

			this.frameOption.instanceName = instanceName;
			this.cpuChartLayer.dbName = instanceName;
			this.memoryChartLayer.dbName = instanceName;

            this._getHPStatIdx();
			this.frameRefresh();
		}
	},

	/**
	 * @param data [array]
	 * [0] : instance name [string]
	 * [1] : time          [date]
	 * [2] : stat name     [string]
	 * [3] : stat value    [integer]
	 * [4] : level         [string] "Normal" | "Warning" | "Critical"
	 * [5] :
	 * [6] :
	 */
	onAlarm: function(data){
		var instanceName = data[0];

		if ( instanceName != this.frameOption.instanceName || ! this.cpu || ! this.memory ) {
			return;
		}

		var levelType = data[4];
		var statName  = data[2];
		//var levelClass = null;
		var chartEl = null;
		//var memoryValue = null;

		//this.cpuNormalClass = "radial-cpuNormal";
		//this.memNormalClass = "radial-memNormal";
		//this.warningClass  = "radial-warning";
		//this.criticalClass = "radial-critical";


		switch(statName){
			case 'CPU' :
				chartEl = this.cpu;
				//levelClass = this.cpuNormalClass;

				if (data[3] >= 0) {
					this.cpu.draw(data[3]);
					this.cpu.oldValue = data[3];
				}
				break;
			case 'ACTIVE MEMORY':
				chartEl = this.memory;
				//levelClass = this.memNormalClass;
				//if ( !(this.osData && this.osData[data[0]] && this.osData[data[0]].memoryTotal)) {
				//	return;
				//}
				//memoryValue = (data[3] / this.osData[data[0]].memoryTotal * 100).toFixed();
				////console.log('### ActiveMemory ====> ', data[3], 'MemoryVal ###', memoryValue );
				//if (memoryValue > 100) {
				//	memoryValue = 100;
				//}
				//
				//this.memory.draw(memoryValue);
				//this.memory.oldValue = memoryValue;
				break;
			default : return;
		}

		var level = 0;
		switch(levelType){
			case 'Warning' :
				level = 1;
				//levelClass = this.warningClass;
				break;
			case 'Critical' :
				level = 2;
				//levelClass = this.criticalClass;
				break;
			default: break;
		}

//        chartEl.dataset.level = levelType;

		if (chartEl) {
			chartEl.alarmLevel = level;
		}

		// levelClass = null;
		data = null, instanceName = null, chartEl = null, levelType = null;
	},

	resizeCombo: function() {
		if (!this.dbCombo || !this.isVisible()) {
			return;
		}

		// this.frameTitle,
		// this.ioWaitCheck
		// this.dbCombo

		if ( this.frameTitle.isVisible() && this.ioWaitCheck.isVisible() && this.dbCombo.isVisible() ) {
			if ( this.topArea.getWidth() - this.frameTitle.getWidth() - this.ioWaitCheck.getWidth() > 200 ) {
				this.dbCombo.setFieldLabel(common.Util.TR( this.businessFlag ? 'Business Name' : 'Instance Name' ));
				this.dbCombo.setWidth(190);
			} else {
				this.dbCombo.setFieldLabel('');
				this.dbCombo.setWidth(100);
			}
		} else if (!this.frameTitle.isVisible() && this.ioWaitCheck.isVisible() && this.dbCombo.isVisible()) {
			if ( this.topArea.getWidth() - this.ioWaitCheck.getWidth() > 200 ) {
				this.dbCombo.setFieldLabel(common.Util.TR( this.businessFlag ? 'Business Name' : 'Instance Name' ));
				this.dbCombo.setWidth(190);
			} else {
				this.dbCombo.setFieldLabel('');
				this.dbCombo.setWidth(100);
			}
		} else if ( !this.ioWaitCheck.isVisible() && this.dbCombo.isVisible() ) {
			this.dbCombo.setFieldLabel(common.Util.TR( this.businessFlag ? 'Business Name' : 'Instance Name' ));
            this.dbCombo.setWidth(190);
        }
	},

	alarmCheck: function(){
		if( !Repository.alarmListInfo || !this.isVisible() || !this.is_init ) {
			return;
		}

		var ix, ixLen, jx, jxLen, instance, alarmList;
		var instanceList = Object.keys(Repository.alarmListInfo);

		for ( ix = 0, ixLen = instanceList.length; ix < ixLen; ix++ ) {
			this.onAlarm([instanceList[ix], null, 'CPU', -1, 'Normal']);
			this.onAlarm([instanceList[ix], null, 'ACTIVE MEMORY', -1, 'Normal']);

			instance = Repository.alarmListInfo[ instanceList[ix] ];
			alarmList = Object.keys(instance || {});

			for ( jx = 0, jxLen = alarmList.length; jx < jxLen; jx++ ) {
				this.onAlarm(instance[ alarmList[jx] ]);
			}
		}

		instance = null, ix = null, ixLen = null, jx = null, jxLen = null, alarmList = null;
	}

});
