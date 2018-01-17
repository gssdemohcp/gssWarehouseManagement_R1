/*eslint linebreak-style: ["error", "windows"]*/
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"gss/newWarehouseManage_R1/controller/BaseController",
	"sap/ui/model/resource/ResourceModel"
], function(Controller, BaseController, ResourceModel) {
	"use strict";

	return BaseController.extend("gss.newWarehouseManage_R1.controller.LoadShipment", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf gss.newWarehouseManage_R1.view.LoadShipment
		 */
		onInit: function() {
			this.getView().addEventDelegate({
				onBeforeShow: function(evt) {
					this._router = this.getRouter();
					this.seti18nModel(this);
					this.inputDetails();
					this.gssCallBreadcrumbs().getMainBreadCrumb(this);
				}.bind(this)
			});

			this._router = this.getRouter();
			this.seti18nModel(this);
			this.inputDetails();
			this.getGlobalModel().setProperty("/currentView", this);
			this.setFragment();
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
			if (_inputValue) {
				this.getLoadDetails(_inputValue);
			}
		},

		setFragment: function() {
			var loadFragment = this.gssFragmentsFunction().loadFragment(this, "confirmation");
			this.fragmentLoaded = sap.ui.xmlfragment(loadFragment, this);
			this.getView().addDependent(this.fragmentLoaded);
		},

		getLoadDetails: function(sInputValue) {
			var shipNo = sInputValue; // To get input field value
			var huNo = this.getView().byId("scanHUDel").getValue(); // To get input field value
			var procInd = "X"; // Indicator for Load process
			var filterFields = this.getFilterFields(); 
			if (shipNo && huNo) { // To check if both fields has values
				this.getView().byId("scanHUDel").setValueState(sap.ui.core.ValueState.None); // To set value state for input field
				// ******************************* To get filters from model ***********************************
				filterFields.Tknum = sInputValue,
				filterFields.Exidv = huNo,
				filterFields.ProcInd = "",
				filterFields.Lgnum = this.getGlobalModel().getProperty("/currentLgnum");
				// ******************************* To get filters from model ***********************************
				this.gssCallFunction().populateModelBuild(this); // To pass the input values to the function&nbsp;
			} else if (shipNo && !huNo) { // To check if one field is empty
			// ******************************* To get filters from model ***********************************
				filterFields.Tknum = sInputValue,
				filterFields.Exidv = huNo,
				filterFields.ProcInd = procInd,
				filterFields.Lgnum = this.getGlobalModel().getProperty("/currentLgnum");
				// ******************************* To get filters from model ***********************************
				this.gssCallFunction().populateModelBuild(this); // To pass input values with indicator when a field is empty
			} else if (!shipNo && !huNo) { // To check if both fields are empty
				this.getView().byId("inputValue").setPlaceholder("Enter Shipment *"); // To set placeholder for input field
				this.getView().byId("inputValue").setMaxLength(10);
				this.getView().byId("scanHUDel").setPlaceholder("Enter Handling Unit *"); // To set placeholder for input field&nbsp;
				this.getView().byId("scanHUDel").setMaxLength(20);
			} else if (!shipNo && huNo) { // To check if one field is empty
				this.getView().byId("inputValue").setPlaceholder("Enter Shipment *"); // To set placeholder for input field
				this.getView().byId("inputValue").setMaxLength(10);
			}
		},

		load: function() {
			var inputVal = this.getView().byId("inputValue").getValue(); // To get value from the input field
			var modelData = this.getModelData("itemList"),
				keyFieldProperties = this.getKeyFields();
				keyFieldProperties.Vbeln = modelData.aItems[0].Vbeln;
				keyFieldProperties.Exidv = modelData.aItems[0].Exidv;
				keyFieldProperties.Exida = modelData.aItems[0].Exida;
				keyFieldProperties.Tknum = modelData.aItems[0].Tknum;
				keyFieldProperties.LoadInd = "";
				keyFieldProperties.HuStatus = "HU03";
				keyFieldProperties.Lgnum = this.getGlobalModel().getProperty("/currentLgnum");
				keyFieldProperties.ProcInd = "";
			this.gssKeyFieldsFunction().buildKeyFields(this);
		},

		loadRevert: function() {
			this.fragmentLoaded.open();
			sap.ui.getCore().byId("popup").setText("Are you sure you want to undo the process?");
		},

		onConfirm: function() {
			this.gssFragmentsFunction().closeFragment(this.fragmentLoaded);
			var inputVal = this.getView().byId("inputValue").getValue(); // To get value from the input field
			var modelData = this.getModelData("itemList"),
				keyFieldProperties = this.getKeyFields();
				keyFieldProperties.Vbeln = modelData.aItems[0].Vbeln;
				keyFieldProperties.Exidv = modelData.aItems[0].Exidv;
				keyFieldProperties.Exida = modelData.aItems[0].Exida;
				keyFieldProperties.Tknum = modelData.aItems[0].Tknum;
				keyFieldProperties.LoadInd = "";
				keyFieldProperties.HuStatus = "HU04";
				keyFieldProperties.Lgnum = this.getGlobalModel().getProperty("/currentLgnum");
				keyFieldProperties.ProcInd = "";
			this.gssKeyFieldsFunction().buildKeyFields(this);
		},

		onCancel: function() {
				this.gssFragmentsFunction().closeFragment(this.fragmentLoaded);
			}
			/**
			 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
			 * (NOT before the first rendering! onInit() is used for that one!).
			 * @memberOf gss.newWarehouseManage_R1.view.LoadShipment
			 */
			//	onBeforeRendering: function() {
			//
			//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf gss.newWarehouseManage_R1.view.LoadShipment
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf gss.newWarehouseManage_R1.view.LoadShipment
		 */
		//	onExit: function() {
		//
		//	}

	});

});