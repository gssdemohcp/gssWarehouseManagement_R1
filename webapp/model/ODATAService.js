sap.ui.define(["sap/ui/base/Object",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel"

], function(Object, Device, JSONModel) {
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

		//reference example url https://blogs.sap.com/2014/05/06/promises-in-native-javascript/
		oCallFunctionPromise: function(sEntityName, oComponent, oUriParameters) {
			return new Promise(function(fnResolve, fnReject) {
				var oModel = oComponent.getModel();
				var fnOnError = function(oError) {
					this._callEnded(false, oComponent);
					fnReject(oError);
				}.bind(this);
				var fnOnSuccess = function(oData, response) {
					this._callEnded(true, oComponent);
					fnResolve(oData, response);
				}.bind(this);
				oModel.callFunction(sEntityName, {
					method: "GET",
					urlParameters: oUriParameters
				});
				oModel.submitChanges({
					success: fnOnSuccess,
					error: fnOnError
				});
			}.bind(this));
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
				error: function(oData) {
					promise.reject(oData);
				}.bind(this)
			});
			return promise;
		},

		// *************** Srini method for odata update begins *****************
		oCallUpdateDeferred: function(sEntityset, oItems, mItem, oView) {
			var oDataModel = oView.getModel();
			var oNewModel = oView.byId("toTable").getModel("itemList").getData().aItems;
			var oStatText = {
				stat: "",
				text: "",
				mItems: ""
			};
			this.aTotStat = [];
			this.errorOccured = "";
			// this.aFilter = [];
			this.finalItem = oItems.Tanum;
			this.finalPos = oItems.Tapos;
			oDataModel.update(sEntityset, oItems, {
				success: function(oData) {
					// MessageToast.show("Transfer Order confirmed successfully");
					oStatText.stat = "S";
					oStatText.mItems = oItems;
					this.aTotStat.push(oStatText);
					//Check the filter message
					this.currentItem = oItems.Tanum;
					this.currentPos = oItems.Tapos;
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
					oView.setModel(oJSONModel, "itemList");
				}.bind(this),
				error: function(oData) {}.bind(this)
			});
		},
		// *************** Srini method for odata update ends *****************

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