sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"gss/newWarehouseManage_R1/controller/BaseController",
	"gss/newWarehouseManage_R1/model/formatter",
	"sap/ui/model/resource/ResourceModel",
	"gss/newWarehouseManage_R1/model/utilities"
], function(Controller, BaseController, formatter, ResourceModel, utilities) {
	"use strict";

	return BaseController.extend("gss.newWarehouseManage_R1.controller.grdelivery", {
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
			this.getGlobalModel().setProperty("/title", this.geti18n("grByDel"));
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
			this.getView().addDependent(this.fragmentLoaded);
		},

		iGetInput: function(oEvent) {
			var _inputValue = this.getView().byId("inputValue").getValue();
			if (_inputValue) {
				this.getView().byId("GRDForm").setBusy(true);
				var whenOdataCall = this.callOdataService().grKeyFields(this, _inputValue);
				whenOdataCall.done(function(oResult) {
					this.checkInd(oResult.getData().aItems[0], "true");
					this.getGlobalModel().setProperty("/currentDelNo", _inputValue);
				}.bind(this));
			}
		},

		onHandleScanInput: function(oEvent) {
			this.callOdataService().barcodeReader(this, "inputValue");
			this.iGetInput();
		},
		/* =========================================================== */
		/*Handling message popover function*/
		/* =========================================================== */
		handleMessagePopoverPress: function(oEvent) {
				if (!this.msgFragmentLoaded) {
				this.setFragment();
			}
			this.msgFragmentLoaded.openBy(oEvent.getSource());//opens fragment

		},
		/* =========================================================== */
		/*Called when unload button pressed*/
		/*navigates to unload page*/
		/* =========================================================== */
		onHandleUnload: function(oEvent) {
			utilities.navigateChild("unloadDelivery", this);// navigateChild: function in utilities for navigating to child views

		},
		/* =========================================================== */
		/*Called when more button pressed*/
		/* =========================================================== */
		handleMore: function(oEvent) {
			this.createElements().handleMoreButtons(oEvent, this);//createElements: function in BaseController to access CreateElements.js
		},
		/* =========================================================== */
		/*Called when items button pressed*/
		/*navigates to Items page*/
		/* =========================================================== */
		onHandleItems: function(event) {

			utilities.navigateChild("grDelItems", this);// navigateChild: function in utilities for navigating to child views
		},
		/* =========================================================== */
		/*Called when ok button pressed on the confirmation fragment*/
		/*Generate TO and Post GR Functionality*/
		/* =========================================================== */
		onConfirm: function() {
			if (this.getGlobalModel().getProperty("/indiTO") === "") {
				this.onHandleGTO();//Generates TO for the Delivery
			} else {
				this.onHandlePost();//Performs GR Post
			}
		},
       /* =========================================================== */
		/*Called when cancel button pressed on the confirmation fragment*/
		/* =========================================================== */
		onConfirmCancel: function() {
			this.onCancel();//closes the confirmation fragment
		},
		/* =========================================================== */
		/*To close the opened fragement*/
		/* =========================================================== */
		onCancel: function() {
			this.gssFragmentsFunction().closeFragment(this.fragmentLoaded);//gssFragmentsFunction:function in BaseController to access Fragments.js
		},
       /* =========================================================== */
		/*To open the Confirmation fragement for Generate TO*/
		/* =========================================================== */
		onGenerateTO: function() {
			if (!this.fragmentLoaded) {
				this.setFragment();//To initialize and add fragment to the view
			}
			this.getView().addDependent(this.fragmentLoaded);
			this.fragmentLoaded.open();//opens the fragment

			sap.ui.core.Fragment.byId(this.getGlobalModel().getProperty("/viewId") + "conf", "popup").setText(this.geti18n("genToPop"));// To set text to confirmaton fragment
		},
        /* =========================================================== */
		/*Function to Generate TO*/
		/* =========================================================== */
		onHandleGTO: function() {
			this.fragmentLoaded.close();//closes the fragment
			this.getView().byId("title").setBusy(true);
			var whenOdataCall = this.callOdataService().handleDelTO(this, "GRDForm", "itemList", "T");//function in BaseController to access GssWarehouseManage.js
			whenOdataCall.done(function() {//Synchronous oData Call
				this.getView().byId("toInd").setText(this.geti18n("available"));
				this.getView().byId("title").setBusy(false);
			}.bind(this));

		},
		/* =========================================================== */
		/*Called when TOEx button pressed */
		/*TO Execution Functionality*/
		/*navigates to Putaway page*/
		/* =========================================================== */
		onHandleTOEx: function() {
			utilities.navigateChild("putaway", this);// navigateChild: function in utilities for navigating to child views
		},
        /* =========================================================== */
		/*To open the Confirmation fragement for Post GR*/
		/* =========================================================== */
		onPostGR: function() {
			if (!this.fragmentLoaded) {
				this.setFragment();//To initialize and add fragment to the view
			}
			this.getView().addDependent(this.fragmentLoaded);
			this.fragmentLoaded.open();//opens the fragment
			sap.ui.core.Fragment.byId(this.getGlobalModel().getProperty("/viewId") + "conf", "popup").setText(this.geti18n("postGrPop"));// To set text to confirmaton fragment

		},
        /* =========================================================== */
		/*Function to Post GR*/
		/* =========================================================== */
		onHandlePost: function() {
			this.fragmentLoaded.close();//closes the fragment
			this.callOdataService().handleDelTO(this, "GRDForm", "itemList", "C");//function in BaseController to access GssWarehouseManage.js

		}

	});

});