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

	return BaseController.extend("gss.newWarehouseManage_R1.controller.grShipItems", {
		formatter: formatter,

		onInit: function() {
			this.getView().addEventDelegate({
				onBeforeShow: function(evt) {
					this._router = this.getRouter();
					this.seti18nModel();
					this.inputDetails();
					this.titleSet();
					this.gssCallBreadcrumbs().getMainBreadCrumb(this);
					if (this.getGlobalModel().getProperty("/parentScreen")) {
						this.getView().byId("back").setVisible(true);
					}
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
			this.getView().byId("title").setTitle(this.getGlobalModel().getProperty("/title"));
			this.getView().byId("inputValue").setPlaceholder(Text);
			this.getView().byId("inputValue").setMaxLength(10);

		},
		/* =========================================================== */
		/*Handling Difference function
		  Event handling function when diff button is pressed  */
		/* =========================================================== */
		onHandleDifference: function() {
			// for the putaway diff process
			//OLD CODE var items = this.gssCallFunction().selectedItems(this, "toTable");
			var items = utilities.selectedItems(this, "table");

			if (items.length === 1) {
				//fragment code is Moved to OnInit 
				var objects = utilities.getItems(this, "table", "itemList"),
					oItem = objects.getProperty();
				if (oItem.Posnr !== this._item) {
					var newItemSelected = "X";
					this._item = oItem.Posnr;
				}
				var oItemList = this.gssDifferenceFunction().setShipItemsDiffModel(oItem, this.fragmentLoaded);
				var oModel = new JSONModel(oItemList);// Json Model creation and setting data
				this.fragmentLoaded.setModel(oModel, "handleDiff");//setting model to fragment
				this.fragmentLoaded.open();//open fragment
			} else if (items.length === 0) {
				MessageToast.show(this.geti18n("toastItemSel"));//warning toast
			} else if (items.length > 1) {
				MessageToast.show(this.geti18n("toastSelMat"));//warning toast
			}
		},
        /* =========================================================== */
		/*Handling Selection on table function
		 * @param {object} [this]  oView
		 * @param {string} [""] control ID*/
		/* =========================================================== */
		onHandleSelection: function() {
			this._selectedItem = utilities.selectedItems(this, "table");//To get selected items
		},
        /* =========================================================== */
		/*Handling Difference function
		  liveChange handling function Actual value given  */
		/* =========================================================== */
		onHandleActual: function(oEvent) {
			var actualVal = oEvent.getParameter("newValue");
			var objects = utilities.getItems(this, "table", "itemList");
			this.modelObjects = objects.getProperty();
			this.gssDifferenceFunction().diffShipCalculation(actualVal, this.modelObjects.TargQty, this.fragmentLoaded, this.getGlobalModel().getProperty(
				"/viewId") + "diff");
		},
		/* =========================================================== */
		/*Handling Difference function
		  Event handling function when ok is pressed  */
		/* =========================================================== */
		onDiffConfirm: function() {
			var destTarget = this.fragmentLoaded.getModel("handleDiff").getData().destTarget;//get Target Quantity from model
			var destActa = sap.ui.core.Fragment.byId(this.getView().getId() + "diff", "actual").getValue();//get Actual Quantity entered from fragment
			var differenceVal = destTarget - destActa;
			var destDifa = differenceVal;
			this.destDifa = "X";
			var sValInd = "Lfimg";
			this._updateTable(destActa, destDifa, destTarget, sValInd);//update the table
		},
        /* =========================================================== */
		/*Handling Difference function
		  Event handling function when cancel is pressed  */
		/* =========================================================== */
		onDiffCancel: function() {
			this.gssFragmentsFunction().closeFragment(this.fragmentLoaded);//closes fragment 
		},
		/* =========================================================== */
		/*Handling updation of differenced quantity
		/* =========================================================== */
		_updateTable: function(destActa, destDifa, destTarget, sProperty, sValue) {
			// for the GR diff process
			var aItems = this.getView().byId("table").getModel("itemList").getData().aItems;
			aItems.forEach(function(oLineData) {
				var selectItemVal = this.getView().byId("table").getSelectedItem().getBindingContext("itemList").getObject().Posnr;
				this.selectVal = selectItemVal;
				if (oLineData.Posnr === selectItemVal) {
					if (sProperty === "Lfimg") {
						oLineData.Lfimg = destActa;
					}
				}
			}.bind(this));
			var aData = this.getView().byId("table").getModel("itemList").getData();
			aData.aItems = aItems;
			this.getView().byId("table").getModel("itemList").setData(aData);
			this.gssFragmentsFunction().closeFragment(this.fragmentLoaded);
		},
		/* =========================================================== */
		/*Handling barcode scan
		/* =========================================================== */
		onHandleScanInput: function(oEvent) {
			utilities.barcodeReader(this, "inputValue","");
			this.iGetInput();
		},
		iGetInput: function(oEvent) {
			var _inputValue = this.getGlobalModel().getProperty("/currentDelNo");
			this.getView().byId("inputValue").setValue(_inputValue);
			this.getView().byId("inputValue").setEnabled(false);
			this.callOdataService().getLoadInq(this, _inputValue, "", "");
		},
		/* =========================================================== */
		/*Handling save of updated items
		*Event handling function when save is pressed
		/* =========================================================== */
		onHandleSave: function() {
			var whenOdataCall = this.callOdataService().onSaveItems(this, this._selectedItem, "table", "I");
			whenOdataCall.done(function() {
				MessageToast.show(this.geti18n(this.getUpdateToast()));
			}.bind(this));
		}

	});

});