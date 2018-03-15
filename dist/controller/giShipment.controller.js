/*eslint linebreak-style: ["error", "windows"]*/
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"gss/newWarehouseManage_R1/controller/BaseController",
	"gss/newWarehouseManage_R1/model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"gss/newWarehouseManage_R1/model/utilities",
	"sap/ui/model/resource/ResourceModel"

], function(Controller, BaseController, formatter, JSONModel, MessageBox, MessageToast, utilities, ResourceModel) {
	"use strict";

	return BaseController.extend("gss.newWarehouseManage_R1.controller.giShipment", {

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
		setFragment: function() {
			var viewId = this.getView().getId();
			this.getGlobalModel().setProperty("/viewId", viewId);
			var loadFragment = this.gssFragmentsFunction().loadFragment(this, "confirmation");
			this.fragmentLoaded = sap.ui.xmlfragment(viewId + "conf", loadFragment, this);
			this.getView().addDependent(this.fragmentLoaded);

			var loadMsgPopFragment = this.gssFragmentsFunction().loadFragment(this, "msgPopOver");
			this.msgFragmentLoaded = sap.ui.xmlfragment(viewId + "msgPop", loadMsgPopFragment, this);
			this.getView().addDependent(this.fragmentLoaded);
		},
		inputDetails: function() {
			var Screen = this.getCurrentScrn();
			var ScreenModel = this.getScreenModel(Screen);
			var Text = this.getView().getModel("i18n").getResourceBundle().getText(ScreenModel.placeHolderLabel);
			this.getGlobalModel().setProperty("/viewCid", this.getView().getId());
			this.getGlobalModel().setProperty("/title", this.geti18n("giShip"));
			this.getView().byId("inputValue").setPlaceholder(Text);
			this.getView().byId("inputValue").setMaxLength(10);
		},
		/* =========================================================== */
		/*Called when an Item is selected in a table*/
		/*Checks the Indicators for the selected item */
		/* =========================================================== */
		onSingleSelectGI: function(oEvent) {
			var len = this.getView().byId("tableGIS").getSelectedItems().length; //length of the selected items
			if (len === 1) { //checks if only one item is selected
				var vbeln = this.getView().byId("tableGIS").getSelectedItem().getBindingContext("delList").getObject().Vbeln; //get Delivery no of the selected item
				this.getGlobalModel().setProperty("/currentDelNo", vbeln);
				var obj = this.getView().byId("tableGIS").getSelectedItem().getBindingContext("delList").getObject();
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
				this.getView().byId("tableGIS").setBusy(true);
				var whenOdataCall = this.callOdataService().getLoadInq(this, _inputValue, "", "");
				whenOdataCall.done(function(oResult) {
						utilities.checkVisible(this);
						this.checkInd(oResult.getData().aItems[0], "");
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
			this.msgFragmentLoaded.openBy(oEvent.getSource()); //opens fragment

		},
		/* =========================================================== */
		/*Called when Load button pressed*/
		/*navigates to Load page*/
		/* =========================================================== */
		onHandleUnload: function(oEvent) {
			utilities.navigateChild("loadDelivery", this); // navigateChild: function in utilities for navigating to child views

		},
		/* =========================================================== */
		/*Called when Items button pressed*/
		/* =========================================================== */
		onHandleItems: function(event) {
			utilities.navigateChild("grShipItems", this); // navigateChild: function in utilities for navigating to child views
		},
		/* =========================================================== */
		/*Called when more button pressed*/
		/* =========================================================== */
		handleMore: function(oEvent) {
			this.createElements().handleMoreButtons(oEvent, this); //createElements: function in BaseController to access CreateElements.js
		},
		/* =========================================================== */
		/*Called when items Ship pressed*/
		/*navigates to Shipment page*/
		/* =========================================================== */
		onHandleShip: function(event) {
			utilities.navigateChild("giShip", this); // navigateChild: function in utilities for navigating to child views
		},
		/* =========================================================== */
		/*Called when ok button pressed on the confirmation fragment*/
		/*Generate TO and Post GI Functionality*/
		/* =========================================================== */
		onConfirm: function() {
			if (this.getGlobalModel().getProperty("/indiTO") === "") {
				this.onHandleGTO(); //Generates TO for the Delivery
			} else {
				this.onHandlePost(); //Performs GI Post
			}
		},
		/* =========================================================== */
		/*Called when cancel button pressed on the confirmation fragment*/
		/* =========================================================== */
		onConfirmCancel: function() {
			this.onCancel(); //closes the confirmation fragment
		},
		/* =========================================================== */
		/*To close the opened fragement*/
		/* =========================================================== */
		onCancel: function() {
			this.gssFragmentsFunction().closeFragment(this.fragmentLoaded); //gssFragmentsFunction:function in BaseController to access Fragments.js
		},
		/* =========================================================== */
		/*To open the Confirmation fragement for Generate TO*/
		/* =========================================================== */
		onGenerateTO: function() {
			if (!this.fragmentLoaded) {
				this.setFragment(); //To initialize and add fragment to the view
			}
			this.getView().addDependent(this.fragmentLoaded);
			this.fragmentLoaded.open(); //opens the fragment
			sap.ui.core.Fragment.byId(this.getView().getId() + "conf", "popup").setText(this.geti18n("genToPop"));
		},
		/* =========================================================== */
		/*Function to Generate TO*/
		/* =========================================================== */
		onHandleGTO: function() {
			this.fragmentLoaded.close();//closes the fragment
			var whenOdataCall = this.callOdataService().handleShipTO(this, "tableGIS", "delList", "T"); //function in BaseController to access GssWarehouseManage.js
			whenOdataCall.done(function() {//Synchronous oData Call
				this.getView().byId("GItoInd").setText(this.geti18n("available"));
			}.bind(this));

		},
		/* =========================================================== */
		/*Called when TOEx button pressed */
		/*TO Execution Functionality*/
		/*navigates to Picking page*/
		/* =========================================================== */
		onHandleTOEx: function() {
			utilities.navigateChild("picking", this);// navigateChild: function in utilities for navigating to child views
		},
        /* =========================================================== */
		/*To open the Confirmation fragement for Post GI*/
		/* =========================================================== */
		onPostGI: function() {
			if (!this.fragmentLoaded) {
				this.setFragment();//To initialize and add fragment to the view
			}
			this.getView().addDependent(this.fragmentLoaded);
			this.fragmentLoaded.open();//opens the fragment
			sap.ui.core.Fragment.byId(this.getView().getId() + "conf", "popup").setText(this.geti18n("postGIPop"));// To set text to confirmaton fragment

		},
        /* =========================================================== */
		/*Function to Post GI*/
		/* =========================================================== */
		onHandlePost: function() {
			this.fragmentLoaded.close();//closes the fragment
			this.callOdataService().handleShipTO(this, "tableGIS", "delList", "C");//function in BaseController to access GssWarehouseManage.js

		},
	
	});

});