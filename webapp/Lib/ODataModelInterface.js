sap.ui.define(["sap/ui/base/Object",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"gss/newWarehouseManage_R1/model/utilities",
	"gss/newWarehouseManage_R1/controller/errorHandling",
	"gss/newWarehouseManage_R1/Lib/Filters",
	"gss/newWarehouseManage_R1/Lib/KeyFields",
	"gss/newWarehouseManage_R1/Lib/ODATAService"

], function(Object, Device, JSONModel, MessageBox, utilities, errorHandling, Filters,KeyFields,ODATAService) {
	"use strict";

	return Object.extend("gss.newWarehouseManage_R1.model.ODataModelInterface", {
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
		},

		newBinCheckPromise: function(oView, sInputValue) {
			var oOdataService = oView.gssOdataService(),
				bEntityName = this.entityName(oView, "/NewBinCheck"),
				oGlobalModel = oView.getModel("globalProperties"),
				promise = jQuery.Deferred(),
				//Setup filter string
				aFilterValues = oView.gssFilterFunction().setNewBinUriParamter(oView, sInputValue);
			oOdataService.oCallFunctionPromise(bEntityName, oView, aFilterValues)
				.then(function(oData, response) {
					//Before call errorhandling delegates 
					//Set Response Message and message Type to trigger message box
					oGlobalModel.setProperty("/message", oData.Msgtext);
					oGlobalModel.setProperty("/messageType", oData.Msgtyp);
					// delegate error handling
					errorHandling.register(oView.getApplication(), oView.getComponent());
					promise.resolve();
				});
			// .then(function(oError) {
			// 	//Before call errorhandling delegates 
			// 	//Set Response Message and message Type to trigger message box
			// 	oGlobalModel.setProperty("/message", oError);
			// 	oGlobalModel.setProperty("/messageType", "E");
			// 	// delegate error handling
			// 	errorHandling.register(oView.getApplication(), oView.getComponent());
			// 	promise.resolve();
			// });
			return promise;
		},

		newBinCheck: function(oView, sInputValue) {
			var oOdataService = oView.gssOdataService(),
				bEntityName = this.entityName(oView, "/NewBinCheck"),
				oGlobalModel = oView.getModel("globalProperties"),
				promise = jQuery.Deferred(),
				//Setup filter string
				aFilterValues = oView.gssFilterFunction().setNewBinUriParamter(oView, sInputValue);

			var oWhenCallReadIsDone = oOdataService.oCallFunctionService(bEntityName, oView, aFilterValues);
			oWhenCallReadIsDone.done(function(oResult, oFailed) {
				//Before call errorhandling delegates 
				//Set Response Message and message Type to trigger message box
				oGlobalModel.setProperty("/message", oResult.Msgtext);
				oGlobalModel.setProperty("/messageType", oResult.Msgtyp);
				// delegate error handling
				errorHandling.register(oView.getApplication(), oView.getComponent());
				promise.resolve();

			}.bind(this));

			oWhenCallReadIsDone.fail(function(oError) {
				//Before call errorhandling delegates 
				//Set Response Message and message Type to trigger message box
				oGlobalModel.setProperty("/message", oError);
				oGlobalModel.setProperty("/messageType", "E");
				// delegate error handling
				errorHandling.register(oView.getApplication(), oView.getComponent());
				promise.reject();
			}.bind(this));

			return promise;
		},
	
		populateModelBuildbyFilterField: function(oView) {
			var oRfModel = new JSONModel(),
				promise = jQuery.Deferred(),
				currentViewProperty = oView.getViewProperties();

			//Setup filter string
			var aFilterValues = this.CallFilterFunction().setFilter(oView);
			//******
			var oWhenCallReadIsDone = this.CallODataService().oCallReadDeferred(currentViewProperty.entitySet, oView, aFilterValues);

			var oGlobalModel = oView.getModel("globalProperties");

			oGlobalModel.setProperty("/isOdataLoading", true);
			//Handle response from oData Call
			oWhenCallReadIsDone.done(function(oResult, oFailed) {
				var oRfData;
				oRfData = oResult.results;
				oRfData = {
					aItems: [oRfData]
				};
				oRfModel.setData(oRfData);
				oView.setModel(oRfModel, "itemList");
				//Before call errorhandling delegates
				//Set Response Message and message Type to trigger message box
				oGlobalModel.setProperty("/message", oRfData.aItems[0].Msgtext);
				oGlobalModel.setProperty("/messageType", oRfData.aItems[0].Msgtyp);
				// delegate error handling
				errorHandling.register(oView.getApplication(), oView.getComponent());

				oGlobalModel.setProperty("/isOdataLoading", false);

				promise.resolve();

			}.bind(this));
			return promise;

		},
		
		populateModelBuildbyKeyField: function(oView) {
			var oRfModel = new JSONModel(),
				promise = jQuery.Deferred(),
				currentViewProperty = oView.getViewProperties();

			//Setup filter string
			var sPath = this.CallKeyFieldsFunction().buildKeyFields(oView);
			//******
			var oWhenCallReadIsDone = this.CallODataService().oCallReadDeferred(currentViewProperty.entitySet + sPath, oView, "");

			var oGlobalModel = oView.getModel("globalProperties");

			oGlobalModel.setProperty("/isOdataLoading", true);
			//Handle response from oData Call
			oWhenCallReadIsDone.done(function(oResult, oFailed) {
				var oRfData;
				oRfData = oResult;
				oRfData = {
					aItems: [oRfData]
				};
				oRfModel.setData(oRfData);
				oView.setModel(oRfModel, "itemList");
				//Before call errorhandling delegates
				//Set Response Message and message Type to trigger message box
				oGlobalModel.setProperty("/message", oRfData.aItems[0].Msgtext);
				oGlobalModel.setProperty("/messageType", oRfData.aItems[0].Msgtyp);
				// delegate error handling
				errorHandling.register(oView.getApplication(), oView.getComponent());

				oGlobalModel.setProperty("/isOdataLoading", false);

				promise.resolve();

			}.bind(this));
			return promise;

		},

		rfDataBuild: function(oResult, oView) {
			var aViewProperties = oView.getViewProperties(),
				oRfModel = new JSONModel(),
				pQueue,
				pLgnum,
				oGlobalModel = oView.getModel("globalProperties");
			switch (aViewProperties.entitySet) {
				case "/WMProcessSet":
					var oRfData;
					oRfData = oResult.results;
					oRfData = {
						aItems: oRfData
					};
					oRfModel.setData(oRfData);
					oView.setModel(oRfModel, "materialList");

					break;
				case "/LoadProcessSet":
					oRfData = oResult.results;
					oRfData = {
						vbeln: '',
						Exidv: '',
						loadedHU: '',
						totalHU: '',
						Lgbzo: '',
						Lgtor: '',
						LoadedHuWt: '',
						TotHuWt: '',
						Msgtyp: '',
						Msgtext: '',
						WtUnit: '',
						aItems: oRfData
					};
					oRfData.vbeln = oResult.results[0].Vbeln;
					oRfData.loadedHU = oResult.results[0].LoadedHu;
					oRfData.totalHU = oResult.results[0].TotalHu;
					oRfData.Lgbzo = oResult.results[0].Lgbzo;
					oRfData.Lgtor = oResult.results[0].Lgtor;
					oRfData.Exidv = oResult.results[0].Exidv;
					oRfData.LoadedHuWt = oResult.results[0].LoadedHuWt;
					oRfData.TotHuWt = oResult.results[0].TotHuWt;
					oRfData.WtUnit = oResult.results[0].WtUnit;
					oRfModel.setData(oRfData);

					//Create New Model for Menu Configuration Item
					oView.setModel(oRfModel, "itemList");

					break;
				case "/GRProcessSet":

					break;
				case "/GIProcessSet":

					break;
				case "/configurationsSet":

					oRfData = oResult.results;
					oRfData = {
						aItems: oRfData
					};
					oRfModel.setData(oRfData);
					//code start - selvan
					//capture queue number for filter option
					var aRfMenu = oRfModel.getData().aItems;
					aRfMenu.forEach(function(oRfMenu) {
						if (oRfMenu.Queue && oRfMenu.Lgnum) {
							pQueue = oRfMenu.Queue;
							pLgnum = oRfMenu.Lgnum;
						}
					}.bind(this));
					oGlobalModel.setProperty("/currentQueue", pQueue);
					oGlobalModel.setProperty("/currentLgnum", pLgnum);
					//code end -selvan
					sap.ui.getCore().setModel(oRfModel, "mainJsonModel");
					break;

				default:
					oRfData = oResult.results;
					oRfData = {
						rfMenu: oRfData
					};
					oRfModel.setData(oRfData);
					sap.ui.getCore().setModel(oRfModel, "mainJsonModel");

					break;

			}
			return oRfData;

		},

		// ************* Srini code to get selected items from table begins ************
		selectedItems: function(oView, controlId) {
			return oView.byId(controlId).getSelectedItems();
		},
		// ************* Srini code to get selected items from table ends ************

		// ************* Srini code to get confirm items begins ************
		confirmItems: function(oView) {
			var getItems = this.selectedItems(oView),
				oOdataService = oView.gssOdataService();
			// var oErrorModel = new JSONModel();
			getItems.forEach(function(mItem) {
				var bEntityName = this.entityName(oView, "/MaterialList"),
					updateItem = mItem.getBindingContext("itemList").getObject();
				var updatePath = bEntityName + "(Lenum='',Queue='" + updateItem.Queue + "',Vbeln='',Lgnum='" + updateItem.Lgnum +
					"',Tanum='" + updateItem.Tanum + "',Tapos='" + updateItem.Tapos +
					"')",
					oWhenCallUpdateIsDone = oOdataService.oCallUpdateDeferred(updatePath, updateItem, mItem, oView);

			}.bind(this));
		},
		CallFilterFunction:function(){
			return this._ofilters = new Filters(this);
		},
		CallKeyFieldsFunction:function(){
			return this._okeyfields = new KeyFields(this);
		},
		CallOdataService:function(){
			return this.oODATAService = new ODATAService(this);
		},
			// ************* Srini code to get confirm items ends ************
		
			
	});
});
// ************* Srini code to get confirm items ends ************