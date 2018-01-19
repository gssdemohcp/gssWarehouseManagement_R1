sap.ui.define(["sap/ui/base/Object",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"gss/newWarehouseManage_R1/model/utilities"

], function(Object, Device, JSONModel, Filter, FilterOperator, MessageBox, utilities) {
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

		diffCalculation: function(actualVal, targVal, fragmentLoaded) {
			var diffVal = targVal - actualVal;
			if (diffVal >= 0 && diffVal <= targVal) {
				var oData = fragmentLoaded.getModel("handleDiff").getData();
				// sap.ui.getCore().byId("actual").setValueState(sap.ui.core.ValueState.None);
				oData.destDifa = diffVal;
				oData.destActa = actualVal;
				fragmentLoaded.getModel("handleDiff").setData(oData);
				sap.ui.getCore().byId("onHandleDiff").setEnabled(true);
			} else {
				sap.ui.getCore().byId("onHandleDiff").setEnabled(false);
				// sap.ui.getCore().byId("actual").setValueState(sap.ui.core.ValueState.Error);
			}
		},

		setDiffModel: function(oItem, diffFragment) {
			// for the putaway diff process
			var dBin = oItem.Nltyp + "  " + oItem.Nlber + "  " + oItem.Nlpla;
			var destTarget = oItem.DestTarga;
			var destActa = oItem.DestActa;
			var destDifa = oItem.DestDifa;
			var oItemList = {
				matId: oItem.Matnr,
				matDesc: oItem.Maktx,
				dBin: dBin,
				destActa: destActa,
				destTarget: destTarget,
				destDifa: destDifa
			};
			return oItemList;
		},
		
		setDelItemsDiffModel: function(oItem, diffragment) {
				var destTarget = oItem.TargQty;
				if (oItem.TargQty === oItem.Lfimg) {
					var oItemList = {
						dBin: "",
						destTarget: destTarget,
						destActa: "0",
						destDifa: "0"
					};
				} else if (oItem.TargQty !== oItem.Lfimg) {
					var diffaVal = oItem.TargQty - oItem.Lfimg;
					oItemList = {
						dBin: "",
						destTarget: destTarget,
						destActa: oItem.Lfimg,
						destDifa: diffaVal
					};
				}
			return oItemList;	
		},

		closeFragment: function(fragment) {
			fragment.close();
		}
	});
});