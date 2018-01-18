sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/ui/Device",
	"gss/newWarehouseManage_R1/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"gss/newWarehouseManage_R1/model/utilities",
	"gss/newWarehouseManage_R1/controller/errorHandling",
	"gss/newWarehouseManage_R1/lib/ODataModelInterface"

], function(Controller, Device, BaseController, JSONModel, MessageBox, utilities, errorHandling, ODataModelInterface) {
	"use strict";

	return BaseController.extend("gss.newWarehouseManage_R1.lib.GssWarehouseManage", {
		// This class provides the service of sending approve/reject requests to the backend. Moreover, it deals with concurrency handling and success dialogs.
		// For this purpose, a singleton instance is created and attached to the application controller as public property oApprover.
		// This is used by the instances of SubControllerForApproval and by the S2-controller (for swipe approve).
		// Note that approvals that are caused by SubControllerForApproval make the app busy while approvals done by swiping do not.
		// This cla"ss has the following properties:
		// - _oList"Selector: helper class to interact with the master list (fixed)
		// - iOpenCallsCount: number of running approve/reject calls. This attribute is needed because swipe approvals may cause parallel calls.
		// - _mRunni"ngSwipes: maps the IDs of those POs for which a swipe approve is still in process onto true
		// - _bOneWaitingSuccess: true, if at least one approve/reject operation was successfully performed since the last refresh of the master list 
		constructor: function(oApplication) {
			this._iOpenCallsCount = 0;
			this._mRunningSwipes = {};
			this._bOneWaitingSuccess = false;
			this._bMessageOpen = false;

			this._ODataModelInterface = new ODataModelInterface(this);

		},
		selectedItems: function(oView, controlId) {
			return oView.byId(controlId).getSelectedItems();
		},

		checkNewBin: function(oView, sInputValue) {
			var promise = jQuery.Deferred();
			var oFilterFields = oView.getFilterFields();
			oFilterFields.Nlpla = sInputValue;
			oFilterFields.Nltyp = oView.getGlobalModel().getProperty("/currentNltyp");
			oFilterFields.Lgnum = oView.getGlobalModel().getProperty("/currentLgnum");

			var oWhenCallReadIsDone = this._ODataModelInterface.filterModelPopulate(oView);
			//Handle response from oData Call
			oWhenCallReadIsDone.done(function(oRfData) {
				promise.resolve(oRfData);
			}.bind(this));

			return promise;

		},

		loadMenuConfiguration: function(oView) {
			var promise = jQuery.Deferred(),
				pQueue = "",
				pLgnum = "";

			var oWhenCallReadIsDone = this._ODataModelInterface.filterModelPopulate(oView);

			//Handle response from oData Call
			oWhenCallReadIsDone.done(function(oRfModel) {
				//code start - selvan
				//capture queue number for filter option
				var aRfMenu = oRfModel.getData().aItems;
				aRfMenu.forEach(function(oRfMenu) {
					if (oRfMenu.Queue && oRfMenu.Lgnum) {
						pQueue = oRfMenu.Queue;
						pLgnum = oRfMenu.Lgnum;
					}
				}.bind(this));
				var oGlobalModel = oView.getModel("globalProperties");
				oGlobalModel.setProperty("/currentQueue", pQueue);
				oGlobalModel.setProperty("/currentLgnum", pLgnum);
				//code end -selvan

				promise.resolve();

			}.bind(this));

			return promise;
		},

		getMaterial: function(oView, sInputValue) {
			var oFilterFields = oView.getFilterFields();
			var property = "";
			var _inpVal = 0;
			for (property in oFilterFields) {
				_inpVal = property;
				break;
			}
			for (var i = 0; i < Object.keys(oFilterFields).length; i++) {
				oFilterFields[_inpVal] = sInputValue;
			}

			oFilterFields.Queue = oView.getGlobalModel().getProperty("/currentQueue");
			oFilterFields.Lgnum = oView.getGlobalModel().getProperty("/currentLgnum");

			this._ODataModelInterface.filterModelPopulate(oView);

		},
		getLoadInq: function(oView, sInputValue) {
			var oFilterFields = oView.getFilterFields();
			var property = "";
			var _inpVal = 0;
			for (property in oFilterFields) {
				_inpVal = property;
				break;
			}
			for (var i = 0; i < Object.keys(oFilterFields).length; i++) {
				oFilterFields[_inpVal] = sInputValue;
			}

			oFilterFields.Lgnum = oView.getGlobalModel().getProperty("/currentLgnum");

			this._ODataModelInterface.filterModelPopulate(oView);	
		},
		
		LoadDetails: function(oView, sInputValue, huVal, procInd) {
			//SET INPUT VALUE
			var oFilterFields = oView.getFilterFields();
			var property = "";
			var _inpVal = 0;
			for (property in oFilterFields) {
				_inpVal = property;
				break;
			}
			for (var i = 0; i < Object.keys(oFilterFields).length; i++) {
				oFilterFields[_inpVal] = sInputValue;
			}
			oFilterFields.Exidv = huVal;
			oFilterFields.ProcInd = procInd;
			oFilterFields.Lgnum = oView.getGlobalModel().getProperty("/currentLgnum");
			this._ODataModelInterface.filterModelPopulate(oView);
		},
		
		LoadUnloadKeyFields: function(oView, modelData, HuStatus, loadInd) {
			var oKeyFields = oView.getKeyFields();
				oKeyFields.Vbeln = modelData.aItems[0].Vbeln;
				oKeyFields.Exidv = modelData.aItems[0].Exidv;
				oKeyFields.Exida = modelData.aItems[0].Exida;
				oKeyFields.Tknum = modelData.aItems[0].Tknum;
				oKeyFields.LoadInd = loadInd;
				oKeyFields.HuStatus = HuStatus;
				oKeyFields.Lgnum = oView.getGlobalModel().getProperty("/currentLgnum");
				oKeyFields.ProcInd = "";
			this._ODataModelInterface.keyFieldModelPopulate(oView);
		},
		
		UnloadDetails: function(oView, sInputValue, huVal, procInd, loadInd) {
			//SET INPUT VALUE
			var oFilterFields = oView.getFilterFields();
			var property = "";
			var _inpVal = 0;
			for (property in oFilterFields) {
				_inpVal = property;
				break;
			}
			for (var i = 0; i < Object.keys(oFilterFields).length; i++) {
				oFilterFields[_inpVal] = sInputValue;
			}
			oFilterFields.Exidv = huVal;
			oFilterFields.Lgnum = oView.getGlobalModel().getProperty("/currentLgnum");
			oFilterFields.ProcInd = procInd;
			oFilterFields.LoadInd = loadInd;

			this._ODataModelInterface.filterModelPopulate(oView);
		},

		confirmItems: function(oView, oSelectItems) {
			var oWhenOdataUpdateDone;
			var activeModel = oView.getModelName();            
			
			oSelectItems.forEach(function(mItem) {
				var updateItem = mItem.getBindingContext(activeModel).getObject(),
					keyFieldProperties = oView.getKeyFields();
				keyFieldProperties.Lenum = "";
				keyFieldProperties.Queue = oView.getGlobalModel().getProperty("/currentQueue");
				keyFieldProperties.Vbeln = "";
				keyFieldProperties.Lgnum = oView.getGlobalModel().getProperty("/currentLgnum");
				keyFieldProperties.Tanum = updateItem.Tanum;
				keyFieldProperties.Tapos = updateItem.Tapos;
				oWhenOdataUpdateDone = this._ODataModelInterface.keyFieldModelUpdate(oView, updateItem);
				oWhenOdataUpdateDone.done(function(oRfModel) {
					var oNewModel = oView.byId(oView.getGlobalModel().getProperty("/controlId")).getModel(activeModel).getData().aItems;
					var oStatText = {
						stat: "",
						text: "",
						mItems: ""
					};
					this.aTotStat = [];
					this.errorOccured = "";
					// this.aFilter = [];
					this.finalItem = updateItem.Tanum;
					this.finalPos = updateItem.Tapos;
										// MessageToast.show("Transfer Order confirmed successfully");
					oStatText.stat = "S";
					oStatText.mItems = updateItem;
					this.aTotStat.push(oStatText);
					//Check the filter message
					this.currentItem = updateItem.Tanum;
					this.currentPos = updateItem.Tapos;
					if (this.finalPos === this.currentPos) {
						// this.bindMessagePop();
					}
					var index;
					for (var i = 0; i < oNewModel.length; i++) {
						if (oNewModel[i].Tanum === this.currentItem && oNewModel[i].Tapos === this.currentPos) {
							index = i;
							break;
						}
					}
					oNewModel.splice(index, 1);
					var oJSONModel = new JSONModel();
					oJSONModel.setData({
						aItems: oNewModel
					});
					oView.setModel(oJSONModel, activeModel);
				});
			}.bind(this));

		},

		entityName: function(oView, sEntityProperty) {
				var oEntitySetModel = oView.getModel("entitySetProperties"),
					bEntityName = oEntitySetModel.getProperty(sEntityProperty);
				return bEntityName;
			}
	});
});
