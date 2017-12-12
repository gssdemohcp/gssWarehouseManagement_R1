/*eslint linebreak-style: ["error", "windows"]*/
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"gss/newWarehouseManage_R1/controller/BaseController",
	"gss/newWarehouseManage_R1/model/formatter"

], function(Controller, BaseController,formatter) {
	"use strict";

	return BaseController.extend("gss.newWarehouseManage_R1.controller.picking", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf gss.newWarehouseManage_R1.view.picking
		 */
		onInit: function() {
			var that = this;
			this.getView().addEventDelegate({
				onBeforeShow: function(evt) {
					that._router = that.getRouter();
					that.inputDetails();
					that.gssCallBreadcrumbs().getMainBreadCrumb(that);
				}
			});
		},

		inputDetails: function() {
			
			this.getView().byId("inputValue").setPlaceholder("Enter Transfer order");
			this.getView().byId("inputValue").setMaxLength(10);
			// this.getView().byId("inputValue").setValueState(sap.ui.core.ValueState.Error);
		},

		iGetInput: function(oEvent){
			var _inputValue = this.getView().byId("inputValue").getValue();
			if(_inputValue) {
				this.getPickingMaterial(_inputValue);
			}
		},

		getPickingMaterial: function(sInputValue){
			//Read picking material from backend
			var oWhenCallReadIsDone = this.gssCallFunction().LoadMaterial(this, sInputValue);

			//code end -selvan
		},
		pickingConfirm: function() {
			var selectedItems = this.gssCallFunction().confirmItems(this);
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf gss.newWarehouseManage_R1.view.picking
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf gss.newWarehouseManage_R1.view.picking
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf gss.newWarehouseManage_R1.view.picking
		 */
		//	onExit: function() {
		//
		//	}

	});

});