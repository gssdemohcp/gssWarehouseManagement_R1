/*eslint linebreak-style: ["error", "windows"]*/
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"gss/newWarehouseManage_R1/controller/BaseController",
	"gss/newWarehouseManage_R1/model/formatter",
	"gss/newWarehouseManage_R1/model/utilities"

], function(Controller, BaseController, formatter, utilities) {
	"use strict";

	return BaseController.extend("gss.newWarehouseManage_R1.controller.picking", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf gss.newWarehouseManage_R1.view.picking
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
					this.setPageTitle(); // to set page title for the view
					this.gssCallBreadcrumbs().getMainBreadCrumb(this); // to call the breadcrumbs for the view
					if (this.getGlobalModel().getProperty("/parentScreen")) { // to get parent screen properties from Global model
						this.getView().byId("inputValue").setValue(this.getGlobalModel().getProperty("/currentDelNo")); // to set input value to global model property
						this.getView().byId("inputValue").setEnabled(false);
						this.getView().byId("back").setVisible(true);
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
			this.setFragment();
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
		
		
		setFragment: function() {
			var viewId = this.getView().getId();
			var loadMsgPopFragment = this.gssFragmentsFunction().loadFragment(this, "msgPopOver");
			this.msgFragmentLoaded = sap.ui.xmlfragment(viewId + "msgPop", loadMsgPopFragment, this);
			this.getView().addDependent(this.fragmentLoaded);
		},
		
		// =================================================
		// method to get selected row(s) details from table
		// =================================================
		onHandleSelection: function() {
			this.selItems = utilities.selectedItems(this, "toTable"); // function call to get selected rows from table
		},

		// =======================================================
		// method to get input field value and perform odata call
		// =======================================================
		iGetInput: function(oEvent) {
			var _inputValue = this.getView().byId("inputValue").getValue(); // to get input field value 
			if (_inputValue) {
				var whenOdataCall = this.callOdataService().getMaterial(this, _inputValue); // odata function call with input field to get response from backend
				whenOdataCall.done(function() {
						this.getView().byId("toTable").setVisible(true); 
					}.bind(this)
				);
			}
		},
		
		// ============================================
		// method to pass barocde value to input field
		// ============================================
		onHandleScanInput: function() {
			utilities.barcodeReader(this, "inputValue",""); // function call to set barcode value to input field
			this.iGetInput();
		},

		// ====================================
		// method to display response messages
		// ====================================
		handleMessagePopoverPress: function(oEvent) {
			if (!this.msgFragmentLoaded) {
				this.setFragment();
			}
			this.msgFragmentLoaded.openBy(oEvent.getSource());
		},
		
		// =======================================================
		// method to get details from odata response from backend
		// =======================================================
		getPickingMaterial: function(sInputValue) {
			//Read picking material from backend
			var oWhenCallReadIsDone = this.callOdataService().LoadMaterial(this, sInputValue);
		},
		
		// =================================================================
		// method to confirm materials from table and display response text
		// =================================================================
		pickingConfirm: function() {
			var whenOdataCall = this.callOdataService().confirmItems(this, this.selItems, "toTable"); // odata function call to confirm selected items from table
			whenOdataCall.done(function() {
				MessageToast.show(this.geti18n(this.getUpdateToast())); // Message toast code to display success message from odata response
			}.bind(this));
		},
		
		// ===================================================
		// method to destroy the loaded fragment for the view 
		// ===================================================
		onExit: function() {
			if (this.fragmentLoaded) {
				this.fragmentLoaded.destroy(true); // to destroy the fragments loaded for the view
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