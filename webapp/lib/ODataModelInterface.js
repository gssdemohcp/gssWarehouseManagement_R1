sap.ui.define(["sap/ui/base/Object",
	"sap/ui/model/json/JSONModel",
	"gss/newWarehouseManage_R1/model/utilities",
	"gss/newWarehouseManage_R1/controller/errorHandling",
	"gss/newWarehouseManage_R1/lib/ODATAService",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast"

], function(Object, JSONModel, utilities, errorHandling, ODATAService, Filter, FilterOperator, MessageToast) {
	"use strict";

	return Object.extend("gss.newWarehouseManage_R1.lib.ODataModelInterface", {
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

			//CREAT OBJECT FOR ODATA SERVICE
			//GET GLOBAL VARIABLE VALUES FROM BASE CONTROLLER/GLOBAL MODEL

			this._oODATAService = new ODATAService(this);
			this._oRfModel = new JSONModel();
		},

		filterModelPopulate: function(oView) {
			var promise = jQuery.Deferred();
			//GET VIEW ENTITY SET NAME FROM CONFIQURATION JSON MODEL
			var sEntitySet = oView.getEntitySet();
			//GET FILTER FIELDS FROM CONFIGURATION JSON MODEL
			var oFilterFields = oView.getFilterFields();
			//SETUP FILTER STRING
			var aFilterValues = this.setFilter(oFilterFields);
			//CALL ODATA SERVICE
			var oWhenCallReadIsDone = this._oODATAService.oCallReadDeferred(sEntitySet, oView, aFilterValues);

			//Handle response from oData Call
			oWhenCallReadIsDone.done(function(oResult, oFailed) {
				var oRfData;
				oRfData = oResult.results;
				oRfData = {
					aItems: oRfData
				};

				this.errorHandlingDelegate(oView, oRfData, true);

				promise.resolve(this._oRfModel);

			}.bind(this));
			return promise;

		},

		keyFieldModelPopulate: function(oView) {
			var promise = jQuery.Deferred();
			//GET VIEW ENTITY SET NAME FROM CONFIQURATION JSON MODEL
			var sEntitySet = oView.getEntitySet();
			//GET KEY FIELDS FROM CONFIGURATION JSON MODEL
			var oKeyFields = oView.getKeyFields();
			//Setup filter string
			var sPath = this.setKeyField(oKeyFields);

			var oWhenCallReadIsDone = this._oODATAService.oCallReadDeferred(sEntitySet + sPath, oView, "");
			//Handle response from oData Call
			oWhenCallReadIsDone.done(function(oResult, oFailed) {
				var oRfData;
				oRfData = oResult;
				oRfData = {
					aItems: [oRfData]
				};
				this.errorHandlingDelegate(oView, oRfData, true);

				promise.resolve(this._oRfModel);

			}.bind(this));

			return promise;

		},
		keyFieldModelUpdate: function(oView, oUpdateItem) {
			var oGlobalModel = oView.getModel("globalProperties");
			var promise = jQuery.Deferred();
			//GET VIEW ENTITY SET NAME FROM CONFIQURATION JSON MODEL
			var sEntitySet = oView.getEntitySet();
			//GET KEY FIELDS FROM CONFIGURATION JSON MODEL
			var oKeyFields = oView.getKeyFields();
			//Setup filter string
			var sPath = this.setKeyField(oKeyFields);
			var oWhenCallUpdateIsDone = this._oODATAService.oCallUpdateDeferred(sEntitySet + sPath, oUpdateItem, oView);
			//Handle response from oData Call
			oWhenCallUpdateIsDone.done(function(oResult, oFailed) {

				var oRfData = this.buildMessage(oView);
				oGlobalModel.setProperty("/message", oRfData.aItems[0].Msgtext);
				oGlobalModel.setProperty("/messageType", oRfData.aItems[0].Msgtyp);
				errorHandling.register(oView.getApplication(), oView.getComponent());

				promise.resolve(oResult);
			}.bind(this));

			return promise;

		},

		buildMessage: function(oView) {
			var currentScreen = oView.getGlobalModel().getProperty("/currentScreen");
			var msg;
			if (currentScreen === "LM555" || currentScreen === "LM666") {
				msg = "Material(s) unpacked successfully!";
			} else if (currentScreen === "LM333" || currentScreen === "LM444" || currentScreen === "LM334" || currentScreen === "LM445") {
				msg = "Item details saved successfully!";
			} else if (currentScreen === "LM777") {
				msg = "Shipment details saved successfully!";
			} else if (currentScreen === "LM09" || currentScreen === "LM06" || currentScreen === "LM03") {
				msg = "Material(s) confirmed successfully!";
			}

			var oRfData = [];
			oRfData.Msgtyp = "S";
			oRfData.Msgtext = msg;
			oRfData = {
				aItems: [oRfData]
			};
			return oRfData;
		},

		keyFieldModelCreate: function(oView, oUpdateItem) {
			var oGlobalModel = oView.getModel("globalProperties");
			var promise = jQuery.Deferred();
			//GET VIEW ENTITY SET NAME FROM CONFIQURATION JSON MODEL
			var sEntitySet = oView.getEntitySet();
			//GET KEY FIELDS FROM CONFIGURATION JSON MODEL
			/*var oKeyFields = oView.getKeyFields();*/
			//Setup filter string
			/*var sPath = this.setKeyField(oKeyFields);*/
			var oWhenCallCreateIsDone = this._oODATAService.oCallCreateDeferred(sEntitySet, oUpdateItem, oView);
			//Handle response from oData Call
			oWhenCallCreateIsDone.done(function(oResult, oFailed) {
				var oRfData;
				oRfData = oResult;
				oRfData = {
					aItems: [oRfData]
				};
				oGlobalModel.setProperty("/message", oRfData.aItems[0].Msgtext);
				oGlobalModel.setProperty("/messageType", oRfData.aItems[0].Msgtyp);
				errorHandling.register(oView.getApplication(), oView.getComponent());
				promise.resolve(oResult);
			}.bind(this));
			return promise;
		},

		errorHandlingDelegate: function(oView, oRfData, setModelFlag) {
			var oGlobalModel = oView.getModel("globalProperties");

			if (oRfData.aItems.length !== 0) {

				//SET MODEL TO CURRENT VIEW
				var sModelName = oView.getModelName();
				if (sModelName.length !== 0 && setModelFlag === true) {
					this._oRfModel.setData(oRfData);
					oView.setModelData(oRfData);
					oView.setModel(this._oRfModel, oView.getModelName());
				}

				//Before call errorhandling delegates
				//Set Response Message and message Type to trigger message box
				oGlobalModel.setProperty("/message", oRfData.aItems[0].Msgtext);
				oGlobalModel.setProperty("/messageType", oRfData.aItems[0].Msgtyp);

			} else {
				//Set Response Message and message Type to trigger message box
				oGlobalModel.setProperty("/message", "Invalid Input");
				oGlobalModel.setProperty("/messageType", "E");

			}
			// delegate error handling
			errorHandling.register(oView.getApplication(), oView.getComponent());
		},

		// ************* Srini code to get selected items from table begins ************
		selectedItems: function(oView, controlId) {
			return oView.byId(controlId).getSelectedItems();
		},
		functionCallByFilter: function(oView) {
			var promise = jQuery.Deferred();
			//GET VIEW ENTITY SET NAME FROM CONFIQURATION JSON MODEL
			var sEntitySet = oView.getEntitySet();
			//GET FILTER FIELDS FROM CONFIGURATION JSON MODEL
			var oFilterFields = oView.getFilterFields();
			//SETUP FILTER STRING
			var aFilterValues = this.setFilter(oFilterFields);
			//CALL ODATA SERVICE
			this._oODATAService.oCallFunctionPromise(sEntitySet, oView, aFilterValues)
				.then(function(oResult, response) {
					var oRfData;
					oRfData = oResult;
					oRfData = {
						aItems: [oRfData]
					};
					this.errorHandlingDelegate(oView, oRfData, true);
					promise.resolve(oRfData);
				});

			return promise;

		},

		setUrlFilter: function(oFilterFields) {
			/*	[{"Lgnum":oView.getGlobalModel().getProperty("/currentLgnum"),
				"Nltyp":oView.getGlobalModel().getProperty("/currentNltyp"),
				"Nlpla": sInputValue}];*/
			var index = 0,
				property = "",
				aFilterValues = [];
			var inputValues = [],
				fieldValues = [];
			if (oFilterFields !== null) {
				for (index in oFilterFields) {
					inputValues.push(oFilterFields[index]);
					index++;
				}
				for (property in oFilterFields) {
					fieldValues.push(property);
				}
				for (var i = 0; i < fieldValues.length; i++) {
					aFilterValues.push(this.buildFilter(fieldValues[i], inputValues[i]));
				}
			}
			return aFilterValues;

		},

		buildFilter: function(field, value) {
			var aFilter = new Filter(field, FilterOperator.EQ, value);
			return aFilter;
		},

		setFilter: function(oFilterFields) {
			var index = 0,
				property = "",
				aFilterValues = [];
			var inputValues = [],
				fieldValues = [];
			if (oFilterFields !== null) {
				for (index in oFilterFields) {
					inputValues.push(oFilterFields[index]);
					index++;
				}
				for (property in oFilterFields) {
					fieldValues.push(property);
				}
				for (var i = 0; i < fieldValues.length; i++) {
					aFilterValues.push(this.buildFilter(fieldValues[i], inputValues[i]));
				}
			}
			return aFilterValues;
		},
		setKeyField: function(oKeyFields) {
			var index = 0,
				modelArray = [],
				fieldArray = [];
			var path = "",
				property = "",
				commaVar = ",";

			if (oKeyFields !== null) {
				for (index in oKeyFields) {
					modelArray.push(oKeyFields[index]);
					index++;
				}

				for (property in oKeyFields) {
					fieldArray.push(property);
				}

				for (var i = 0; i < fieldArray.length; i++) {
					if (i === fieldArray.length - 1) {
						commaVar = "";
					}
					path = path + fieldArray[i] + "='" + modelArray[i] + "'" + commaVar;
				}
			}
			var sPath = "(" + path + ")";
			return sPath;
		}

	});
});
// ************* Srini code to get confirm items ends ************