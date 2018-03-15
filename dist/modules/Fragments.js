sap.ui.define(["sap/ui/base/Object",
	"gss/newWarehouseManage_R1/controller/BaseController",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"gss/newWarehouseManage_R1/model/utilities"

], function(Object, BaseController, Device, JSONModel, Filter, FilterOperator, MessageBox, utilities) {
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
		uiIndCheck: function(oView, indiTO, indiTOConf, indiPost,flag) {
			if (indiTO === "") {
				oView.getGlobalModel().setProperty("/uiInd", "init");
			} else if (indiTO === "X") {
				oView.getGlobalModel().setProperty("/uiInd", "gTo");
				if (indiTOConf === "X") {
					oView.getGlobalModel().setProperty("/uiInd", "toEx");
					if (indiPost === "X") {
						oView.getGlobalModel().setProperty("/uiInd", "post");
					}
				}
			} else if (indiTOConf === "") {
				oView.getGlobalModel().setProperty("/uiInd", "toEx");
			}
			
			utilities.checkUiIndicator(oView);
			if(flag === true){
				utilities.checkVisible(oView);
				
			}

		},

		fragmentFalse: function(oView, flag) {
			oView.byId("Lload").setVisible(false);
			oView.byId("more").setVisible(false);
			oView.byId("items").setVisible(false);
			if (flag) {
				oView.byId("ship").setVisible(false);
			}
			oView.byId("post").setVisible(false);
			oView.byId("TOEx").setVisible(false);
			oView.byId("GTO").setVisible(false); //To display G.TO button

		},

		loadFragment: function(oView, fragmentName) {
			if (!this.fragment) {
				var fragment = oView.getFragmentControllerModel().getProperty("/" + fragmentName);
			}
			return fragment;
		},

		closeFragment: function(fragment) {
			fragment.close();
		}
	});
});