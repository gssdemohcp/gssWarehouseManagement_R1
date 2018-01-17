sap.ui.define(["sap/ui/base/Object",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"gss/newWarehouseManage_R1/model/utilities",
	"gss/newWarehouseManage_R1/controller/errorHandling"

], function(Object, Device, JSONModel, MessageBox, utilities, errorHandling) {
	"use strict";

	return Object.extend("gss.newWarehouseManage_R1.model.GlobalWarehouseManage", {
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
		menuConfigurationLoad: function(oView, afilters) {
			//Call oDATA Read with entity set name
			var oRfModel = new JSONModel(),
				promise = jQuery.Deferred(),
				oOdataService = oView.gssOdataService(),
				bEntityName = this.entityName(oView, "/MenuConfiguration"),
				oWhenCallReadIsDone = oOdataService.oCallReadDeferred(bEntityName, oView, afilters);

			var pQueue,
				pLgnum;

			var oGlobalModel = oView.getModel("globalProperties");
			oGlobalModel.setProperty("/isOdataLoading", true);
			//Handle response from oData Call
			oWhenCallReadIsDone.done(function(oResult, oFailed) {
				var oRfData;
				oRfData = oResult.results;
				oRfData = {
					rfMenu: oRfData
				};
				oRfModel.setData(oRfData);

				//code start - selvan
				//capture queue number for filter option
				var aRfMenu = oRfModel.getData().rfMenu;
				aRfMenu.forEach(function(oRfMenu) {
					if (oRfMenu.Queue && oRfMenu.Lgnum) {
						pQueue = oRfMenu.Queue;
						pLgnum = oRfMenu.Lgnum;
					}
				}.bind(this));
				oGlobalModel.setProperty("/currentQueue", pQueue);
				oGlobalModel.setProperty("/currentLgnum", pLgnum);
				//code end -selvan

				oGlobalModel.setProperty("/isOdataLoading", false);

				//Create New Model for Menu Configuration Item
				sap.ui.getCore().setModel(oRfModel, "mainJsonModel");

				//Before call errorhandling delegates 
				//Set Response Message and message Type to trigger message box
				oGlobalModel.setProperty("/message", oRfData.rfMenu[0].Msgtext);
				oGlobalModel.setProperty("/messageType", oRfData.rfMenu[0].Msgtyp);
				// delegate error handling
				errorHandling.register(oView.getApplication(), oView.getComponent());

				promise.resolve();

			}.bind(this));

			return promise;
		},

		// ********** Srini code to load putaway data begins *****************
		LoadMaterial: function(oView, sInputValue) {
			//Call oDATA Read with entity set name
			var oRfModel = new JSONModel(),
				promise = jQuery.Deferred(),
				oOdataService = oView.gssOdataService(),

				// bEntityName = this.entityName(oView, "/MaterialList"),
				bEntityName = oView.getViewProperties(),

				inputArray = [];
			inputArray.push(sInputValue);
			inputArray.push(oView.getGlobalModel().getProperty("/currentQueue"));

			inputArray.push(oView.getGlobalModel().getProperty("/currentLgnum"));
			//Setup filter string
			var aFilterValues = oView.gssFilterFunction().setLoadFilter(oView, inputArray),

				//******
				oWhenCallReadIsDone = oOdataService.oCallReadDeferred(bEntityName.entitySet, oView, aFilterValues);

			var oGlobalModel = oView.getModel("globalProperties");

			oGlobalModel.setProperty("/isOdataLoading", true);
			//Handle response from oData Call
			oWhenCallReadIsDone.done(function(oResult, oFailed) {
				var oRfData;
				oRfData = oResult.results;
				oRfData = {
					aItems: oRfData
				};
				oRfModel.setData(oRfData);

				// //Create New Model for Menu Configuration Item
				// oView.setModel(oRfModel, "materialList");
				// Set the current screen model in global model for further retrieval process
				// oGlobalModel.setProperty("/currentModel", oRfModel);
				// oView.setModel(oGlobalModel.getProperty("/currentModel"), "materialList");
				oGlobalModel.setProperty("/controlId", "toTable");

				//Create New Model for Menu Configuration Item
				oView.setModel(oRfModel, "materialList");

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
		// ********** Srini code to load putaway data ends *****************

		// ************ Srini code to get data for Load begins ***********
		LoadDetails: function(oView, sInputValue, huVal, procInd) {
			//Call oDATA Read with entity set name
			var oRfModel = new JSONModel(),
				promise = jQuery.Deferred(),
				oOdataService = oView.gssOdataService(),
				// bEntityName = this.entityName(oView, "/LoadProcess"),

				bEntityName = oView.getViewProperties(),
				inputArray = [];
			inputArray.push(sInputValue);
			inputArray.push(huVal);
			inputArray.push(procInd);
			inputArray.push(oView.getGlobalModel().getProperty("/currentLgnum"));

			//Setup filter string
			var aFilterValues = oView.gssFilterFunction().setLoadFilter(oView);
			//******
			var oWhenCallReadIsDone = oOdataService.oCallReadDeferred(bEntityName.entitySet, oView, aFilterValues);

			var oGlobalModel = oView.getModel("globalProperties");

			oGlobalModel.setProperty("/isOdataLoading", true);
			//Handle response from oData Call
			oWhenCallReadIsDone.done(function(oResult, oFailed) {
				var oRfData = oResult.results;
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
		// ************ Srini code to get data for Load ends ***********

		populateModelBuild: function(oView, sInputValue) {
			var oRfModel = new JSONModel(),
				promise = jQuery.Deferred(),
				oOdataService = oView.gssOdataService(),
				// bEntityName = this.entityName(oView, "/LoadProcess"),
				bEntityName = oView.getViewProperties(),

				inputArray = [];
			inputArray.push(sInputValue);
			inputArray.push(oView.getGlobalModel().getProperty("/currentQueue"));
			inputArray.push(oView.getGlobalModel().getProperty("/currentLgnum"));

			//Setup filter string
			var aFilterValues = oView.gssFilterFunction().setFilter(oView);
			//******
			var oWhenCallReadIsDone = oOdataService.oCallReadDeferred(bEntityName.entitySet, oView, aFilterValues);

			var oGlobalModel = oView.getModel("globalProperties");

			oGlobalModel.setProperty("/isOdataLoading", true);
			//Handle response from oData Call
			oWhenCallReadIsDone.done(function(oResult, oFailed) {
				var oRfData = this.rfDataBuild(oResult, oView);

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

		// ************ Srini code to get data for Unload begins ***********
		UnloadDetails: function(oView, sInputValue, huVal, procInd, loadInd) {
			//Call oDATA Read with entity set name
			var oRfModel = new JSONModel(),
				promise = jQuery.Deferred(),
				oOdataService = oView.gssOdataService(),
				// bEntityName = this.entityName(oView, "/LoadProcess"),
				bEntityName = oView.getViewProperties(),
				inputArray = [];
			inputArray.push(sInputValue);
			inputArray.push(huVal);
			inputArray.push(procInd);
			inputArray.push(loadInd);

			//Setup filter string
			var aFilterValues = oView.gssFilterFunction().setLoadFilter(oView, inputArray);
			//******
			var oWhenCallReadIsDone = oOdataService.oCallReadDeferred(bEntityName.entitySet, oView, aFilterValues);

			var oGlobalModel = oView.getModel("globalProperties");

			oGlobalModel.setProperty("/isOdataLoading", true);
			//Handle response from oData Call
			oWhenCallReadIsDone.done(function(oResult, oFailed) {
				var oRfData = oResult.results;
				oRfData = {
					vbeln: '',
					Exidv: '',
					UnloadedHu: '',
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
				oRfData.UnloadedHu = oResult.results[0].UnloadedHu;
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
		// ************ Srini code to get data for Unload ends ***********

		// *******************Sabari code to Load Inq by Delivery/HU/Shipment data begins *****************
		LoadInqData: function(oView, sInputValue) {
			//Call oDATA Read with entity set name
			var oRfModel = new JSONModel(),
				promise = jQuery.Deferred(),
				oOdataService = oView.gssOdataService(),
				bEntityName = this.entityName(oView, "/LoadProcess"),
				//Setup filter string
				aFilterValues = oView.gssFilterFunction().setLoadInqFilter(oView, sInputValue),
				//******
				oWhenCallReadIsDone = oOdataService.oCallReadDeferred(bEntityName, oView, aFilterValues);

			var oGlobalModel = oView.getModel("globalProperties");

			oGlobalModel.setProperty("/isOdataLoading", true);
			//Handle response from oData Call
			oWhenCallReadIsDone.done(function(oResult, oFailed) {
				var oRfData;
				oRfData = {
					aItems: oResult.results
				};
				oRfModel.setData(oRfData);

				//Create New Model for Menu Configuration Item
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
		entityName: function(oView, sEntityProperty) {
				var oEntitySetModel = oView.getModel("entitySetProperties"),
					bEntityName = oEntitySetModel.getProperty(sEntityProperty);
				return bEntityName;
			}
			// ************* Srini code to get confirm items ends ************
	});
});
// ************* Srini code to get confirm items ends ************
