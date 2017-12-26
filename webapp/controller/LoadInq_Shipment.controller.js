sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"gss/newWarehouseManage_R1/controller/BaseController",
	"gss/newWarehouseManage_R1/model/formatter",
	"sap/ui/model/resource/ResourceModel"
], function(Controller, BaseController, formatter, ResourceModel) {
	"use strict";

	return BaseController.extend("gss.newWarehouseManage_R1.controller.LoadInq_Shipment", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf gss.newWarehouseManage_R1.view.LoadInq_Shipment
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
			var si18nName = this.geti18nField(Screen);
			var Text = this.getView().getModel("i18n").getResourceBundle().getText(si18nName);
			this.getView().byId("inputValue").setPlaceholder(Text);
			this.getView().byId("inputValue").setMaxLength(10);
		},
		
		iGetInput: function(oEvent) {
			var _inputValue = this.getView().byId("inputValue").getValue();
			if (_inputValue) {
				// this.getInqDelivery(_inputValue);
			}
		},
		
		getInqShipment: function(sInputValue) {
			this.gssCallFunction().LoadInqShipment(this, sInputValue);
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf gss.newWarehouseManage_R1.view.LoadInq_Shipment
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf gss.newWarehouseManage_R1.view.LoadInq_Shipment
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf gss.newWarehouseManage_R1.view.LoadInq_Shipment
		 */
		//	onExit: function() {
		//
		//	}

	});

});