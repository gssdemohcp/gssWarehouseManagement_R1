/*eslint linebreak-style: ["error", "windows"]*/
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"gss/newWarehouseManage_R1/controller/BaseController",
	"sap/ui/model/resource/ResourceModel",
	"gss/newWarehouseManage_R1/model/utilities"
], function(Controller, BaseController, ResourceModel,utilities) {
	"use strict";

	return BaseController.extend("gss.newWarehouseManage_R1.controller.LoadDelivery", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf gss.newWarehouseManage_R1.view.LoadDelivery
		 */
		onInit: function() {
			this.getView().addEventDelegate({
				onBeforeShow: function(evt) {
					this._router = this.getRouter();
					this.seti18nModel(this);
					this.inputDetails();
					this.gssCallBreadcrumbs().getMainBreadCrumb(this);
					if (this.getGlobalModel().getProperty("/parentScreen")) {
						this.getView().byId("inputValue").setValue(this.getGlobalModel().getProperty("/currentDelNo"));
						this.getView().byId("inputValue").setEnabled(false);
						this.getView().byId("back").setVisible(true);
						this.iGetInput();
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
			
		},

		inputDetails: function() {
			var Screen = this.getCurrentScrn();
			var ScreenModel = this.getScreenModel(Screen);
			var Text = this.getView().getModel("i18n").getResourceBundle().getText(ScreenModel.placeHolderLabel);
			this.getView().byId("inputValue").setPlaceholder(Text);
			this.getView().byId("inputValue").setMaxLength(10);
		},

		iGetInput: function(oEvent) {
			var _inputValue = this.getView().byId("inputValue").getValue();
			var huNo = this.getView().byId("scanHUinDel").getValue(); // To get input field value
			if (_inputValue) {
				this.getLoadDetails(_inputValue, huNo);
			}
		},
		onHandleScanInput: function() {
			utilities.barcodeReader(this, "inputValue","");
			this.iGetInput();
		},
		onHandleScanHU: function() {
			utilities.barcodeReader(this, "scanHUinDel","");
			this.iGetInput();
		},

		setFragment: function() {
			var viewId = this.getView().getId();
			this.getGlobalModel().setProperty("/viewId", viewId);
			var loadFragment = this.gssFragmentsFunction().loadFragment(this, "confirmation");
			this.fragmentLoaded = sap.ui.xmlfragment(viewId + "conf",loadFragment, this);
			this.getView().addDependent(this.fragmentLoaded);
		},

		getLoadDetails: function(sInputValue, huNo) {
			var shipNo = sInputValue; // To get input field value
			var huNo = this.getView().byId("scanHUinDel").getValue(); // To get input field value
			var procInd = "X"; // Indicator for Load process
			if (shipNo && huNo) { // To check if both fields has values
				this.getView().byId("scanHUinDel").setValueState(sap.ui.core.ValueState.None); // To set value state for input field
				this.callOdataService().LoadDetails(this, shipNo, huNo, ""); // To pass the input values to the function&nbsp;
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

		load: function() {
			var inputVal = this.getView().byId("inputValue").getValue(); // To get value from the input field
			var modelData = this.getModelData("itemList"),
				LoadInd = "",
				HuStatus = "HU03";
			this.callOdataService().LoadUnloadKeyFields(this, modelData, HuStatus, "");
		},

		loadRevert: function() {
			this.setFragment();
			this.fragmentLoaded.open();
			sap.ui.core.Fragment.byId(this.getGlobalModel().getProperty("/viewId") + "conf", "popup").setText(this.geti18n("undoProc"));
		},

		onConfirm: function() {
			this.gssFragmentsFunction().closeFragment(this.fragmentLoaded);
			var inputVal = this.getView().byId("inputValue").getValue(); // To get value from the input field
			var modelData = this.getModelData("itemList"),
				LoadInd = "",
				HuStatus = "HU04";
			this.callOdataService().LoadUnloadKeyFields(this, modelData, HuStatus, "");
		},

		onCancel: function() {
			this.gssFragmentsFunction().closeFragment(this.fragmentLoaded);
		},
		onExit: function() {
			if (this.fragmentLoaded) {
				this.fragmentLoaded.destroy(true);
			}

		}
		

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf gss.newWarehouseManage_R1.view.LoadDelivery
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf gss.newWarehouseManage_R1.view.LoadDelivery
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf gss.newWarehouseManage_R1.view.LoadDelivery
		 */
		//	onExit: function() {
		//
		//	}

	});

});