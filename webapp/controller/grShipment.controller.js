/*eslint linebreak-style: ["error", "windows"]*/
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"gss/newWarehouseManage_R1/controller/BaseController",
	"gss/newWarehouseManage_R1/model/formatter",
	"sap/ui/model/resource/ResourceModel",
	"gss/newWarehouseManage_R1/model/utilities"
], function(Controller, BaseController, formatter, ResourceModel, utilities) {
	"use strict";

	return BaseController.extend("gss.newWarehouseManage_R1.controller.grShipment", {

		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf gss.newWarehouseManage_R1.view.putAway
		 */
		onInit: function() {
			this.getView().addEventDelegate({
				onBeforeShow: function(evt) {
					this._router = this.getRouter();
					this.seti18nModel();
					this.inputDetails();
					this.getBackModelData();
					this.gssCallBreadcrumbs().getMainBreadCrumb(this);
				}.bind(this)
			});

			this._router = this.getRouter();
			this.seti18nModel();
			this.inputDetails();

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
			var _screen = this.getCurrentScrn();
			var _screenModel = this.getScreenModel(_screen);
			var _text = this.getView().getModel("i18n").getResourceBundle().getText(_screenModel.placeHolderLabel);
			this.getGlobalModel().setProperty("/viewCid", this.getView().getId());
			this.getGlobalModel().setProperty("/title", this.geti18n("grByShip"));
			this.getView().byId("inputValue").setPlaceholder(_text);
			this.getView().byId("inputValue").setMaxLength(10);
		},
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
		/* =========================================================== */
		/*Called when an Item is selected in a table*/
		/*Checks the Indicators for the selected item */
		/* =========================================================== */
		onSingleSelect: function(oEvent) {
			var len = this.getView().byId("table").getSelectedItems().length; //length of the selected items
			if (len === 1) { //checks if only one item is selected
				var vbeln = this.getView().byId("table").getSelectedItem().getBindingContext("itemList").getObject().Vbeln; //get Delivery no of the selected item
				this.getGlobalModel().setProperty("/currentDelNo", vbeln);
				var obj = this.getView().byId("table").getSelectedItem().getBindingContext("itemList").getObject();
				this.checkInd(obj, "false"); //function in BaseController to check Indicators
			} else if (len > 1) { //checks if more than one item is selected
				MessageToast.show(this.geti18n("toastOneDel"));
			} else if (len === 0) { //checks if no item is selected
				MessageToast.show(this.geti18n("toastOneDel"));
			}
		},

		iGetInput: function(oEvent) {
			var _inputValue = this.getView().byId("inputValue").getValue();
			if (_inputValue) {
				var whenOdataCall = this.callOdataService().getLoadInq(this, _inputValue, "", "");
				whenOdataCall.done(function(oResult) {
						this.checkInd(oResult.getData().aItems[0], "");
						utilities.checkVisible(this);
						this.getGlobalModel().setProperty("/currentShip", _inputValue);
					}.bind(this)

				);

			}
		},

		onHandleScanInput: function(oEvent) {
			utilities.barcodeReader(this, "inputValue", "");
			this.iGetInput();
		},
		/* =========================================================== */
		/*Handling message popover function*/
		/* =========================================================== */
		handleMessagePopoverPress: function(oEvent) {
			if (!this.msgFragmentLoaded) {
				this.setFragment();
			}
			this.msgFragmentLoaded.openBy(oEvent.getSource());

		},
		/* =========================================================== */
		/*Called when more button pressed*/
		/* =========================================================== */
		handleMore: function(oEvent) {
			this.createElements().handleMoreButtons(oEvent, this);
		},
		/* =========================================================== */
		/*Called when Items button pressed*/
		/* =========================================================== */
		onHandleItems: function(event) {
			utilities.navigateChild("grShipItems", this);
		},
		/* =========================================================== */
		/*Called when Unload button pressed*/
		/*navigates to Unload page*/
		/* =========================================================== */
		onHandleUnload: function(oEvent) {
			utilities.navigateChild("unloadDelivery", this);

		},
		/* =========================================================== */
		/*Called when ok button pressed on the confirmation fragment*/
		/*Generate TO and Post GR Functionality*/
		/* =========================================================== */
		onConfirm: function() {
			if (this.getGlobalModel().getProperty("/indiTO") === "") {
				this.onHandleGTO();
			} else {
				this.onHandlePost();
			}
		},
		/* =========================================================== */
		/*Called when cancel button pressed on the confirmation fragment*/
		/* =========================================================== */
		onConfirmCancel: function() {
			this.onCancel();
		},
		/* =========================================================== */
		/*To close the opened fragement*/
		/* =========================================================== */
		onCancel: function() {
			this.gssFragmentsFunction().closeFragment(this.fragmentLoaded);
		},
		/* =========================================================== */
		/*To open the Confirmation fragement for Generate TO*/
		/* =========================================================== */
		onGenerateTO: function() {
			if (!this.fragmentLoaded) {
				this.setFragment();
			}
			this.getView().addDependent(this.fragmentLoaded);
			this.fragmentLoaded.open();
			sap.ui.core.Fragment.byId(this.getView().getId() + "conf", "popup").setText(this.geti18n("genToPop"));
		},
		/* =========================================================== */
		/*Function to Generate TO*/
		/* =========================================================== */
		onHandleGTO: function() {
			this.gssFragmentsFunction().closeFragment(this.fragmentLoaded);
			this.callOdataService().handleShipTO(this, "table", "itemList", "T");

		},
		/* =========================================================== */
		/*Called when TOEx button pressed */
		/*TO Execution Functionality*/
		/*navigates to Putaway page*/
		/* =========================================================== */
		onHandleTOEx: function() {
			utilities.navigateChild("putaway", this);
		},
		/* =========================================================== */
		/*To open the Confirmation fragement for Post GR*/
		/* =========================================================== */
		onPostGR: function() {
			if (!this.fragmentLoaded) {
				this.setFragment();
			}
			this.getView().addDependent(this.fragmentLoaded);
			this.fragmentLoaded.open();
			sap.ui.core.Fragment.byId(this.getView().getId() + "conf", "popup").setText(this.geti18n("postGIPop"));

		},
		/* =========================================================== */
		/*Function to Post GR*/
		/* =========================================================== */
		onHandlePost: function() {
			this.gssFragmentsFunction().closeFragment(this.fragmentLoaded);
			this.callOdataService().handleShipTO(this, "table", "itemList", "C");

		}

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf gss.newWarehouseManage_R1.view.grShipment
		 */
		//	onInit: function() {
		//
		//	},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf gss.newWarehouseManage_R1.view.grShipment
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf gss.newWarehouseManage_R1.view.grShipment
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf gss.newWarehouseManage_R1.view.grShipment
		 */
		//	onExit: function() {
		//
		//	}

	});

});