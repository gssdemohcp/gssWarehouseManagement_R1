/*eslint linebreak-style: ["error", "windows"]*/
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"gss/newWarehouseManage_R1/controller/BaseController",
	"sap/ui/model/resource/ResourceModel",
	"gss/newWarehouseManage_R1/model/utilities"
], function(Controller, BaseController, ResourceModel, utilities) {
	"use strict";

	return BaseController.extend("gss.newWarehouseManage_R1.controller.LoadDelivery", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf gss.newWarehouseManage_R1.view.LoadDelivery
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
					this.gssCallBreadcrumbs().getMainBreadCrumb(this); // to call the breadcrumbs for the view
					if (this.getGlobalModel().getProperty("/parentScreen")) { // to get parent screen properties from Global model
						this.getView().byId("inputValue").setValue(this.getGlobalModel().getProperty("/currentDelNo")); // to set input value to global model property
						this.getView().byId("inputValue").setEnabled(false);
						this.getView().byId("scanHUinDel").setValue("");
						this.getView().byId("back").setVisible(true);
						this.iGetInput();
					} else {
						this.getView().byId("scanHUinDel").setValue("");
						this.getView().byId("inputValue").setEnabled(true);
						this.getView().byId("back").setVisible(false);
					}
				}.bind(this)
			});
			this._router = this.getRouter();
			this.seti18nModel(this);
			this.inputDetails();
			this.setFragment();
		},
		// ==========================================
		// method call to bind fragment to that view
		// ==========================================
		setFragment: function() {
			var viewId = this.getView().getId();
			this.getGlobalModel().setProperty("/viewId", viewId);
			var loadFragment = this.gssFragmentsFunction().loadFragment(this, "confirmation");
			this.fragmentLoaded = sap.ui.xmlfragment(viewId + "conf", loadFragment, this);
			this.getView().addDependent(this.fragmentLoaded);

			var loadMsgPopFragment = this.gssFragmentsFunction().loadFragment(this, "msgPopOver");
			this.msgFragmentLoaded = sap.ui.xmlfragment(viewId + "msgPop", loadMsgPopFragment, this);
			this.getView().addDependent(this.msgFragmentLoaded);
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
			var huNo = this.getView().byId("scanHUinDel").getValue(); // To get input field value
			if (_inputValue) {
				this.getLoadDetails(_inputValue, huNo);
			}
		},
		handleMessagePopoverPress: function(oEvent) {
			this.msgFragmentLoaded.openBy(oEvent.getSource());

		},

		// ============================================
		// method to pass barocde value to input field
		// ============================================
		onHandleScanInput: function() {
			utilities.barcodeReader(this, "inputValue", "");
			this.iGetInput();
		},

		// ============================================
		// method to pass barocde value to input field
		// ============================================
		onHandleScanHU: function() {
			utilities.barcodeReader(this, "scanHUinDel", "");
			this.iGetInput();
		},

		
		// =========================================================
		// method to get input field details and send to odata call
		// =========================================================
		getLoadDetails: function(sInputValue, huNo) {
			var shipNo = sInputValue; // To get input field value
			var huNo = this.getView().byId("scanHUinDel").getValue(); // To get input field value
			var procInd = "X"; // Indicator for Load process
			if (shipNo && huNo) { // To check if both fields has values
				this.getView().byId("scanHUinDel").setValueState(sap.ui.core.ValueState.None); // To set value state for input field
				var whenOdataCall = this.callOdataService().LoadDetails(this, shipNo, huNo, "");
				whenOdataCall.done(function(oResult) {
					utilities.loadIndUpdate(oResult.getData().aItems[0], this);

				}.bind(this)); // To pass the input values to the function&nbsp;
			} else if (shipNo && !huNo) { // To check if one field is empty
				this.callOdataService().LoadDetails(this, shipNo, huNo, procInd); // To pass input values with indicator when a field is empty
			} else if (!shipNo && !huNo) { // To check if both fields are empty
				var hdr = this.getView().getModel("i18n").getResourceBundle().getText("EnterDel");
				this.getView().byId("inputValue").setPlaceholder(hdr); // To set placeholder for input field
				this.getView().byId("inputValue").setMaxLength(10);
				var hu = this.getView().getModel("i18n").getResourceBundle().getText("EnterHU");
				this.getView().byId("scanHUinDel").setPlaceholder(hu); // To set placeholder for input field&nbsp;
				this.getView().byId("scanHUinDel").setMaxLength(20);
			} else if (!shipNo && huNo) { // To check if one field is empty
				var hdr1 = this.getView().getModel("i18n").getResourceBundle().getText("EnterDel");
				this.getView().byId("inputValue").setPlaceholder(hdr1); // To set placeholder for input field
				this.getView().byId("inputValue").setMaxLength(10);
			}
		},

		// ================================
		// function call to load materials
		// ================================
		load: function() {
			var inputVal = this.getView().byId("inputValue").getValue(); // To get value from the input field
			var modelData = this.getModelData("itemList"), // to get data from the model bound to the view
				LoadInd = "",
				HuStatus = "HU03";
			var whenOdataCall = this.callOdataService().LoadUnloadKeyFields(this, modelData, HuStatus, "");
			whenOdataCall.done(function(oResult) {
				utilities.loadIndUpdate(oResult.getData().aItems[0], this);

			}.bind(this));
		},

		// =========================================
		// function call to revert the load process
		// =========================================
		loadRevert: function() {
			this.setFragment();
			this.fragmentLoaded.open();
			sap.ui.core.Fragment.byId(this.getView().getId() + "conf", "popup").setText(this.geti18n("undoProc"));
		},

		// ===================================
		// function call to confirm materials 
		// ===================================
		onConfirm: function() {
			this.gssFragmentsFunction().closeFragment(this.fragmentLoaded); // to close the loaded fragment
			var inputVal = this.getView().byId("inputValue").getValue(); // To get value from the input field
			var modelData = this.getModelData("itemList"), // to get data from the model bound to the view
				LoadInd = "",
				HuStatus = "HU04";
			var whenOdataCall = this.callOdataService().LoadUnloadKeyFields(this, modelData, HuStatus, "");
			whenOdataCall.done(function(oResult) {
				utilities.loadIndUpdate(oResult.getData().aItems[0], this);

			}.bind(this));
		},

		// ============================================
		// method to close fragment opened in the view
		// ============================================
		onCancel: function() {
			this.gssFragmentsFunction().closeFragment(this.fragmentLoaded); // to close the loaded fragment
		},

		// ===================================================
		// method to destroy the fragments loaded in the view
		// ===================================================
		onExit: function() {
			if (this.fragmentLoaded) {
				this.fragmentLoaded.destroy(true); // to destroy the loaded fragments
			}
		}

	});

});