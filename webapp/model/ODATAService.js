sap.ui.define(["sap/ui/base/Object",
	"sap/ui/Device"

], function(Object, Device) {
	"use strict";

	return Object.extend("gss.newWarehouseManage_R1.model.GlobalWarehouseManage", {
		// This class provides the service of sending approve/reject requests to the backend. Moreover, it deals with concurrency handling and success dialogs.
		// For this purpose, a singleton instance is created and attached to the application controller as public property oApprover.
		// This is used by the instances of SubControllerForApproval and by the S2-controller (for swipe approve).
		// Note that approvals that are caused by SubControllerForApproval make the app busy while approvals done by swiping do not.
		// This class has the following properties:
		// - _oListSelector: helper class to interact with the master list (fixed)
		// - iOpenCallsCount: number of running approve/reject calls. This attribute is needed because swipe approvals may cause parallel calls.
		// - _mRunningSwipes: maps the IDs of those POs for which a swipe approve is still in process onto true
		// - _bOneWaitingSuccess: true, if at least one approve/reject operation was successfully performed since the last refresh of the master list 
		constructor: function(oApplication) {
			this._iOpenCallsCount = 0;
			this._mRunningSwipes = {};
			this._bOneWaitingSuccess = false;
		},
		//The Deferred object, introduced in jQuery 1.5, 
		//is a chainable utility object created by calling the jQuery.Deferred() method.
		oCallReadDeferred: function(sEntityName, oComponent, aFilters) {
			var promise = jQuery.Deferred(),
				oDataModel = oComponent.getModel();

			oDataModel.read(sEntityName, {
				filters: aFilters,
				success: function(oData) {
					promise.resolve(oData);
				}.bind(this),
				error: function(oData){
					promise.reject(oData);
				}.bind(this)
			});
			return promise;
		},
		//This odata read function write return value into global variable to handle later in UI
		oCallRead: function(sFunction, oOwnerComponent, oGlobalModel) {
			//var oModel = oOwnerComponent.getModel();
			var oRfData;
			oOwnerComponent.read(sFunction, {
				success: function(oRetrievedResult) {
					//return odata result 
					oRfData = oRetrievedResult.results;
					oGlobalModel.setProperty("/oDataResult", oRfData);
					// this.oCallEnd(oGlobalModel);
				},
				error: function(oError) {
					return "";
				}
			});
			return oRfData;
		},

		oCallEnd: function(oGlobalModel) {
			oGlobalModel.setProperty("/oDataResult", this._oResultData);

		},

		//handl multiple request
		oCallDifferedMultiple: function(sFunction, oOwnerComponent) {
			return new Promise(function(fnResolve, fnReject) {
				var oRfData;
				//var sFunction = "/configurationsSet",
				//	oModel = oOwnerComponent.getModel();
				var oModel = oOwnerComponent;
				this._iOpenCallsCount++;
				var fnOnError = function() {
					fnReject();
				}.bind(this);
				var fnOnSuccess = function(oRetrievedResult) {
					//return odata result 
					oRfData = oRetrievedResult.results;
					var oGlobalModel = oOwnerComponent.getModel("globalProperties");
					oGlobalModel.setProperty("/oDataResult", oRfData);
					// this.oCallEnd(oGlobalModel);
					//	this._callEnded(true, oGlobalModel);
					// A success message is only sent when the last request has returned. Thus, when the user sents several requests via swipe, only one
					// message toast is sent; this represents the request that came back as last.
					if (this._iOpenCallsCount === 0) {
						var oResourceBundle = oOwnerComponent.getModel("i18n").getResourceBundle(),
							sSuccessMessage = "";
						sSuccessMessage = oResourceBundle.getText("ymsg.sucssfullCallMessageToast");
						sap.ui.require(["sap/m/MessageToast"], function(MessageToast) {
							MessageToast.show(sSuccessMessage);
						});
					}
					fnResolve();
				}.bind(this);
				oModel.callFunction(sFunction, {
					method: "POST",
					groupId: "oDataCall"
				});

				oModel.submitChanges({
					groupId: "oDataCall",
					success: fnOnSuccess,
					error: fnOnError
				});
			}.bind(this));
		},

		// This method is called when a backend call has finished.
		// bSuccess states whether the call was successful
		// oGlobalModel is the global JSON model of the app
		_callEnded: function(bSuccess, oGlobalModel) {
			// Book-keeping:
			this._iOpenCallsCount--;
			this._bOneWaitingSuccess = bSuccess || this._bOneWaitingSuccess;
			if (this._iOpenCallsCount === 0) { // When we are not waiting for another call
				if (this._bOneWaitingSuccess) { // At least one PO was approved/rejected successfully, therefore the list should be refreshed
					this._bOneWaitingSuccess = false;
				} else {
					oGlobalModel.setProperty("/isBusyApproving", false); // As no refresh is triggered in this case, we reset the busy status immediately.
				}
			}
		}
	});
});