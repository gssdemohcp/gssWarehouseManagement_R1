sap.ui.define(["sap/ui/base/Object",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"

], function(Object, Device, JSONModel,Filter, FilterOperator) {
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
		
		getFilters: function(field, value) {
			var aFilter = new Filter(field, FilterOperator.EQ, value);
			return aFilter;
		},
		
		buildFilters: function(inputVal, oView) {
			var pQueue,
				pLgnum;
				// promise = jQuery.Deferred();
			var aFilters = [];
			var aRfMenu = sap.ui.getCore().getModel("mainJsonModel").getData().rfMenu;
			var oGlobalModel = oView.getModel("globalProperties");
			this._currentScreen = oGlobalModel.getProperty("/currentScreen");
			// Putaway or picking by TO both as same screen and filters
			if (this._currentScreen === "LM03" || this._currentScreen === "LM05") {
				this._input = inputVal;
				aRfMenu.forEach(function(oRfMenu) {
					if (oRfMenu.Queue && oRfMenu.Lgnum) {
						pQueue = oRfMenu.Queue;
						pLgnum = oRfMenu.Lgnum;
						this.Nltyp = oRfMenu.Nltyp;
					}
				}.bind(this));
				var filterTanum = this.getFilters("Tanum", inputVal);
				var filterPqueue = this.getFilters("Queue", pQueue);
				var filterLgnum = this.getFilters("Lgnum", pLgnum);
				aFilters.push(filterTanum);
				aFilters.push(filterPqueue);
				aFilters.push(filterLgnum);
				// this.getEntityset("/WMProcessSet", aFilters);
				// if (this._currentScreen === "LM05") {
				// 	this.getView().byId("newBin").setVisible(false);
				// }
				// promise.resolve(aFilters);
				return aFilters;
			}
		}
	});
});