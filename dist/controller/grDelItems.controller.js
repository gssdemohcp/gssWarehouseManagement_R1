sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/resource/ResourceModel",
	"gss/newWarehouseManage_R1/controller/BaseController",
	"gss/newWarehouseManage_R1/model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"gss/newWarehouseManage_R1/model/utilities"
], function(Controller, ResourceModel, BaseController, formatter, JSONModel, MessageToast, utilities) {
	"use strict";

	return BaseController.extend("gss.newWarehouseManage_R1.controller.grDelItems", {

		formatter: formatter,

		onInit: function() {
			this.getView().addEventDelegate({
				onBeforeShow: function(evt) {
					this._router = this.getRouter();
					this.seti18nModel();
					this.inputDetails();
					this.titleSet();
					if (this.getGlobalModel().getProperty("/parentScreen")) {
						this.getView().byId("back").setVisible(true);
					}
					this.gssCallBreadcrumbs().getMainBreadCrumb(this);
					this.iGetInput();
				}.bind(this)
			});

			this._router = this.getRouter();
			this.seti18nModel();
			this.inputDetails();
			this.setFragment();
		},
		setFragment: function() {
			var viewId = this.getView().getId();
			this.getGlobalModel().setProperty("/viewId", viewId);
			var callFragment = this.gssFragmentsFunction().loadFragment(this, "difference");
			this.fragmentLoaded = sap.ui.xmlfragment(viewId + "diff", callFragment, this);
			this.getView().addDependent(this.fragmentLoaded);
			
			var loadMsgPopFragment = this.gssFragmentsFunction().loadFragment(this, "msgPopOver");
			this.msgFragmentLoaded = sap.ui.xmlfragment(viewId + "msgPop", loadMsgPopFragment, this);
			this.getView().addDependent(this.msgFragmentLoaded);
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
			this.getView().byId("itemInput").setPlaceholder(Text);
			this.getView().byId("itemInput").setMaxLength(10);

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
		/*Handling Difference function
		  Event handling function when diff button is pressed  */
		/* =========================================================== */
		onHandleDifference: function() {
			// for the putaway diff process
			//OLD CODE var items = this.gssCallFunction().selectedItems(this, "toTable");
			var items = utilities.selectedItems(this, "tableitems");

			if (items.length === 1) { //check items length
				//fragment code is Moved to OnInit 
				var objects = utilities.getItems(this, "tableitems", "itemList"),
					oItem = objects.getProperty();
				if (oItem.Posnr !== this._item) {
					var newItemSelected = "X";
					this._item = oItem.Posnr;
				}
				var oItemList = this.gssDifferenceFunction().setDelItemsDiffModel(oItem, this.fragmentLoaded, this.getGlobalModel().getProperty(
					"/viewId") + "diff");
				var oModel = new JSONModel(oItemList); // Json Model creation and setting data

				this.fragmentLoaded.setModel(oModel, "handleDiff"); //setting model to fragment
				this.fragmentLoaded.open(); //open fragment
			} else if (items.length === 0) {
				MessageToast.show(this.geti18n("toastItemSel")); //warning toast
			} else if (items.length > 1) {
				MessageToast.show(this.geti18n("toastSelMat")); //warning toast
			}
		},
		/* =========================================================== */
		/*Handling Selection on table function
		 * @param {object} [this]  oView
		 * @param {string} [""] control ID*/
		/* =========================================================== */
		onHandleSelection: function() {
			this._selectedItem = utilities.selectedItems(this, "tableitems"); //To get selected items
		},
		/* =========================================================== */
		/*Handling Difference function
		  liveChange handling function Actual value given  */
		/* =========================================================== */
		onHandleActual: function(oEvent) {
			var actualVal = oEvent.getParameter("newValue");
			var objects = utilities.getItems(this, "tableitems", "itemList");
			this.modelObjects = objects.getProperty();
			this.gssDifferenceFunction().diffShipCalculation(actualVal, this.modelObjects.TargQty, this.fragmentLoaded, this.getGlobalModel().getProperty(
				"/viewId") + "diff");
		},
		/* =========================================================== */
		/*Handling Difference function
		  Event handling function when ok is pressed  */
		/* =========================================================== */
		onDiffConfirm: function() {
			var destTarget = this.fragmentLoaded.getModel("handleDiff").getData().destTarget; //get Target Quantity from model
			var destActa = sap.ui.core.Fragment.byId(this.getView().getId() + "diff", "actual").getValue(); //get Actual Quantity entered from fragment
			var differenceVal = destTarget - destActa;
			var destDifa = differenceVal;
			this.destDifa = "X";
			var sValInd = "Lfimg";
			this._updateTable(destActa, destDifa, destTarget, sValInd); //update the table
		},
		/* =========================================================== */
		/*Handling Difference function
		  Event handling function when cancel is pressed  */
		/* =========================================================== */
		onDiffCancel: function() {
			this.gssFragmentsFunction().closeFragment(this.fragmentLoaded); //closes fragment 
		},
		/* =========================================================== */
		/*Handling updation of differenced quantity
		/* =========================================================== */
		_updateTable: function(destActa, destDifa, destTarget, sProperty, sValue) {
			// for the GR diff process
			var aItems = this.getView().byId("tableitems").getModel("itemList").getData().aItems;
			aItems.forEach(function(oLineData) {
				var selectItemVal = this.getView().byId("tableitems").getSelectedItem().getBindingContext("itemList").getObject().Posnr;
				this.selectVal = selectItemVal;
				if (oLineData.Posnr === selectItemVal) {
					if (sProperty === "Lfimg") {
						oLineData.Lfimg = destActa;
					}
				}
			}.bind(this));
			var aData = this.getView().byId("tableitems").getModel("itemList").getData();
			aData.aItems = aItems;
			this.getView().byId("tableitems").getModel("itemList").setData(aData); //set updated data to view
			this.gssFragmentsFunction().closeFragment(this.fragmentLoaded);
		},
		/* =========================================================== */
		/*Handling barcode scan
		/* =========================================================== */
		onScanUnpack: function(oEvent) {
			utilities.barcodeReader(this, "itemInput", "");
			this.iGetInput();
		},

		iGetInput: function(oEvent) {
			var _inputValue = this.getGlobalModel().getProperty("/currentDelNo");
			this.getView().byId("itemInput").setValue(_inputValue);
			this.getView().byId("itemInput").setEnabled(false);
			var whenOdataCall = this.callOdataService().getLoadInq(this, _inputValue, "", "");
			 whenOdataCall.done(function() {
				utilities.bindMessagePop(this, "");
			}.bind(this));
		},
		/* =========================================================== */
		/*Handling save of updated items
		*Event handling function when save is pressed
		/* =========================================================== */
		onHandleSave: function() {
			var whenOdataCall = this.callOdataService().onSaveItems(this, this._selectedItem, "tableitems", "I");
			whenOdataCall.done(function() {
				MessageToast.show(this.geti18n(this.getUpdateToast()));
			}.bind(this));
		}

	});

});