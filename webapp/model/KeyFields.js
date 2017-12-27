sap.ui.define(["sap/ui/base/Object",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"gss/newWarehouseManage_R1/controller/errorHandling"

], function(Object, Device, JSONModel, Filter, FilterOperator, errorHandling) {
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
		},

		loadMaterials: function(oView, inputval, modelData) {
			var oOdataService = oView.gssOdataService(),
				bEntityName = oView.gssCallFunction().entityName(oView, "/LoadProcess");
			var lgnum = oView.getGlobalModel().getProperty("/currentLgnum");
			if (modelData.aItems) { // To check how the array is built
				if (modelData.aItems.constructor === Array) { // To check for array
					if (modelData.aItems[0].Tknum) { // To check if the field has value
						var inputVal = modelData.aItems[0].Tknum; // To assign value to the variable
					} else {
						inputVal = inputval;
					}
					var sPath = bEntityName + "(Vbeln='',Exidv='" + modelData.aItems[0].Exidv + "',Exida='" + modelData.aItems[0].Exida +
						"',Tknum='" + inputVal +
						"',LoadInd='',HuStatus='HU03',Lgnum='" + lgnum + "')"; // To build URL to backend for Load process
				} else {
					if (modelData.aItems.Tknum) { // To check how the array is built
						inputVal = modelData.aItems.Tknum; // To assign value to the variable
					} else {
						inputVal = inputval;
					}
					sPath = bEntityName + "(Vbeln='',Exidv='" + modelData.aItems.Exidv + "',Exida='" + modelData.aItems.Exida +
						"',Tknum='" +
						inputVal +
						"',LoadInd='',HuStatus='HU03',Lgnum='" + lgnum + "')"; // To build URL to backend for Load process
				}
			} else {
				if (modelData.Tknum) { // To check how the array is built
					inputVal = modelData.Tknum; // To assign value to the variable
				} else {
					inputVal = inputval;
				}
				sPath = bEntityName + "(Vbeln='',Exidv='" + modelData.Exidv + "',Exida='" + modelData.Exida + "',Tknum='" + inputVal +
					"',LoadInd='',HuStatus='HU03',Lgnum='" + lgnum + "')"; // To build URL to backend for Load process
			}
			this.loadModel(oView, sPath, oOdataService);
		},

		revertLoad: function(oView, inputval, modelData) {
			var oOdataService = oView.gssOdataService(),
				bEntityName = oView.gssCallFunction().entityName(oView, "/LoadProcess");
			var lgnum = oView.getGlobalModel().getProperty("/currentLgnum");
			if (modelData.aItems) { // To check for values in the array
				if (modelData.aItems.constructor === Array) { // To check modelData is an array
					if (modelData.aItems[0].Tknum) { // To check if the field has values
						var inputVal = modelData.aItems[0].Tknum; // To assign value to the variable
						var huVal = modelData.aItems[0].Exidv; // To assign value to the variable
					} else {
						inputVal = inputval; // To get value from the input field
						huVal = this.getView().byId("scanHUDel").getValue(); // To get value from the input field
					}
					var sPath = bEntityName + "(Vbeln='',Exidv='" + huVal + "',Exida='" + modelData.aItems[0].Exida + "',Tknum='" + inputVal +
						"',LoadInd='',HuStatus='HU04',Lgnum='" + lgnum + "')"; // Building URL for unload process
				} else {
					if (modelData.aItems.Tknum) { // To check if the field has values
						inputVal = modelData.aItems.Tknum; // To assign value to the variable
						huVal = modelData.aItems.Exidv; // To assign value to the variable
					} else {
						inputVal = inputval; // To get value from the input field
						huVal = this.getView().byId("scanHUDel").getValue(); // To get value from the input field
					}
					sPath = bEntityName + "(Vbeln='',Exidv='" + huVal + "',Exida='" + modelData.aItems.Exida + "',Tknum='" + inputVal +
						"',LoadInd='',HuStatus='HU04',Lgnum='" + lgnum + "')"; // Building URL for unload process
				}
				this.loadModel(oView, sPath, oOdataService);
			}
		},
		
		loadModel: function(oView, sPath, oOdataService) {
			var oWhenCallReadIsDone = oOdataService.oCallReadDeferred(sPath, oView, ""); // To pass the built URL to get entityset data
			var oGlobalModel = oView.getModel("globalProperties");
			var oRfModel = new JSONModel(),
				promise = jQuery.Deferred();
			oGlobalModel.setProperty("/isOdataLoading", true);
			//Handle response from oData Call
			oWhenCallReadIsDone.done(function(oResult, oFailed) {
				var oRfData;
				oRfData = oResult;
				oRfData = {
					shipDesc: '',
					shipStat: '',
					tprfo: '',
					vbeln: '',
					delStat: '',
					Exida: '',
					Exidv: '',
					huStatDesc: '',
					loadedHU: '',
					totalHU: '',
					Tknum: '',
					Lgbzo: '',
					Lgtor: '',
					LoadedHuWt: '',
					TotHuWt: '',
					Msgtyp: '',
					Msgtext: '',
					HuStatus: '',
					ProcInd: '',
					WtUnit: '',
					aItems: oRfData
				};
				oRfData.vbeln = oResult.Vbeln;
				oRfData.loadedHU = oResult.LoadedHu;
				oRfData.totalHU = oResult.TotalHu;
				oRfData.Lgbzo = oResult.Lgbzo;
				oRfData.Lgtor = oResult.Lgtor;
				oRfData.Exidv = oResult.Exidv;
				oRfData.LoadedHuWt = oResult.LoadedHuWt;
				oRfData.TotHuWt = oResult.TotHuWt;
				oRfData.WtUnit = oResult.WtUnit;
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
		}
	});
});