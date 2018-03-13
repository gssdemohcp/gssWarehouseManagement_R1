/*eslint linebreak-style: ["error", "windows"]*/
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"gss/newWarehouseManage_R1/controller/BaseController",
	"sap/ui/model/resource/ResourceModel"
], function(Controller, BaseController, ResourceModel) {
	"use strict";

	return BaseController.extend("gss.newWarehouseManage_R1.controller.UnloadShipment", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf gss.newWarehouseManage_R1.view.UnloadShipment
		 */
		// ================================================================================
		// This method is called first and is executed first in the controller's lifecycle
		// ================================================================================
		onInit: function() {
			this.getView().addEventDelegate({
				onBeforeShow: function(evt) {
					this._router = this.getRouter(); // calling the router initialization function
					this.seti18nModel(this); // to set the resource bundle properties for the view
					this.inputDetails(); // to get input details from the view
					this.gssCallBreadcrumbs().getMainBreadCrumb(this); // to get input details from the view
					if (this.getGlobalModel().getProperty("/parentScreen")) { // to get parent screen properties from Global model
						this.getView().byId("inputValue").setValue(this.getGlobalModel().getProperty("/currentDelNo")); // to set input value to global model property
						this.getView().byId("inputValue").setEnabled(false);
						this.getView().byId("back").setEnabled(true);
						this.iGetInput(); // odata function call to get backend response
					}
					else {
						this.getView().byId("inputValue").setValue("");
						this.getView().byId("inputValue").setEnabled(true);
						this.getView().byId("back").setVisible(false);
					}
				}.bind(this)
			});
			this._router = this.getRouter();
			this.seti18nModel(this);
			this.inputDetails();
			this.getGlobalModel().setProperty("/currentView", this);
			if (this.getGlobalModel().getProperty("/parentScreen")) {
				this.getView().byId("inputValue").setValue(this.getGlobalModel().getProperty("/currentDelNo"));
				this.getView().byId("inputValue").setEnabled(false);
			}
		},
		
		// ================================================================
		// method to get current screen model & resource bundle properties
		// ================================================================
		inputDetails: function() {
			var Screen = this.getCurrentScrn(); // function call to get current screen value
			var ScreenModel = this.getScreenModel(Screen); // function call to get model set to current screen
			var Text = this.getView().getModel("i18n").getResourceBundle().getText(ScreenModel.placeHolderLabel); // to set resource bundle properties
			this.getView().byId("inputValue").setPlaceholder(Text); // to set placeholder to input field
			this.getView().byId("inputValue").setMaxLength(10); // to set length for input field
		},

		// =======================================================
		// method to get input field value and perform odata call
		// =======================================================
		iGetInput: function(oEvent) {
			var _inputValue = this.getView().byId("inputValue").getValue(); // To get input field value
			if (_inputValue) {
				this.getunloadDetails(_inputValue);
			}
		},
		
		// ============================================
		// method to pass barocde value to input field
		// ============================================
		onHandleScanInput:function(){
			utilities.barcodeReader(this, "inputValue",""); // function call to set barcode value to input field
		    this.iGetInput();
		},

		// ============================================
		// method to pass barocde value to input field
		// ============================================
		onHandleScanHU:function(){
			utilities.barcodeReader(this, "scanHUinDel",""); // function call to set barcode value to input field
		    this.iGetInput();
		},

		// ==========================================
		// method call to bind fragment to that view
		// ==========================================
		setFragment: function() {
			var viewId = this.getView().getId(); // to get the id of the view
			this.getGlobalModel().setProperty("/viewId", viewId); // to set the view id to the corresponding global model property
			var loadFragment = this.gssFragmentsFunction().loadFragment(this, "confirmation"); // to load fragments
			this.fragmentLoaded = sap.ui.xmlfragment(viewId,loadFragment, this); // to set id to the fragment
			this.getView().addDependent(this.fragmentLoaded); // to add the loaded fragment to the view
		},

		// =========================================================
		// method to get input field details and send to odata call
		// =========================================================
		getunloadDetails: function(sInputValue) {
			var shipNo = sInputValue; // To get input field value
			var huNo = this.getView().byId("scanHUunDel").getValue(); // To get input field value
			var hu = this.getView().getModel("i18n").getResourceBundle().getText("EnterHU");
			var ship = this.getView().getModel("i18n").getResourceBundle().getText("EnterShip");
			var procInd = "Y"; // Indicator to get data in Unload process
			var LoadInd = "X"; // Indicator for Unload process
			if (shipNo && huNo) { // To check if both fields has values
				this.getView().byId("scanHUunDel").setValueState(sap.ui.core.ValueState.None); // To set value state for input field
				this.callOdataService().UnloadDetails(this, shipNo, huNo, "", LoadInd);
				// this.gssCallFunction().UnloadDetails(this, shipNo, huNo, procInd, LoadInd); // To pass the input values to the function&nbsp;
			} else if (shipNo && !huNo) { // To check if one field is empty
				this.callOdataService().UnloadDetails(this, shipNo, huNo, procInd, "");
				// this.gssCallFunction().UnloadDetails(this, shipNo, huNo, procInd); // To pass input values with indicator when a field is empty
			} else if (!shipNo && !huNo) { // To check if both fields are empty
				this.getView().byId("inputValue").setPlaceholder(ship); // To set placeholder for input field
				this.getView().byId("inputValue").setMaxLength(10);
				this.getView().byId("scanHUunDel").setPlaceholder(hu); // To set placeholder for input field&nbsp;
				this.getView().byId("scanHUunDel").setMaxLength(20);
			} else if (!shipNo && huNo) { // To check if one field is empty
				this.getView().byId("inputValue").setPlaceholder(ship); // To set placeholder for input field
				this.getView().byId("inputValue").setMaxLength(10);
			}
		},

		// ==================================
		// function call to unload materials
		// ==================================
		unload: function() {
			var inputVal = this.getView().byId("inputValue").getValue(); // To get value from the input field
			var modelData = this.getModelData("itemList"), // to get data from the model bound to the view
				LoadInd = "X",
				HuStatus = "HU04";
			this.callOdataService().LoadUnloadKeyFields(this, modelData, HuStatus, LoadInd); // to pass the retrieved data as keyfields for odata call
		},

		// ===========================================
		// function call to revert the unload process
		// ===========================================
		unloadRevert: function() {
			this.setFragment(); // function call to set fragment to the view
			this.fragmentLoaded.open(); // to open the loaded fragment
			sap.ui.core.Fragment.byId(this.getGlobalModel().getProperty("/viewId") + "conf", "popup").setText(this.geti18n("undoProc")); // to set text for the loaded fragment
		},

		// ===================================
		// function call to confirm materials 
		// ===================================
		onConfirm: function() {
			this.gssFragmentsFunction().closeFragment(this.fragmentLoaded); // to close the loaded fragment
			var inputVal = this.getView().byId("inputValue").getValue(); // To get value from the input field
			var modelData = this.getModelData("itemList"), // to get data from the model bound to the view
				LoadInd = "X",
				HuStatus = "HU03";
			this.callOdataService().LoadUnloadKeyFields(this, modelData, HuStatus, LoadInd); // to pass the retrieved data as keyfields for odata call
		},

		// ============================================
		// method to close fragment opened in the view
		// ============================================
		onCancel: function() {
			this.gssFragmentsFunction().closeFragment(this.fragmentLoaded); // to close the loaded fragment
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf gss.newWarehouseManage_R1.view.UnloadShipment
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf gss.newWarehouseManage_R1.view.UnloadShipment
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf gss.newWarehouseManage_R1.view.UnloadShipment
		 */
		//	onExit: function() {
		//
		//	}

	});

});