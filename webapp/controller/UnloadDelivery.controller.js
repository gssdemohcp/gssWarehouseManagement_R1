/*eslint linebreak-style: ["error", "windows"]*/
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"gss/newWarehouseManage_R1/controller/BaseController",
	"sap/ui/model/resource/ResourceModel"
], function(Controller, BaseController, ResourceModel) {
	"use strict";

	return BaseController.extend("gss.newWarehouseManage_R1.controller.UnloadDelivery", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf gss.newWarehouseManage_R1.view.LoadDelivery
		 */
		onInit: function() {
			this.getView().addEventDelegate({
				onBeforeShow: function(evt) {
					this._router = this.getRouter();
					this.seti18nModel();
					this.inputDetails();
					this.gssCallBreadcrumbs().getMainBreadCrumb(this);
				}.bind(this)
			});

			this._router = this.getRouter();
			this.seti18nModel();
			this.inputDetails();
			this.getGlobalModel().setProperty("/currentView", this);
			this.setFragment();
		},

		seti18nModel: function() {
			// set i18n model on view
			var i18nModel = new ResourceModel({
				bundleName: "gss.newWarehouseManage_R1.i18n.i18n"
			});
			this.getView().setModel(i18nModel, "i18n");
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
				this.getunloadDetails(_inputValue, huNo);
			}
		},

		setFragment: function() {
			var loadFragment = this.gssFragmentsFunction().loadFragment(this, "confirmation");
			this.fragmentLoaded = sap.ui.xmlfragment(loadFragment, this);
			this.getView().addDependent(this.fragmentLoaded);
		},

		getunloadDetails: function(sInputValue, huNo) {
			var shipNo = sInputValue; // To get input field value
			// var huNo = this.getView().byId("scanHUinDel").getValue(); // To get input field value
			var procInd = "Y"; // Indicator to get data in Unload process
			var LoadInd = "X"; // Indicator for Unload process
			if (shipNo && huNo) { // To check if both fields has values
				this.getView().byId("scanHUinDel").setValueState(sap.ui.core.ValueState.None); // To set value state for input field
				this.callOdataService().UnloadDetails(this, shipNo, huNo, "", LoadInd); // To pass the input values to the function&nbsp;
			} else if (shipNo && !huNo) { // To check if one field is empty
				this.callOdataService().UnloadDetails(this, shipNo, huNo, procInd, ""); // To pass input values with indicator when a field is empty
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

		unload: function() {
			var inputVal = this.getView().byId("inputValue").getValue(); // To get value from the input field
			var modelData = this.getModelData("itemList"),
				LoadInd = "X",
				HuStatus = "HU04";
			this.callOdataService().LoadUnloadKeyFields(this, modelData, HuStatus, LoadInd);
		},

		unloadRevert: function() {
			this.fragmentLoaded.open();
			sap.ui.getCore().byId("popup").setText("Are you sure you want to undo the process?");
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