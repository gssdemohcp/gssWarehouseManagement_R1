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


		buildKeyFields: function(oView, inputval, modelData, LoadInd, HuStatus) {
			var oOdataService = oView.gssOdataService(),
				ScreenModel = oView.getViewProperties(),
				bEntityName = ScreenModel.entitySet;                         
			var lgnum = oView.getGlobalModel().getProperty("/currentLgnum");
			var modelArray = [];
			modelArray.push(modelData.Vbeln);
			modelArray.push(modelData.Exidv);
			modelArray.push(modelData.Exida);
			modelArray.push(modelData.Tknum);
			modelArray.push(LoadInd);
			modelArray.push(HuStatus);
			modelArray.push(lgnum);
			var path = "";
			var commaVar = ",";
			var ScreenModel = oView.getViewProperties();
			for(var i = 0; i < ScreenModel.keyFields.length; i++) {
				if (i === ScreenModel.keyFields.length - 1) {
					commaVar = "";
				}
				path = path + ScreenModel.keyFields[i] +  "='" + modelArray[i] + "'" + commaVar ;
				// sPath[i] = this.buildFilter(ScreenModel.fields[i], modelData[i]);
			}
			var sPath = bEntityName + "(" + path + ")";
			this.loadModel(oView, sPath, oOdataService);
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
					vbeln: '',
					Exidv: '',
					loadedHU: '',
					UnloadedHu: '',
					totalHU: '',
					Lgbzo: '',
					Lgtor: '',
					LoadedHuWt: '',
					TotHuWt: '',
					Msgtyp: '',
					Msgtext: '',
					WtUnit: '',
					aItems: [oRfData]
				};
				oRfData.vbeln = oResult.Vbeln;
				oRfData.loadedHU = oResult.LoadedHu;
				oRfData.UnloadedHu = oResult.UnloadedHu;
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
				oGlobalModel.setProperty("/message", oRfData.aItems.Msgtext);
				oGlobalModel.setProperty("/messageType", oRfData.aItems.Msgtyp);
				// delegate error handling
				errorHandling.register(oView.getApplication(), oView.getComponent());

				oGlobalModel.setProperty("/isOdataLoading", false);

				promise.resolve();

			}.bind(this));
			return promise;
		}
	});
});