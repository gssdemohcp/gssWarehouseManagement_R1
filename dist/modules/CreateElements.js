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
		handleMoreButtons: function(event, oView) {
			var popover = new sap.m.Popover({ // To build popup&nbsp;
				showHeader: false,
				placement: sap.m.PlacementType.Top,
				content: [
					new sap.m.Button({ // To display Logout button inside popup
						text: "Pack", // Text to be dispalyed for the button
						type: sap.m.ButtonType.Transparent, // Button type
						press: function() {
								// press functionality for the button
								this.getGlobalModel().setProperty("/pack", "Packing");
								this.getGlobalModel().setProperty("/shipInd", "P");
								oView.setUpdateToast("packTst");
								utilities.navigateChild("UnPack", oView); // Call to exit() method
							}.bind(oView) // bind the popup to the view
					}),
					new sap.m.Button({ // To display Logout button inside popup
						text: "Unpack", // Text to be dispalyed for the button
						type: sap.m.ButtonType.Transparent, // Button type
						press: function() { // press functionality for the button
								this.getGlobalModel().setProperty("/pack", "UnPacking");
								this.getGlobalModel().setProperty("/shipInd", "U");
								oView.setUpdateToast("unpackTst");
								utilities.navigateChild("UnPack", oView); // Call to exit() method
							}.bind(oView) // bind the popup to the view
					})
					// new sap.m.Button({ // To display Logout button inside popup
					// 	text: "Split", // Text to be dispalyed for the button
					// 	type: sap.m.ButtonType.Transparent, // Button type
					// 	press: function() { // press functionality for the button
					// 			this.onHandleSplit(); // Call to exit() method
					// 		}.bind(this) // bind the popup to the view
					// })
				]
			}).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover'); // CSS style for the popup
			popover.openBy(event.getSource()); // To open popup event
		}

	});
});