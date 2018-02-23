/*eslint linebreak-style: ["error", "windows"]*/
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"gss/newWarehouseManage_R1/controller/BaseController",
	"gss/newWarehouseManage_R1/model/formatter"

], function(Controller, BaseController, formatter) {
	"use strict";

	return BaseController.extend("gss.newWarehouseManage_R1.controller.picking", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf gss.newWarehouseManage_R1.view.picking
		 */
		onInit: function() {
			this.getView().addEventDelegate({
				onBeforeShow: function(evt) {
					this._router = this.getRouter();
					this.seti18nModel(this);
					this.inputDetails();
					this.setPageTitle();
					this.gssCallBreadcrumbs().getMainBreadCrumb(this);
					if (this.getGlobalModel().getProperty("/parentScreen")) {
						this.getView().byId("inputValue").setValue(this.getGlobalModel().getProperty("/currentDelNo"));
						this.getView().byId("inputValue").setEnabled(false);
						this.getView().byId("back").setEnabled(true);
						this.iGetInput();
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
			// this.getView().byId("inputValue").setValueState(sap.ui.core.ValueState.Error);
		},
		onHandleSelection:function(){
			this.selItems = this.callOdataService().selectedItems(this, "toTable");
		},

		iGetInput: function(oEvent) {
			var _inputValue = this.getView().byId("inputValue").getValue();
			if (_inputValue) {
				var whenOdataCall = this.callOdataService().getMaterial(this, _inputValue);
					whenOdataCall.done(function() {
						this.getView().byId("toTable").setVisible(true);
					}.bind(this)

				);
			}
		},
		onHandleScanInput: function() {
			this.callOdataService().barcodeReader(this, "inputValue");
			this.iGetInput();
		},

		getPickingMaterial: function(sInputValue) {
			//Read picking material from backend

			var oWhenCallReadIsDone = this.callOdataService().LoadMaterial(this, sInputValue);

			//code end -selvan
		},
		pickingConfirm: function() {
			var selectedItems = this.callOdataService().confirmItems(this,this.selItems,"toTable");
		},
		onExit: function() {
			if (this.fragmentLoaded) {
				this.fragmentLoaded.destroy(true);
			}

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