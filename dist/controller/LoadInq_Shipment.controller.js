/*eslint linebreak-style: ["error", "windows"]*/
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"gss/newWarehouseManage_R1/controller/BaseController",
	"gss/newWarehouseManage_R1/model/formatter",
	"sap/ui/model/resource/ResourceModel",
	"gss/newWarehouseManage_R1/model/utilities"
], function(Controller, BaseController, formatter, ResourceModel, utilities) {
	"use strict";

	return BaseController.extend("gss.newWarehouseManage_R1.controller.LoadInq_Shipment", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf gss.newWarehouseManage_R1.view.LoadInq_Shipment
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
					this.getView().byId("inputValue").setValue("");
					var dataModel = this.getView().getModel("itemList");
					if (dataModel) {
						dataModel.setData(null);
						dataModel.updateBindings(true);
					}
				}.bind(this)
			});

			this._router = this.getRouter();
			this.seti18nModel(this);
			this.inputDetails();
			this.getGlobalModel().setProperty("/currentView", this);
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
			var _inputValue = this.getView().byId("inputValue").getValue(); // To get Shipment input value 
			if (_inputValue) {
				this.callOdataService().getLoadInq(this, _inputValue, "", ""); // function call to get deliveries associated to the shipemnt input
			}
		},
		
		// ============================================
		// method to pass barocde value to input field
		// ============================================		
		onHandleScanInput: function(oEvent) {
			utilities.barcodeReader(this, "inputValue",""); // function call to set barcode value to input field
			this.iGetInput();
		}

	});

});