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
		onInit: function() {
			this.getView().addEventDelegate({
				onBeforeShow: function(evt) {
					this._router = this.getRouter();
					this.seti18nModel();
					this.inputDetails();
					this.gssCallBreadcrumbs().getMainBreadCrumb(this);
					if (this.getGlobalModel().getProperty("/parentScreen")) {
						this.getView().byId("inputValue").setValue(this.getGlobalModel().getProperty("/currentDelNo"));
						this.getView().byId("inputValue").setEnabled(false);
						this.getView().byId("back").setEnabled(true);
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
			this.seti18nModel();
			this.inputDetails();
			this.getGlobalModel().setProperty("/currentView", this);
			if (this.getGlobalModel().getProperty("/parentScreen")) {
				this.getView().byId("inputValue").setValue(this.getGlobalModel().getProperty("/currentDelNo"));
				this.getView().byId("inputValue").setEnabled(false);
			}
			
		},

		seti18nModel: function() {
			// set i18n model on view
			var i18nModel = new ResourceModel({
				bundleName: "gss.newWarehouseManage_R1.i18n.i18n"
			});
			this.getView().setModel(i18nModel, "i18n");
		},

		inputDetails: function() {
			var _screen = this.getCurrentScrn();
			var _screenModel = this.getScreenModel(_screen);
			var _text = this.getView().getModel("i18n").getResourceBundle().getText(_screenModel.placeHolderLabel);
			this.getView().byId("inputValue").setPlaceholder(_text);
			this.getView().byId("inputValue").setMaxLength(10);
		},

		iGetInput: function(oEvent) {
			var _inputValue = this.getView().byId("inputValue").getValue();
			if (_inputValue) {
				this.getunloadDetails(_inputValue);
			}
		},

		setFragment: function() {
			var viewId = this.getView().getId();
			this.getGlobalModel().setProperty("/viewId", viewId);
			var loadFragment = this.gssFragmentsFunction().loadFragment(this, "confirmation");
			this.fragmentLoaded = sap.ui.xmlfragment(viewId,loadFragment, this);
			this.getView().addDependent(this.fragmentLoaded);
		},

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

		unload: function() {
			var inputVal = this.getView().byId("inputValue").getValue(); // To get value from the input field
			var modelData = this.getModelData("itemList"),
				LoadInd = "X",
				HuStatus = "HU04";
			this.callOdataService().LoadUnloadKeyFields(this, modelData, HuStatus, LoadInd);
		},

		unloadRevert: function() {
			this.setFragment();
			this.fragmentLoaded.open();
			sap.ui.core.Fragment.byId(this.getGlobalModel().getProperty("/viewId") + "conf", "popup").setText(this.geti18n("undoProc"));
		},

		onConfirm: function() {
			this.gssFragmentsFunction().closeFragment(this.fragmentLoaded);
			var inputVal = this.getView().byId("inputValue").getValue(); // To get value from the input field
			var modelData = this.getModelData("itemList"),
				LoadInd = "X",
				HuStatus = "HU03";
			this.callOdataService().LoadUnloadKeyFields(this, modelData, HuStatus, LoadInd);
		},

		onCancel: function() {
			this.gssFragmentsFunction().closeFragment(this.fragmentLoaded);
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